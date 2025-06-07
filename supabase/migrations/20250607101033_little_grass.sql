/*
  # SnippetHub Database Schema

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key, references auth.users)
      - `username` (text, unique)
      - `email` (text)
      - `avatar_url` (text, optional)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `categories`
      - `id` (uuid, primary key)
      - `name` (text)
      - `color` (text)
      - `icon` (text)
      - `user_id` (uuid, references profiles, NULLABLE for defaults)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `collections`
      - `id` (uuid, primary key)
      - `name` (text)
      - `description` (text, optional)
      - `is_public` (boolean)
      - `user_id` (uuid, references profiles, NULLABLE for defaults)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `snippets`
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text, optional)
      - `content` (text)
      - `language` (text)
      - `category_id` (uuid, references categories, optional)
      - `collection_id` (uuid, references collections, optional)
      - `user_id` (uuid, references profiles)
      - `is_public` (boolean)
      - `is_favorite` (boolean)
      - `tags` (text array)
      - `favorites_count` (integer)
      - `views_count` (integer)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  email text NOT NULL,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create categories table (user_id can be NULL for default categories)
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  color text NOT NULL DEFAULT '#6b7280',
  icon text NOT NULL DEFAULT 'folder',
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Create collections table (user_id can be NULL for default collections)
CREATE TABLE IF NOT EXISTS collections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  is_public boolean DEFAULT false,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE collections ENABLE ROW LEVEL SECURITY;

-- Create snippets table
CREATE TABLE IF NOT EXISTS snippets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  content text NOT NULL,
  language text NOT NULL,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  collection_id uuid REFERENCES collections(id) ON DELETE SET NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  is_public boolean DEFAULT false,
  is_favorite boolean DEFAULT false,
  tags text[] DEFAULT '{}',
  favorites_count integer DEFAULT 0,
  views_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE snippets ENABLE ROW LEVEL SECURITY;

-- Create share_links table
CREATE TABLE IF NOT EXISTS share_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  snippet_id uuid REFERENCES snippets(id) ON DELETE CASCADE,
  collection_id uuid REFERENCES collections(id) ON DELETE CASCADE,
  token text UNIQUE NOT NULL,
  expires_at timestamptz,
  max_views integer,
  current_views integer DEFAULT 0,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT share_links_check CHECK (
    (snippet_id IS NOT NULL AND collection_id IS NULL) OR
    (snippet_id IS NULL AND collection_id IS NOT NULL)
  )
);

ALTER TABLE share_links ENABLE ROW LEVEL SECURITY;

-- Create collaboration_sessions table
CREATE TABLE IF NOT EXISTS collaboration_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  snippet_id uuid REFERENCES snippets(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  cursor_position integer DEFAULT 0,
  last_active timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  UNIQUE(snippet_id, user_id)
);

ALTER TABLE collaboration_sessions ENABLE ROW LEVEL SECURITY;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_snippets_user_id ON snippets(user_id);
CREATE INDEX IF NOT EXISTS idx_snippets_category_id ON snippets(category_id);
CREATE INDEX IF NOT EXISTS idx_snippets_collection_id ON snippets(collection_id);
CREATE INDEX IF NOT EXISTS idx_snippets_language ON snippets(language);
CREATE INDEX IF NOT EXISTS idx_snippets_created_at ON snippets(created_at);
CREATE INDEX IF NOT EXISTS idx_snippets_updated_at ON snippets(updated_at);
CREATE INDEX IF NOT EXISTS idx_snippets_is_public ON snippets(is_public);
CREATE INDEX IF NOT EXISTS idx_snippets_is_favorite ON snippets(is_favorite);
CREATE INDEX IF NOT EXISTS idx_categories_user_id ON categories(user_id);
CREATE INDEX IF NOT EXISTS idx_collections_user_id ON collections(user_id);
CREATE INDEX IF NOT EXISTS idx_collections_is_public ON collections(is_public);
CREATE INDEX IF NOT EXISTS idx_share_links_token ON share_links(token);
CREATE INDEX IF NOT EXISTS idx_collaboration_sessions_snippet_id ON collaboration_sessions(snippet_id);

-- RLS Policies for profiles
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- RLS Policies for categories (updated to include defaults)
CREATE POLICY "Users can read categories"
  ON categories
  FOR SELECT
  TO authenticated
  USING (
    user_id IS NULL OR  -- Default categories
    auth.uid() = user_id  -- User's own categories
  );

CREATE POLICY "Users can create own categories"
  ON categories
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own categories"
  ON categories
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own categories"
  ON categories
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for collections (updated to include defaults)
CREATE POLICY "Users can read collections"
  ON collections
  FOR SELECT
  TO authenticated
  USING (
    user_id IS NULL OR  -- Default collections
    auth.uid() = user_id OR  -- User's own collections
    is_public = true  -- Public collections
  );

CREATE POLICY "Users can create own collections"
  ON collections
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own collections"
  ON collections
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own collections"
  ON collections
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for snippets
CREATE POLICY "Users can read own snippets"
  ON snippets
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can read public snippets"
  ON snippets
  FOR SELECT
  TO authenticated
  USING (is_public = true);

CREATE POLICY "Users can create own snippets"
  ON snippets
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own snippets"
  ON snippets
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own snippets"
  ON snippets
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for share_links
CREATE POLICY "Users can read own share links"
  ON share_links
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own share links"
  ON share_links
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own share links"
  ON share_links
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own share links"
  ON share_links
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for collaboration_sessions
CREATE POLICY "Users can read collaboration sessions for snippets they own"
  ON collaboration_sessions
  FOR SELECT
  TO authenticated
  USING (
    snippet_id IN (
      SELECT id FROM snippets WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can read their own collaboration sessions"
  ON collaboration_sessions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create collaboration sessions"
  ON collaboration_sessions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own collaboration sessions"
  ON collaboration_sessions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own collaboration sessions"
  ON collaboration_sessions
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Function to automatically update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_collections_updated_at
  BEFORE UPDATE ON collections
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_snippets_updated_at
  BEFORE UPDATE ON snippets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert default categories
INSERT INTO categories (id, name, color, icon, user_id, created_at, updated_at) VALUES
('11111111-1111-1111-1111-111111111111', 'JavaScript', '#f7df1e', 'javascript', NULL, NOW(), NOW()),
('22222222-2222-2222-2222-222222222222', 'Python', '#3776ab', 'python', NULL, NOW(), NOW()),
('33333333-3333-3333-3333-333333333333', 'React', '#61dafb', 'react', NULL, NOW(), NOW()),
('44444444-4444-4444-4444-444444444444', 'CSS', '#1572b6', 'css', NULL, NOW(), NOW()),
('55555555-5555-5555-5555-555555555555', 'TypeScript', '#3178c6', 'typescript', NULL, NOW(), NOW()),
('66666666-6666-6666-6666-666666666666', 'HTML', '#e34f26', 'html', NULL, NOW(), NOW()),
('77777777-7777-7777-7777-777777777777', 'Node.js', '#339933', 'nodejs', NULL, NOW(), NOW()),
('88888888-8888-8888-8888-888888888888', 'PHP', '#777bb4', 'php', NULL, NOW(), NOW()),
('99999999-9999-9999-9999-999999999999', 'Java', '#ed8b00', 'java', NULL, NOW(), NOW()),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'C++', '#00599c', 'cpp', NULL, NOW(), NOW()),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Go', '#00add8', 'go', NULL, NOW(), NOW()),
('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Rust', '#000000', 'rust', NULL, NOW(), NOW()),
('dddddddd-dddd-dddd-dddd-dddddddddddd', 'SQL', '#336791', 'database', NULL, NOW(), NOW()),
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Shell/Bash', '#89e051', 'terminal', NULL, NOW(), NOW()),
('ffffffff-ffff-ffff-ffff-ffffffffffff', 'Algorithms', '#ff6b6b', 'algorithm', NULL, NOW(), NOW()),
('10101010-1010-1010-1010-101010101010', 'Data Structures', '#4ecdc4', 'data-structure', NULL, NOW(), NOW()),
('20202020-2020-2020-2020-202020202020', 'API', '#ff9ff3', 'api', NULL, NOW(), NOW()),
('30303030-3030-3030-3030-303030303030', 'Testing', '#22c55e', 'test', NULL, NOW(), NOW()),
('40404040-4040-4040-4040-404040404040', 'DevOps', '#ef4444', 'devops', NULL, NOW(), NOW()),
('50505050-5050-5050-5050-505050505050', 'Utilities', '#6366f1', 'utility', NULL, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert default collections
INSERT INTO collections (id, name, description, is_public, user_id, created_at, updated_at) VALUES
('c1111111-1111-1111-1111-111111111111', 'Getting Started', 'Essential code snippets for beginners', true, NULL, NOW(), NOW()),
('c2222222-2222-2222-2222-222222222222', 'Best Practices', 'Code following industry best practices', true, NULL, NOW(), NOW()),
('c3333333-3333-3333-3333-333333333333', 'Common Patterns', 'Frequently used coding patterns and solutions', true, NULL, NOW(), NOW()),
('c4444444-4444-4444-4444-444444444444', 'Quick Fixes', 'Solutions to common programming problems', true, NULL, NOW(), NOW()),
('c5555555-5555-5555-5555-555555555555', 'Advanced Techniques', 'Advanced programming concepts and implementations', true, NULL, NOW(), NOW()),
('c6666666-6666-6666-6666-666666666666', 'Interview Prep', 'Code snippets for technical interviews', true, NULL, NOW(), NOW()),
('c7777777-7777-7777-7777-777777777777', 'Performance Tips', 'Code optimization and performance improvements', true, NULL, NOW(), NOW()),
('c8888888-8888-8888-8888-888888888888', 'Security Snippets', 'Security-focused code examples', true, NULL, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;


-- Create favorites table
CREATE TABLE IF NOT EXISTS favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  snippet_id UUID NOT NULL REFERENCES snippets(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, snippet_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_snippet_id ON favorites(snippet_id);
CREATE INDEX IF NOT EXISTS idx_favorites_created_at ON favorites(created_at);
CREATE INDEX IF NOT EXISTS idx_favorites_user_snippet ON favorites(user_id, snippet_id);

-- Enable RLS (Row Level Security)
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own favorites" ON favorites
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own favorites" ON favorites
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own favorites" ON favorites
  FOR DELETE USING (auth.uid() = user_id);

-- Grant necessary permissions
GRANT ALL ON favorites TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

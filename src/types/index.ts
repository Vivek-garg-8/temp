export interface User {
  id: string;
  email: string;
  username: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface Collection {
  id: string;
  name: string;
  description?: string;
  is_public: boolean;
  user_id: string;
  created_at: string;
  updated_at: string;
  snippets_count?: number;
}

export interface Favorite {
  id: string;
  user_id: string;
  snippet_id: string;
  created_at: string;
  snippet?: {
    id: string;
    title: string;
    language: string;
    content: string;
    description?: string;
    tags?: string[];
  };
}


export interface Snippet {
  id: string;
  title: string;
  description?: string;
  content: string;
  language: string;
  category_id?: string;
  collection_id?: string;
  user_id: string;
  is_public: boolean;
  tags: string[];
  favorites_count: number;
  views_count: number;
  created_at: string;
  updated_at: string;
  category?: Category;
  collection?: Collection;
  user?: User;
  is_favorite?: boolean;
}

export interface ShareLink {
  id: string;
  snippet_id?: string;
  collection_id?: string;
  token: string;
  expires_at?: string;
  max_views?: number;
  current_views: number;
  user_id: string;
  created_at: string;
}

export interface CollaborationSession {
  id: string;
  snippet_id: string;
  user_id: string;
  cursor_position: number;
  last_active: string;
  user?: User;
}

export type ViewMode = 'grid' | 'list';
export type SortBy = 'created_at' | 'updated_at' | 'title' | 'language' | 'favorites_count';
export type SortOrder = 'asc' | 'desc';
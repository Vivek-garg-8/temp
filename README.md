# SnippetHub - Full-Stack Code Snippet Management Application

A modern, production-ready code snippet management application built with React, TypeScript, Supabase, and Tailwind CSS. SnippetHub enables developers to organize, share, and collaborate on code snippets with real-time features and secure sharing capabilities.

## 🚀 Features

### Core Functionality
- **Complete CRUD Operations**: Create, read, update, and delete code snippets
- **Smart Organization**: Categorize snippets with custom categories and collections
- **Advanced Search**: Full-text search across titles, descriptions, languages, and tags
- **Multiple View Modes**: Switch between grid and list views with smooth animations
- **Syntax Highlighting**: Beautiful code presentation with language-specific highlighting

### Real-Time Collaboration
- **Live Editing**: Real-time collaborative editing with WebSocket integration
- **User Presence**: See who's currently viewing or editing snippets
- **Cursor Tracking**: Real-time cursor position synchronization
- **Session Management**: Automatic session cleanup and user state management

### Authentication & Security
- **JWT Authentication**: Secure user authentication with Supabase Auth
- **Row Level Security**: Database-level security policies
- **Protected Routes**: Client-side route protection
- **Profile Management**: User profiles with avatar support

### Sharing & Collaboration
- **Secure Share Links**: Generate time-limited and view-limited share links
- **Public/Private Snippets**: Granular visibility controls
- **Collection Sharing**: Share entire collections of snippets
- **Access Analytics**: Track share link usage and views

### Modern UI/UX
- **Glassmorphism Design**: Modern glass-effect UI with subtle animations
- **Responsive Design**: Optimized for mobile, tablet, and desktop
- **Dark/Light Themes**: Multiple theme support (coming soon)
- **Micro-interactions**: Smooth hover states and transitions
- **Progressive Web App**: PWA capabilities for mobile installation

## 🛠 Tech Stack

### Frontend
- **React 18** - Modern React with hooks and concurrent features
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Zustand** - Lightweight state management
- **React Router** - Client-side routing
- **Lucide React** - Beautiful SVG icons
- **Prism.js** - Syntax highlighting

### Backend & Database
- **Supabase** - Backend-as-a-Service platform
- **PostgreSQL** - Robust relational database
- **Row Level Security** - Database-level security
- **Real-time Subscriptions** - WebSocket-based real-time features
- **Edge Functions** - Serverless functions at the edge

### Development Tools
- **Vite** - Lightning-fast build tool
- **ESLint** - Code linting and formatting
- **TypeScript** - Static type checking
- **PostCSS** - CSS processing and optimization

## 📁 Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── Auth/            # Authentication components
│   ├── Layout/          # Layout components (Header, Sidebar)
│   └── Snippets/        # Snippet-related components
├── store/               # Zustand stores
│   ├── authStore.ts     # Authentication state
│   └── snippetStore.ts  # Snippet management state
├── types/               # TypeScript type definitions
├── lib/                 # Utility libraries
│   └── supabase.ts      # Supabase client configuration
└── App.tsx              # Main application component

supabase/
├── migrations/          # Database migration files
└── functions/           # Supabase Edge Functions
    ├── collaboration/   # Real-time collaboration logic
    └── share-links/     # Secure sharing functionality
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm/yarn
- A Supabase account and project

### Environment Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/snippethub.git
   cd snippethub
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase**
   - Create a new project at [supabase.com](https://supabase.com)
   - Copy your project URL and anon key
   - Run the database migrations from `supabase/migrations/`

4. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

Visit `http://localhost:5173` to see the application running.

### Database Setup

The application requires several database tables. Run the migration file `supabase/migrations/create_schema.sql` in your Supabase SQL editor to set up:

- User profiles and authentication
- Snippet management tables
- Categories and collections
- Sharing and collaboration features
- Row Level Security policies

## 🎯 Key Features Guide

### Snippet Management
- Create snippets with syntax highlighting
- Organize with categories and collections
- Add tags for better searchability
- Mark snippets as public or private

### Real-Time Collaboration
- Join collaborative editing sessions
- See other users' cursors in real-time
- Automatic conflict resolution
- Session cleanup on user disconnect

### Secure Sharing
- Generate secure share links with expiration
- Set view limits for shared content
- Track link usage and analytics
- Share individual snippets or entire collections

### Search & Discovery
- Full-text search across all content
- Filter by categories, collections, and languages
- Sort by various criteria
- Smart search suggestions

## 🔧 Configuration

### Supabase Edge Functions

The application uses Supabase Edge Functions for:

1. **Collaboration** (`/supabase/functions/collaboration/`)
   - Real-time session management
   - User presence tracking
   - Cursor position synchronization

2. **Share Links** (`/supabase/functions/share-links/`)
   - Secure token generation
   - Access control and validation
   - View tracking and analytics

### Environment Variables

| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anonymous key |

## 🚢 Deployment

### Frontend Deployment (Netlify)

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Deploy to Netlify**
   - Connect your GitHub repository
   - Set build command: `npm run build`
   - Set publish directory: `dist`
   - Add environment variables in Netlify dashboard

### Backend Deployment

The backend runs entirely on Supabase:
- Database hosted on Supabase
- Edge Functions deployed automatically
- Authentication handled by Supabase Auth
- Real-time features via Supabase Realtime

## 🧪 Testing

```bash
# Run linting
npm run lint

# Run type checking
npx tsc --noEmit

# Build for production
npm run build
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Supabase](https://supabase.com) for the excellent backend platform
- [Tailwind CSS](https://tailwindcss.com) for the utility-first CSS framework
- [Lucide](https://lucide.dev) for the beautiful icon set
- [Prism.js](https://prismjs.com) for syntax highlighting

## 📞 Support

For support and questions:
- Create an issue on GitHub
- Join our Discord community
- Check the documentation wiki

---

**SnippetHub** - Organize, Share, and Collaborate on Code Snippets ✨
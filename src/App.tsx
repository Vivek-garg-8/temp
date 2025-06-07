import { useEffect, useState, useCallback } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { useSnippetStore } from './store/snippetStore';
import { AuthForm } from './components/Auth/AuthForm';
import { Header } from './components/Layout/Header';
import { Sidebar } from './components/Layout/Sidebar';
import { SnippetList } from './components/Snippets/SnippetList';

function App() {
  const { user, loading, initialize } = useAuthStore();
  const { 
    fetchCategories, 
    fetchCollections, 
    fetchSnippets,
    categories,
    collections,
    loading: snippetLoading 
  } = useSnippetStore();
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');

  // Initialize auth only once
  useEffect(() => {
    console.log('App initializing...');
    initialize();
  }, []); // Remove initialize from dependencies to prevent infinite loop

  // Memoize the data fetching function to prevent infinite re-renders
  const initializeAppData = useCallback(async () => {
    if (!user) return;
    
    console.log('User authenticated, fetching data...', user.id);
    
    try {
      // Fetch all data in parallel
      await Promise.all([
        fetchCategories(),
        fetchCollections(),
        fetchSnippets()
      ]);
      
      console.log('Data fetching completed');
    } catch (error) {
      console.error('Failed to fetch app data:', error);
    }
  }, [user?.id, fetchCategories, fetchCollections, fetchSnippets]); // Only depend on user.id

  // Fetch data when user becomes available
  useEffect(() => {
    if (user) {
      initializeAppData();
    }
  }, [user, initializeAppData]);

  // Debug logging (only when values actually change)
  useEffect(() => {
    if (categories) {
      console.log('Categories updated:', categories.length, categories);
    }
  }, [categories?.length]); // Only depend on length to avoid infinite logs

  useEffect(() => {
    if (collections) {
      console.log('Collections updated:', collections.length, collections);
    }
  }, [collections?.length]); // Only depend on length to avoid infinite logs

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="text-center">
          <div className="inline-flex items-center space-x-2 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-xl">S</span>
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              SnippetHub
            </h1>
          </div>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mx-auto"></div>
          <p className="text-gray-600 dark:text-gray-400 mt-4">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <AuthForm 
        mode={authMode} 
        onToggleMode={() => setAuthMode(authMode === 'signin' ? 'signup' : 'signin')} 
      />
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-indigo-50/30 via-white to-purple-50/30 dark:from-gray-900/50 dark:via-gray-800 dark:to-gray-900/50">
        <Header />
        
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-8">
            <div className="max-w-7xl mx-auto">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-theme-primary mb-2">
                  Your Code Snippets
                </h2>
                <p className="text-theme-secondary">
                  Organize, share, and collaborate on your code snippets
                </p>
                
                {/* Show data status in development */}
                {process.env.NODE_ENV === 'development' && (
                  <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    Categories: {categories?.length || 0} | Collections: {collections?.length || 0}
                  </div>
                )}
              </div>
              <SnippetList />
            </div>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;

import React, { useEffect, useState } from 'react';
import { Heart, Code, Trash2, Copy, Check } from 'lucide-react';
import { useFavoritesStore } from '../store/favoritesStore';
import { useAuthStore } from '../store/authStore';
import { Favorite } from '../types';

export const Favorites: React.FC = () => {
  const { user } = useAuthStore();
  const { favorites, isLoading, error, fetchFavorites, removeFromFavorites } = useFavoritesStore();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchFavorites(user.id);
    }
  }, [user, fetchFavorites]);

  const handleCopyCode = async (content: string, snippetId: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedId(snippetId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      console.error('Failed to copy code:', error);
    }
  };

  const handleRemoveFavorite = async (favorite: Favorite) => {
    if (!user) return;
    
    try {
      await removeFromFavorites(favorite.snippet_id, user.id);
    } catch (error) {
      console.error('Failed to remove favorite:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800/50 rounded-lg p-4">
            <p className="text-red-600 dark:text-red-400">Error: {error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center space-x-3 mb-8">
          <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-pink-600 rounded-lg flex items-center justify-center">
            <Heart className="h-5 w-5 text-white fill-current" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Favorite Snippets
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {favorites.length} {favorites.length === 1 ? 'snippet' : 'snippets'} in your favorites
            </p>
          </div>
        </div>
        
        {favorites.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="h-12 w-12 text-gray-400 dark:text-gray-500" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              No favorite snippets yet
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
              Start building your collection by clicking the heart icon on snippets you want to save for later.
            </p>
          </div>
        ) : (
          <div className="grid gap-6">
            {favorites.map((favorite) => (
              <div 
                key={favorite.id} 
                className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border border-gray-200/50 dark:border-gray-700/50 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-200"
              >
                {/* Snippet Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <Code className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        {favorite.snippet?.title || 'Untitled Snippet'}
                      </h3>
                      <div className="flex items-center space-x-3 mt-1">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300">
                          {favorite.snippet?.language || 'Unknown'}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          Added {new Date(favorite.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => favorite.snippet && handleCopyCode(favorite.snippet.content, favorite.snippet.id)}
                      className="p-2 text-gray-400 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-100/50 dark:hover:bg-gray-700/50 rounded-lg transition-colors duration-200"
                      title="Copy code"
                    >
                      {copiedId === favorite.snippet?.id ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </button>
                    <button
                      onClick={() => handleRemoveFavorite(favorite)}
                      className="p-2 text-gray-400 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-100/50 dark:hover:bg-gray-700/50 rounded-lg transition-colors duration-200"
                      title="Remove from favorites"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Description */}
                {favorite.snippet?.description && (
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {favorite.snippet.description}
                  </p>
                )}

                {/* Tags */}
                {favorite.snippet?.tags && favorite.snippet.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {favorite.snippet.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Code Preview */}
                <div className="relative">
                  <pre className="bg-gray-900 dark:bg-gray-950 text-gray-100 p-4 rounded-lg text-sm overflow-x-auto max-h-64 overflow-y-auto border border-gray-700/50">
                    <code>{favorite.snippet?.content || 'No content available'}</code>
                  </pre>
                  
                  {/* Gradient overlay for long content */}
                  {favorite.snippet?.content && favorite.snippet.content.length > 500 && (
                    <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-gray-900 to-transparent pointer-events-none rounded-b-lg"></div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

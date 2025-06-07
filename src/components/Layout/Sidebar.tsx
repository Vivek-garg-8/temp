import { useMemo, useEffect } from 'react';
import { 
  Code, 
  Folder, 
  Star, 
  Clock, 
  Plus,
  Grid3X3,
  List,
  SortAsc,
  SortDesc
} from 'lucide-react';
import { useSnippetStore } from '../../store/snippetStore';
import { useFavoritesStore } from '../../store/favoritesStore';
import { useAuthStore } from '../../store/authStore';

export const Sidebar = () => {
  const { user } = useAuthStore();
  const {
    snippets,
    categories,
    collections,
    viewMode,
    sortBy,
    sortOrder,
    selectedCategory,
    selectedCollection,
    setViewMode,
    setSorting,
    setSelectedCategory,
    setSelectedCollection,
  } = useSnippetStore();

  const { favorites, fetchFavorites, isLoading: favoritesLoading } = useFavoritesStore();

  // Initialize favorites when user is available
  useEffect(() => {
    if (user && !favoritesLoading && favorites.length === 0) {
      fetchFavorites(user.id);
    }
  }, [user, fetchFavorites, favoritesLoading, favorites.length]);

  // Calculate counts dynamically using useMemo for performance
  const navigationCounts = useMemo(() => {
    if (!snippets || !Array.isArray(snippets)) {
      return { all: 0, favorites: 0, recent: 0 };
    }

    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    return {
      all: snippets.length,
      favorites: favorites.length, // Use favorites from favorites store
      recent: snippets.filter(snippet => {
        const updateDate = new Date(snippet.updated_at || snippet.created_at);
        return updateDate > sevenDaysAgo;
      }).length,
    };
  }, [snippets, favorites.length]);

  // Calculate category counts
  const categoryCounts = useMemo(() => {
    if (!snippets || !Array.isArray(snippets)) return {};
    
    const counts: Record<string, number> = {};
    snippets.forEach(snippet => {
      if (snippet.category_id) {
        counts[snippet.category_id] = (counts[snippet.category_id] || 0) + 1;
      }
    });
    return counts;
  }, [snippets]);

  // Calculate collection counts
  const collectionCounts = useMemo(() => {
    if (!snippets || !Array.isArray(snippets)) return {};
    
    const counts: Record<string, number> = {};
    snippets.forEach(snippet => {
      if (snippet.collection_id) {
        counts[snippet.collection_id] = (counts[snippet.collection_id] || 0) + 1;
      }
    });
    return counts;
  }, [snippets]);

  // Update navigation items to use dynamic counts
  const navigationItems = useMemo(() => [
    { 
      icon: Code, 
      label: 'All Snippets', 
      id: 'all', 
      count: navigationCounts.all,
      onClick: () => {
        setSelectedCategory(null);
        setSelectedCollection(null);
      }
    },
    { 
      icon: Star, 
      label: 'Favorites', 
      id: 'favorites', 
      count: navigationCounts.favorites,
      onClick: () => {
        // Set a special filter for favorites
        setSelectedCategory('favorites');
        setSelectedCollection(null);
      }
    },
    { 
      icon: Clock, 
      label: 'Recent', 
      id: 'recent', 
      count: navigationCounts.recent,
      onClick: () => {
        // Set a special filter for recent
        setSelectedCategory('recent');
        setSelectedCollection(null);
      }
    },
  ], [navigationCounts, setSelectedCategory, setSelectedCollection]);

  const handleSortChange = (newSortBy: typeof sortBy) => {
    const newOrder = sortBy === newSortBy && sortOrder === 'desc' ? 'asc' : 'desc';
    setSorting(newSortBy, newOrder);
  };

  const handleCategoryClick = (categoryId: string) => {
    // Toggle category selection
    if (selectedCategory === categoryId) {
      setSelectedCategory(null);
    } else {
      setSelectedCategory(categoryId);
      setSelectedCollection(null); // Clear collection when selecting category
    }
  };

  const handleCollectionClick = (collectionId: string) => {
    // Toggle collection selection
    if (selectedCollection === collectionId) {
      setSelectedCollection(null);
    } else {
      setSelectedCollection(collectionId);
      setSelectedCategory(null); // Clear category when selecting collection
    }
  };

  return (
    <aside className="w-64 bg-theme-glass border-r border-theme h-[calc(100vh-4rem)] overflow-y-auto">
      <div className="p-6 space-y-6">
        {/* Navigation */}
        <div>
          <h3 className="text-sm font-semibold text-theme-tertiary uppercase tracking-wider mb-3">
            Navigation
          </h3>
          <nav className="space-y-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = 
                (item.id === 'all' && !selectedCategory && !selectedCollection) ||
                (item.id === 'favorites' && selectedCategory === 'favorites') ||
                (item.id === 'recent' && selectedCategory === 'recent');
              
              return (
                <button
                  key={item.id}
                  onClick={item.onClick}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors duration-200 group ${
                    isActive
                      ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                      : 'text-theme-secondary hover:bg-gray-50/50 dark:hover:bg-gray-800/50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`h-4 w-4 transition-colors duration-200 ${
                      isActive 
                        ? 'text-indigo-500 dark:text-indigo-400' 
                        : 'text-theme-tertiary group-hover:text-indigo-500 dark:group-hover:text-indigo-400'
                    }`} />
                    <span className="text-sm font-medium">{item.label}</span>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    isActive
                      ? 'bg-indigo-100 dark:bg-indigo-800/50 text-indigo-600 dark:text-indigo-400'
                      : 'text-theme-tertiary bg-gray-100/50 dark:bg-gray-800/50'
                  }`}>
                    {item.count}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* View Controls */}
        <div>
          <h3 className="text-sm font-semibold text-theme-tertiary uppercase tracking-wider mb-3">
            View
          </h3>
          <div className="space-y-3">
            {/* View Mode */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`flex-1 flex items-center justify-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                  viewMode === 'grid'
                    ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800'
                    : 'bg-theme-surface text-theme-secondary hover:bg-gray-100/50 dark:hover:bg-gray-800/50'
                }`}
              >
                <Grid3X3 className="h-4 w-4" />
                <span className="text-sm">Grid</span>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`flex-1 flex items-center justify-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                  viewMode === 'list'
                    ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800'
                    : 'bg-theme-surface text-theme-secondary hover:bg-gray-100/50 dark:hover:bg-gray-800/50'
                }`}
              >
                <List className="h-4 w-4" />
                <span className="text-sm">List</span>
              </button>
            </div>

            {/* Sort Options */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleSortChange('updated_at')}
                className={`flex items-center justify-center space-x-1 px-2 py-1.5 rounded text-xs transition-all duration-200 ${
                  sortBy === 'updated_at'
                    ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                    : 'bg-theme-surface text-theme-secondary hover:bg-gray-100/50 dark:hover:bg-gray-800/50'
                }`}
              >
                <Clock className="h-3 w-3" />
                <span>Date</span>
                {sortBy === 'updated_at' && (
                  sortOrder === 'desc' ? <SortDesc className="h-3 w-3" /> : <SortAsc className="h-3 w-3" />
                )}
              </button>
              <button
                onClick={() => handleSortChange('title')}
                className={`flex items-center justify-center space-x-1 px-2 py-1.5 rounded text-xs transition-all duration-200 ${
                  sortBy === 'title'
                    ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                    : 'bg-theme-surface text-theme-secondary hover:bg-gray-100/50 dark:hover:bg-gray-800/50'
                }`}
              >
                <span>Name</span>
                {sortBy === 'title' && (
                  sortOrder === 'desc' ? <SortDesc className="h-3 w-3" /> : <SortAsc className="h-3 w-3" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Categories */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-theme-tertiary uppercase tracking-wider">
              Categories
            </h3>
            <button className="p-1 text-theme-tertiary hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors duration-200">
              <Plus className="h-4 w-4" />
            </button>
          </div>
          <div className="space-y-1">
            {categories.map((category) => {
              const count = categoryCounts[category.id] || 0;
              const isSelected = selectedCategory === category.id;
              
              return (
                <button
                  key={category.id}
                  onClick={() => handleCategoryClick(category.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors duration-200 ${
                    isSelected
                      ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                      : 'text-theme-secondary hover:bg-gray-50/50 dark:hover:bg-gray-800/50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                    <span className="text-sm font-medium flex-1 text-left">
                      {category.name}
                    </span>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    isSelected
                      ? 'bg-indigo-100 dark:bg-indigo-800/50 text-indigo-600 dark:text-indigo-400'
                      : 'text-theme-tertiary bg-gray-100/50 dark:bg-gray-800/50'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Collections */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-theme-tertiary uppercase tracking-wider">
              Collections
            </h3>
            <button className="p-1 text-theme-tertiary hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors duration-200">
              <Plus className="h-4 w-4" />
            </button>
          </div>
          <div className="space-y-1">
            {collections.slice(0, 5).map((collection) => {
              const count = collectionCounts[collection.id] || 0;
              const isSelected = selectedCollection === collection.id;
              
              return (
                <button
                  key={collection.id}
                  onClick={() => handleCollectionClick(collection.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors duration-200 ${
                    isSelected
                      ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                      : 'text-theme-secondary hover:bg-gray-50/50 dark:hover:bg-gray-800/50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Folder className={`h-4 w-4 ${
                      isSelected ? 'text-indigo-500 dark:text-indigo-400' : 'text-theme-tertiary'
                    }`} />
                    <span className="text-sm font-medium">{collection.name}</span>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    isSelected
                      ? 'bg-indigo-100 dark:bg-indigo-800/50 text-indigo-600 dark:text-indigo-400'
                      : 'text-theme-tertiary bg-gray-100/50 dark:bg-gray-800/50'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
            {collections.length > 5 && (
              <button className="w-full text-left px-3 py-2 text-xs text-theme-tertiary hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors duration-200">
                +{collections.length - 5} more collections
              </button>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
};

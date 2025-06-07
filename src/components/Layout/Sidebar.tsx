import React from 'react';
import { 
  Code, 
  Folder, 
  Tag, 
  Star, 
  Clock, 
  Plus,
  Grid3X3,
  List,
  SortAsc,
  SortDesc
} from 'lucide-react';
import { useSnippetStore } from '../../store/snippetStore';

export const Sidebar = () => {
  const {
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

  const navigationItems = [
    { icon: Code, label: 'All Snippets', id: 'all', count: 0 },
    { icon: Star, label: 'Favorites', id: 'favorites', count: 0 },
    { icon: Clock, label: 'Recent', id: 'recent', count: 0 },
  ];

  const handleSortChange = (newSortBy: typeof sortBy) => {
    const newOrder = sortBy === newSortBy && sortOrder === 'desc' ? 'asc' : 'desc';
    setSorting(newSortBy, newOrder);
  };

  return (
    <aside className="w-64 bg-white/50 backdrop-blur-lg border-r border-gray-200/50 h-[calc(100vh-4rem)] overflow-y-auto">
      <div className="p-6 space-y-6">
        {/* Navigation */}
        <div>
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Navigation
          </h3>
          <nav className="space-y-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  className="w-full flex items-center justify-between px-3 py-2 text-gray-700 rounded-lg hover:bg-gray-50/50 transition-colors duration-200 group"
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="h-4 w-4 text-gray-500 group-hover:text-indigo-500 transition-colors duration-200" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </div>
                  <span className="text-xs text-gray-400 bg-gray-100/50 px-2 py-1 rounded-full">
                    {item.count}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* View Controls */}
        <div>
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
            View
          </h3>
          <div className="space-y-3">
            {/* View Mode */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`flex-1 flex items-center justify-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                  viewMode === 'grid'
                    ? 'bg-indigo-50 text-indigo-600 border border-indigo-200'
                    : 'bg-gray-50/50 text-gray-600 hover:bg-gray-100/50'
                }`}
              >
                <Grid3X3 className="h-4 w-4" />
                <span className="text-sm">Grid</span>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`flex-1 flex items-center justify-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                  viewMode === 'list'
                    ? 'bg-indigo-50 text-indigo-600 border border-indigo-200'
                    : 'bg-gray-50/50 text-gray-600 hover:bg-gray-100/50'
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
                    ? 'bg-indigo-50 text-indigo-600'
                    : 'bg-gray-50/50 text-gray-600 hover:bg-gray-100/50'
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
                    ? 'bg-indigo-50 text-indigo-600'
                    : 'bg-gray-50/50 text-gray-600 hover:bg-gray-100/50'
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
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
              Categories
            </h3>
            <button className="p-1 text-gray-400 hover:text-indigo-500 transition-colors duration-200">
              <Plus className="h-4 w-4" />
            </button>
          </div>
          <div className="space-y-1">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(
                  selectedCategory === category.id ? null : category.id
                )}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors duration-200 ${
                  selectedCategory === category.id
                    ? 'bg-indigo-50 text-indigo-600'
                    : 'text-gray-700 hover:bg-gray-50/50'
                }`}
              >
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: category.color }}
                />
                <span className="text-sm font-medium flex-1 text-left">
                  {category.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Collections */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
              Collections
            </h3>
            <button className="p-1 text-gray-400 hover:text-indigo-500 transition-colors duration-200">
              <Plus className="h-4 w-4" />
            </button>
          </div>
          <div className="space-y-1">
            {collections.slice(0, 5).map((collection) => (
              <button
                key={collection.id}
                onClick={() => setSelectedCollection(
                  selectedCollection === collection.id ? null : collection.id
                )}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors duration-200 ${
                  selectedCollection === collection.id
                    ? 'bg-indigo-50 text-indigo-600'
                    : 'text-gray-700 hover:bg-gray-50/50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Folder className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium">{collection.name}</span>
                </div>
                <span className="text-xs text-gray-400">
                  {collection.snippets_count || 0}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
};
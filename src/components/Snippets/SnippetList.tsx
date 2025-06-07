import { useEffect, useState } from 'react';
import { useSnippetStore } from '../../store/snippetStore';
import { SnippetCard } from './SnippetCard';
import { SnippetModal } from './SnippetModal';
import { Plus, FileText } from 'lucide-react';
import { Snippet } from '../../types';

export const SnippetList = () => {
  const {
    snippets,
    loading,
    viewMode,
    searchQuery,
    selectedCategory,
    selectedCollection,
    sortBy,
    sortOrder,
    fetchSnippets,
    deleteSnippet,
    toggleFavorite, // Add this
  } = useSnippetStore();

  const [showSnippetModal, setShowSnippetModal] = useState(false);
  const [editingSnippet, setEditingSnippet] = useState<Snippet | null>(null);

  useEffect(() => {
    fetchSnippets();
  }, [fetchSnippets]);

  // Filter and sort snippets
  const filteredSnippets = snippets
    .filter((snippet) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          snippet.title.toLowerCase().includes(query) ||
          snippet.description?.toLowerCase().includes(query) ||
          snippet.language.toLowerCase().includes(query) ||
          snippet.tags?.some(tag => tag.toLowerCase().includes(query))
        );
      }
      return true;
    })
    .filter((snippet) => {
      // Category filter
      if (selectedCategory) {
        return snippet.category_id === selectedCategory;
      }
      return true;
    })
    .filter((snippet) => {
      // Collection filter
      if (selectedCollection) {
        return snippet.collection_id === selectedCollection;
      }
      return true;
    })
    .sort((a, b) => {
      const multiplier = sortOrder === 'asc' ? 1 : -1;
      
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title) * multiplier;
        case 'language':
          return a.language.localeCompare(b.language) * multiplier;
        case 'favorites_count':
          return ((a.favorites_count || 0) - (b.favorites_count || 0)) * multiplier;
        case 'created_at':
          return (new Date(a.created_at).getTime() - new Date(b.created_at).getTime()) * multiplier;
        case 'updated_at':
        default:
          return (new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime()) * multiplier;
      }
    });

  const handleEdit = (snippet: Snippet) => {
    setEditingSnippet(snippet);
    setShowSnippetModal(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this snippet?')) {
      try {
        const result = await deleteSnippet(id);
        if (result.error) {
          console.error('Error deleting snippet:', result.error);
          // You could add a toast notification here
        }
      } catch (error) {
        console.error('Failed to delete snippet:', error);
      }
    }
  };

  // Add the toggle favorite handler
  const handleToggleFavorite = async (id: string, isFavorite: boolean) => {
    try {
      const result = await toggleFavorite(id, isFavorite);
      if (result.error) {
        console.error('Error toggling favorite:', result.error);
        // You could add a toast notification here
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  };

  const handleCloseModal = () => {
    setShowSnippetModal(false);
    setEditingSnippet(null);
  };

  const handleNewSnippet = () => {
    setEditingSnippet(null);
    setShowSnippetModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (filteredSnippets.length === 0) {
    return (
      <>
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-gray-100/50 rounded-full flex items-center justify-center mb-4">
            <FileText className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchQuery || selectedCategory || selectedCollection 
              ? 'No snippets found' 
              : 'No snippets yet'
            }
          </h3>
          <p className="text-gray-500 mb-6">
            {searchQuery || selectedCategory || selectedCollection
              ? 'Try adjusting your search or filters'
              : 'Create your first code snippet to get started'
            }
          </p>
          <button 
            onClick={handleNewSnippet}
            className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg hover:from-indigo-600 hover:to-purple-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <Plus className="h-4 w-4" />
            <span>Create Snippet</span>
          </button>
        </div>

        <SnippetModal
          isOpen={showSnippetModal}
          onClose={handleCloseModal}
          snippet={editingSnippet}
          mode={editingSnippet ? 'edit' : 'create'}
        />
      </>
    );
  }

  return (
    <>
      <div className={`
        ${viewMode === 'grid' 
          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' 
          : 'space-y-4'
        }
      `}>
        {filteredSnippets.map((snippet) => (
          <SnippetCard
            key={snippet.id}
            snippet={snippet}
            viewMode={viewMode}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onToggleFavorite={handleToggleFavorite} 
          />
        ))}
      </div>

      <SnippetModal
        isOpen={showSnippetModal}
        onClose={handleCloseModal}
        snippet={editingSnippet}
        mode={editingSnippet ? 'edit' : 'create'}
      />
    </>
  );
};

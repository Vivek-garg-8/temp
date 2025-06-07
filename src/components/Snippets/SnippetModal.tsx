import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { X, Code, Tag, Save } from 'lucide-react';
import { useSnippetStore } from '../../store/snippetStore';
import { useAuthStore } from '../../store/authStore';
import { Snippet } from '../../types';

interface SnippetModalProps {
  isOpen: boolean;
  onClose: () => void;
  snippet?: Snippet | null;
  mode: 'create' | 'edit';
}

const PROGRAMMING_LANGUAGES = [
  'javascript', 'typescript', 'python', 'java', 'cpp', 'c', 'csharp',
  'html', 'css', 'scss', 'sass', 'react', 'vue', 'angular', 'svelte',
  'php', 'ruby', 'go', 'rust', 'swift', 'kotlin', 'dart', 'sql',
  'bash', 'powershell', 'yaml', 'json', 'xml', 'markdown'
];

export const SnippetModal: React.FC<SnippetModalProps> = ({
  isOpen,
  onClose,
  snippet,
  mode
}) => {
  const { user } = useAuthStore();
  const { categories, collections, createSnippet, updateSnippet } = useSnippetStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tagInput, setTagInput] = useState('');

  // Simplified initial form data
  const initialFormData = useMemo(() => {
    if (snippet && mode === 'edit') {
      return {
        title: snippet.title || '',
        description: snippet.description || '',
        content: snippet.content || '',
        language: snippet.language || 'javascript',
        category_id: snippet.category_id || '',
        collection_id: snippet.collection_id || '',
        is_public: snippet.is_public || false,
        tags: Array.isArray(snippet.tags) ? snippet.tags : [],
      };
    }
    return {
      title: '',
      description: '',
      content: '',
      language: 'javascript',
      category_id: '',
      collection_id: '',
      is_public: false,
      tags: [],
    };
  }, [snippet, mode]);

  const [formData, setFormData] = useState(initialFormData);

  // Update form data only when necessary
  useEffect(() => {
    if (isOpen) {
      setFormData(initialFormData);
      setError(null);
      setTagInput('');
    }
  }, [initialFormData, isOpen]);

  // Memoize options to prevent recreation
  const languageOptions = useMemo(() => 
    PROGRAMMING_LANGUAGES.map(lang => (
      <option key={lang} value={lang}>
        {lang.charAt(0).toUpperCase() + lang.slice(1)}
      </option>
    )), []
  );

  const categoryOptions = useMemo(() => 
    categories.map(category => (
      <option key={category.id} value={category.id}>
        {category.name}
      </option>
    )), [categories]
  );

  const collectionOptions = useMemo(() => 
    collections.map(collection => (
      <option key={collection.id} value={collection.id}>
        {collection.name}
      </option>
    )), [collections]
  );

  // Optimized submit handler
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || loading) return;

    console.log('Starting submit...', formData);
    setLoading(true);
    setError(null);
    
    try {
      if (!formData.title.trim() || !formData.content.trim()) {
        throw new Error('Title and content are required');
      }

      const snippetData = {
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        content: formData.content.trim(),
        language: formData.language,
        category_id: formData.category_id || null,
        collection_id: formData.collection_id || null,
        is_public: formData.is_public,
        tags: formData.tags,
        user_id: user.id,
      };

      console.log('Submitting data:', snippetData);

      let result;
      const startTime = performance.now();
      
      if (mode === 'create') {
        result = await createSnippet(snippetData);
      } else if (snippet) {
        result = await updateSnippet(snippet.id, snippetData);
      }

      const endTime = performance.now();
      console.log(`Operation took ${endTime - startTime} milliseconds`);

      if (result?.error) {
        console.error('Save error:', result.error);
        throw new Error(result.error.message || 'Failed to save snippet');
      }

      console.log('Save successful, closing modal');
      onClose();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save snippet';
      console.error('Submit error:', error);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [formData, user, loading, mode, snippet, createSnippet, updateSnippet, onClose]);

  // Optimized change handler
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const finalValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: finalValue,
    }));
  }, []);

  // Tag management
  const addTag = useCallback(() => {
    const trimmedTag = tagInput.trim();
    if (trimmedTag && !formData.tags.includes(trimmedTag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, trimmedTag],
      }));
      setTagInput('');
    }
  }, [tagInput, formData.tags]);

  const removeTag = useCallback((tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove),
    }));
  }, []);

  const handleTagInputKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  }, [addTag]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200/50 dark:border-gray-700/50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Code className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                {mode === 'create' ? 'Create New Snippet' : 'Edit Snippet'}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {mode === 'create' ? 'Add a new code snippet to your collection' : 'Update your code snippet'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 dark:text-gray-300 hover:text-gray-600 dark:hover:text-gray-100 hover:bg-gray-100/50 dark:hover:bg-gray-800/50 rounded-lg transition-colors duration-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800/50 rounded-lg">
            <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-gray-50/50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 dark:focus:border-indigo-400/50 transition-all duration-200 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                  placeholder="Enter snippet title"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-50/50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 dark:focus:border-indigo-400/50 transition-all duration-200 resize-none text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                  placeholder="Describe what this snippet does"
                />
              </div>

              {/* Language */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Programming Language *
                </label>
                <select
                  name="language"
                  value={formData.language}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-gray-50/50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 dark:focus:border-indigo-400/50 transition-all duration-200 text-gray-900 dark:text-gray-100"
                >
                  {languageOptions}
                </select>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category
                </label>
                <select
                  name="category_id"
                  value={formData.category_id}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-50/50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 dark:focus:border-indigo-400/50 transition-all duration-200 text-gray-900 dark:text-gray-100"
                >
                  <option value="">No category</option>
                  {categoryOptions}
                </select>
              </div>

              {/* Collection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Collection
                </label>
                <select
                  name="collection_id"
                  value={formData.collection_id}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-50/50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 dark:focus:border-indigo-400/50 transition-all duration-200 text-gray-900 dark:text-gray-100"
                >
                  <option value="">No collection</option>
                  {collectionOptions}
                </select>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tags
                </label>
                <div className="space-y-3">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={handleTagInputKeyPress}
                      className="flex-1 px-4 py-2 bg-gray-50/50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 dark:focus:border-indigo-400/50 transition-all duration-200 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                      placeholder="Add a tag"
                    />
                    <button
                      type="button"
                      onClick={addTag}
                      className="px-4 py-2 bg-indigo-500 dark:bg-indigo-600 text-white rounded-lg hover:bg-indigo-600 dark:hover:bg-indigo-700 transition-colors duration-200"
                    >
                      <Tag className="h-4 w-4" />
                    </button>
                  </div>
                  {formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center space-x-1 px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full text-sm border border-indigo-200 dark:border-indigo-700/50"
                        >
                          <span>#{tag}</span>
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="text-indigo-400 dark:text-indigo-300 hover:text-indigo-600 dark:hover:text-indigo-200 transition-colors duration-200"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Code Content */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Code Content *
              </label>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleChange}
                required
                rows={20}
                className="w-full px-4 py-3 bg-gray-900 dark:bg-gray-950 text-gray-100 border border-gray-200/50 dark:border-gray-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 dark:focus:border-indigo-400/50 transition-all duration-200 font-mono text-sm resize-none placeholder-gray-400"
                placeholder="Paste your code here..."
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200/50 dark:border-gray-700/50">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-6 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 hover:bg-gray-100/50 dark:hover:bg-gray-800/50 rounded-lg transition-colors duration-200 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !formData.title.trim() || !formData.content.trim()}
              className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg hover:from-indigo-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Save className="h-4 w-4" />
              )}
              <span>{loading ? 'Saving...' : mode === 'create' ? 'Create Snippet' : 'Update Snippet'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
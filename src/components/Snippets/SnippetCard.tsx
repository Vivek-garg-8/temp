import React, { useState } from 'react';
import { 
  Code, 
  Heart, 
  Eye, 
  Share2, 
  Edit, 
  Trash2, 
  Copy,
  ExternalLink,
  Clock,
  User
} from 'lucide-react';
import { Snippet } from '../../types';

interface SnippetCardProps {
  snippet: Snippet;
  viewMode: 'grid' | 'list';
  onEdit?: (snippet: Snippet) => void;
  onDelete?: (id: string) => void;
  onShare?: (snippet: Snippet) => void;
}

export const SnippetCard: React.FC<SnippetCardProps> = ({
  snippet,
  viewMode,
  onEdit,
  onDelete,
  onShare,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const getLanguageColor = (language: string) => {
    const colors: Record<string, string> = {
      javascript: '#f7df1e',
      typescript: '#3178c6',
      python: '#3776ab',
      java: '#ed8b00',
      cpp: '#00599c',
      html: '#e34f26',
      css: '#1572b6',
      react: '#61dafb',
      vue: '#4fc08d',
      angular: '#dd0031',
    };
    return colors[language.toLowerCase()] || '#6b7280';
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(dateString));
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(snippet.content);
      // You could add a toast notification here
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  if (viewMode === 'list') {
    return (
      <div
        className="bg-white/60 backdrop-blur-sm rounded-lg border border-gray-200/50 p-4 hover:shadow-lg hover:border-indigo-200/50 transition-all duration-200 group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-3 mb-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: getLanguageColor(snippet.language) }}
              />
              <h3 className="text-lg font-semibold text-gray-900 truncate group-hover:text-indigo-600 transition-colors duration-200">
                {snippet.title}
              </h3>
              <span className="text-sm text-gray-500 bg-gray-100/50 px-2 py-1 rounded-full">
                {snippet.language}
              </span>
            </div>
            {snippet.description && (
              <p className="text-gray-600 text-sm mb-2 line-clamp-1">
                {snippet.description}
              </p>
            )}
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <div className="flex items-center space-x-1">
                <User className="h-3 w-3" />
                <span>{snippet.user?.username}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="h-3 w-3" />
                <span>{formatDate(snippet.updated_at)}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Heart className="h-3 w-3" />
                <span>{snippet.favorites_count}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Eye className="h-3 w-3" />
                <span>{snippet.views_count}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2 ml-4">
            <button
              onClick={copyToClipboard}
              className="p-2 text-gray-400 hover:text-indigo-500 hover:bg-indigo-50/50 rounded-lg transition-all duration-200"
              title="Copy to clipboard"
            >
              <Copy className="h-4 w-4" />
            </button>
            <button
              onClick={() => onShare?.(snippet)}
              className="p-2 text-gray-400 hover:text-emerald-500 hover:bg-emerald-50/50 rounded-lg transition-all duration-200"
              title="Share snippet"
            >
              <Share2 className="h-4 w-4" />
            </button>
            <button
              onClick={() => onEdit?.(snippet)}
              className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50/50 rounded-lg transition-all duration-200"
              title="Edit snippet"
            >
              <Edit className="h-4 w-4" />
            </button>
            <button
              onClick={() => onDelete?.(snippet.id)}
              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50/50 rounded-lg transition-all duration-200"
              title="Delete snippet"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="bg-white/60 backdrop-blur-sm rounded-xl border border-gray-200/50 p-6 hover:shadow-xl hover:border-indigo-200/50 transition-all duration-300 group transform hover:scale-105"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div
            className="w-4 h-4 rounded-full shadow-sm"
            style={{ backgroundColor: getLanguageColor(snippet.language) }}
          />
          <span className="text-sm font-medium text-gray-500 bg-gray-100/50 px-3 py-1 rounded-full">
            {snippet.language}
          </span>
        </div>
        <div className={`flex items-center space-x-1 transition-opacity duration-200 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
          <button
            onClick={copyToClipboard}
            className="p-1.5 text-gray-400 hover:text-indigo-500 hover:bg-indigo-50/50 rounded-lg transition-all duration-200"
            title="Copy to clipboard"
          >
            <Copy className="h-4 w-4" />
          </button>
          <button
            onClick={() => onShare?.(snippet)}
            className="p-1.5 text-gray-400 hover:text-emerald-500 hover:bg-emerald-50/50 rounded-lg transition-all duration-200"
            title="Share snippet"
          >
            <Share2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors duration-200 line-clamp-1">
          {snippet.title}
        </h3>
        {snippet.description && (
          <p className="text-gray-600 text-sm line-clamp-2 mb-3">
            {snippet.description}
          </p>
        )}
        
        {/* Code Preview */}
        <div className="bg-gray-50/50 rounded-lg p-3 border border-gray-200/30">
          <pre className="text-sm text-gray-700 font-mono line-clamp-3 overflow-hidden">
            <code>{snippet.content}</code>
          </pre>
        </div>
      </div>

      {/* Tags */}
      {snippet.tags && snippet.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-4">
          {snippet.tags.slice(0, 3).map((tag, index) => (
            <span
              key={index}
              className="text-xs text-indigo-600 bg-indigo-50/50 px-2 py-1 rounded-full border border-indigo-200/30"
            >
              #{tag}
            </span>
          ))}
          {snippet.tags.length > 3 && (
            <span className="text-xs text-gray-500 bg-gray-100/50 px-2 py-1 rounded-full">
              +{snippet.tags.length - 3} more
            </span>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200/30">
        <div className="flex items-center space-x-4 text-sm text-gray-500">
          <div className="flex items-center space-x-1">
            <Heart className="h-3 w-3" />
            <span>{snippet.favorites_count}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Eye className="h-3 w-3" />
            <span>{snippet.views_count}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Clock className="h-3 w-3" />
            <span>{formatDate(snippet.updated_at)}</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onEdit?.(snippet)}
            className="text-gray-400 hover:text-blue-500 transition-colors duration-200"
            title="Edit snippet"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDelete?.(snippet.id)}
            className="text-gray-400 hover:text-red-500 transition-colors duration-200"
            title="Delete snippet"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
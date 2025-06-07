import React, { useState } from 'react';
import { Search, Plus, User, Settings, LogOut, Menu, X } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useSnippetStore } from '../../store/snippetStore';
import { SnippetModal } from '../Snippets/SnippetModal';
import { ThemeToggle } from './ThemeToggle';

export const Header = () => {
  const { user, profile, signOut } = useAuthStore();
  const { searchQuery, setSearchQuery } = useSnippetStore();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showSnippetModal, setShowSnippetModal] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    setShowUserMenu(false);
  };

  const handleNewSnippet = () => {
    setShowSnippetModal(true);
  };

  return (
    <>
      <header className="bg-theme-glass sticky top-0 z-50 border-b border-theme">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-sm">S</span>
                </div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  SnippetHub
                </h1>
              </div>
            </div>

            {/* Search Bar - Desktop */}
            <div className="hidden md:flex flex-1 max-w-lg mx-8">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-theme-tertiary" />
                <input
                  type="text"
                  placeholder="Search snippets, collections, categories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-theme-surface border border-theme rounded-lg focus-ring text-theme-primary placeholder-theme-tertiary transition-all duration-200"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-4">
              {/* Theme Toggle */}
              <ThemeToggle />

              {/* New Snippet Button */}
              <button 
                onClick={handleNewSnippet}
                className="hidden sm:flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg hover:from-indigo-600 hover:to-purple-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <Plus className="h-4 w-4" />
                <span>New Snippet</span>
              </button>

              {/* Mobile New Button */}
              <button 
                onClick={handleNewSnippet}
                className="sm:hidden w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg flex items-center justify-center hover:from-indigo-600 hover:to-purple-600 transition-all duration-200 shadow-lg"
              >
                <Plus className="h-5 w-5" />
              </button>

              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors duration-200"
                >
                  {profile?.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt={profile.username}
                      className="w-8 h-8 rounded-full border-2 border-theme"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-white" />
                    </div>
                  )}
                  <span className="hidden sm:block text-theme-primary font-medium">
                    {profile?.username || user?.email}
                  </span>
                </button>

                {/* User Dropdown */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-theme-glass rounded-lg shadow-theme-lg border border-theme py-1 z-50 animate-fade-in">
                    <a
                      href="#"
                      className="flex items-center space-x-2 px-4 py-2 text-theme-secondary hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-colors duration-200"
                    >
                      <Settings className="h-4 w-4" />
                      <span>Settings</span>
                    </a>
                    <button
                      onClick={handleSignOut}
                      className="flex items-center space-x-2 px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50/50 dark:hover:bg-red-900/20 transition-colors duration-200 w-full text-left"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="md:hidden p-2 rounded-lg hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors duration-200"
              >
                {showMobileMenu ? (
                  <X className="h-5 w-5 text-theme-secondary" />
                ) : (
                  <Menu className="h-5 w-5 text-theme-secondary" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Search */}
          {showMobileMenu && (
            <div className="md:hidden py-4 border-t border-theme animate-slide-up">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-theme-tertiary" />
                <input
                  type="text"
                  placeholder="Search snippets..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-theme-surface border border-theme rounded-lg focus-ring text-theme-primary placeholder-theme-tertiary transition-all duration-200"
                />
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Snippet Modal */}
      <SnippetModal
        isOpen={showSnippetModal}
        onClose={() => setShowSnippetModal(false)}
        mode="create"
      />
    </>
  );
};
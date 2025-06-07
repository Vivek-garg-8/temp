import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { Snippet, Category, Collection, ViewMode, SortBy, SortOrder } from '../types';

interface SnippetState {
  snippets: Snippet[];
  categories: Category[];
  collections: Collection[];
  loading: boolean;
  viewMode: ViewMode;
  sortBy: SortBy;
  sortOrder: SortOrder;
  searchQuery: string;
  selectedCategory: string | null;
  selectedCollection: string | null;
  
  // Actions
  fetchSnippets: () => Promise<void>;
  fetchCategories: () => Promise<void>;
  fetchCollections: () => Promise<void>;
  createSnippet: (snippet: Partial<Snippet>) => Promise<{ data: Snippet | null; error: any }>;
  updateSnippet: (id: string, updates: Partial<Snippet>) => Promise<{ error: any }>;
  deleteSnippet: (id: string) => Promise<{ error: any }>;
  createCategory: (category: Partial<Category>) => Promise<{ data: Category | null; error: any }>;
  createCollection: (collection: Partial<Collection>) => Promise<{ data: Collection | null; error: any }>;
  setViewMode: (mode: ViewMode) => void;
  setSorting: (sortBy: SortBy, order: SortOrder) => void;
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (categoryId: string | null) => void;
  setSelectedCollection: (collectionId: string | null) => void;
}

export const useSnippetStore = create<SnippetState>((set, get) => ({
  snippets: [],
  categories: [],
  collections: [],
  loading: false,
  viewMode: 'grid',
  sortBy: 'updated_at',
  sortOrder: 'desc',
  searchQuery: '',
  selectedCategory: null,
  selectedCollection: null,

  fetchSnippets: async () => {
    set({ loading: true });
    try {
      const { data, error } = await supabase
        .from('snippets')
        .select(`
          *,
          category:categories(*),
          collection:collections(*),
          user:profiles(*)
        `)
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Error fetching snippets:', error);
        set({ snippets: [] });
      } else {
        set({ snippets: data || [] });
      }
    } catch (error) {
      console.error('Error fetching snippets:', error);
      set({ snippets: [] });
    } finally {
      set({ loading: false });
    }
  },

  fetchCategories: async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error fetching categories:', error);
        set({ categories: [] });
      } else {
        set({ categories: data || [] });
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      set({ categories: [] });
    }
  },

  fetchCollections: async () => {
    try {
      const { data, error } = await supabase
        .from('collections')
        .select(`
          *,
          snippets_count:snippets(count)
        `)
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Error fetching collections:', error);
        set({ collections: [] });
      } else {
        set({ collections: data || [] });
      }
    } catch (error) {
      console.error('Error fetching collections:', error);
      set({ collections: [] });
    }
  },

  createSnippet: async (snippet) => {
    const { data, error } = await supabase
      .from('snippets')
      .insert(snippet)
      .select(`
        *,
        category:categories(*),
        collection:collections(*),
        user:profiles(*)
      `)
      .single();

    if (!error && data) {
      set({ snippets: [data, ...get().snippets] });
    }

    return { data, error };
  },

  updateSnippet: async (id, updates) => {
    const { error } = await supabase
      .from('snippets')
      .update(updates)
      .eq('id', id);

    if (!error) {
      set({
        snippets: get().snippets.map(s => 
          s.id === id ? { ...s, ...updates } : s
        )
      });
    }

    return { error };
  },

  deleteSnippet: async (id) => {
    const { error } = await supabase
      .from('snippets')
      .delete()
      .eq('id', id);

    if (!error) {
      set({
        snippets: get().snippets.filter(s => s.id !== id)
      });
    }

    return { error };
  },

  createCategory: async (category) => {
    const { data, error } = await supabase
      .from('categories')
      .insert(category)
      .select()
      .single();

    if (!error && data) {
      set({ categories: [...get().categories, data] });
    }

    return { data, error };
  },

  createCollection: async (collection) => {
    const { data, error } = await supabase
      .from('collections')
      .insert(collection)
      .select()
      .single();

    if (!error && data) {
      set({ collections: [data, ...get().collections] });
    }

    return { data, error };
  },

  setViewMode: (mode) => set({ viewMode: mode }),
  setSorting: (sortBy, order) => set({ sortBy, sortOrder: order }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSelectedCategory: (categoryId) => set({ selectedCategory: categoryId }),
  setSelectedCollection: (collectionId) => set({ selectedCollection: collectionId }),
}));
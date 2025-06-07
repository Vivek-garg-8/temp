import { create } from "zustand";
import { supabase } from "../lib/supabase";
import {
  Snippet,
  Category,
  Collection,
  ViewMode,
  SortBy,
  SortOrder,
} from "../types";

interface SnippetState {
  snippets: Snippet[];
  categories: Category[];
  collections: Collection[];
  loading: boolean;
  error: string | null; // Add error state
  viewMode: ViewMode;
  sortBy: SortBy;
  sortOrder: SortOrder;
  searchQuery: string;
  selectedCategory: string | null;
  selectedCollection: string | null;

  // Actions
  fetchSnippets: () => Promise<void>;
  fetchCategories: () => Promise<{ data: Category[] | null; error: any }>;
  fetchCollections: () => Promise<{ data: Collection[] | null; error: any }>;
  createSnippet: (
    snippet: Partial<Snippet>
  ) => Promise<{ data: Snippet | null; error: any }>;
  updateSnippet: (
    id: string,
    updates: Partial<Snippet>
  ) => Promise<{ error: any }>;
  deleteSnippet: (id: string) => Promise<{ error: any }>;
  toggleFavorite: (id: string, isFavorite: boolean) => Promise<{ error: any }>;
  createCategory: (
    category: Partial<Category>
  ) => Promise<{ data: Category | null; error: any }>;
  createCollection: (
    collection: Partial<Collection>
  ) => Promise<{ data: Collection | null; error: any }>;
  setViewMode: (mode: ViewMode) => void;
  setSorting: (sortBy: SortBy, order: SortOrder) => void;
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (categoryId: string | null) => void;
  setSelectedCollection: (collectionId: string | null) => void;
  clearError: () => void; // Add error clearing
}

export const useSnippetStore = create<SnippetState>((set, get) => ({
  snippets: [],
  categories: [],
  collections: [],
  loading: false,
  error: null, // Initialize error state
  viewMode: "grid",
  sortBy: "updated_at",
  sortOrder: "desc",
  searchQuery: "",
  selectedCategory: null,
  selectedCollection: null,

  fetchSnippets: async () => {
    set({ loading: true, error: null });
    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        throw new Error(`Authentication error: ${userError.message}`);
      }

      console.log("Current user:", user?.id);

      const { data, error } = await supabase
        .from("snippets")
        .select(
          `
          *,
          category:categories(*),
          collection:collections(*),
          user:profiles(*)
        `
        )
        .order("updated_at", { ascending: false });

      if (error) {
        console.error("Error fetching snippets:", error);
        set({ snippets: [], error: `Failed to fetch snippets: ${error.message}` });
      } else {
        console.log("Snippets fetched successfully:", data?.length);
        set({ snippets: data || [], error: null });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      console.error("Error fetching snippets:", error);
      set({ snippets: [], error: errorMessage });
    } finally {
      set({ loading: false });
    }
  },

  fetchCategories: async () => {
    console.log("=== FETCHING CATEGORIES ===");
    set({ error: null });
    
    try {
      // Check authentication first
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      console.log("Auth check for categories:", { user: user?.id, error: userError });

      if (userError) {
        throw new Error(`Authentication error: ${userError.message}`);
      }

      // Test database connection
      console.log("Testing database connection...");
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("name");

      console.log("Raw Supabase response:", { 
        data, 
        error, 
        dataLength: data?.length,
        dataType: typeof data,
        isArray: Array.isArray(data)
      });

      if (error) {
        console.error("Supabase error fetching categories:", error);
        set({ categories: [], error: `Failed to fetch categories: ${error.message}` });
        return { data: null, error };
      }

      // Validate data structure
      if (!Array.isArray(data)) {
        console.error("Categories data is not an array:", data);
        set({ categories: [], error: "Invalid data format received" });
        return { data: null, error: new Error("Invalid data format") };
      }

      console.log("Categories data validated:", data);
      console.log("Sample category:", data[0]);
      
      set({ categories: data, error: null });
      console.log("Categories state updated successfully");
      
      return { data, error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      console.error("Exception in fetchCategories:", error);
      set({ categories: [], error: errorMessage });
      return { data: null, error };
    }
  },

  fetchCollections: async () => {
    console.log("=== FETCHING COLLECTIONS ===");
    set({ error: null });
    
    try {
      // Check authentication first
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      console.log("Auth check for collections:", { user: user?.id, error: userError });

      if (userError) {
        throw new Error(`Authentication error: ${userError.message}`);
      }

      console.log("Testing database connection for collections...");
      const { data, error } = await supabase
        .from("collections")
        .select("*")
        .order("name");

      console.log("Raw Supabase response for collections:", { 
        data, 
        error, 
        dataLength: data?.length,
        dataType: typeof data,
        isArray: Array.isArray(data)
      });

      if (error) {
        console.error("Supabase error fetching collections:", error);
        set({ collections: [], error: `Failed to fetch collections: ${error.message}` });
        return { data: null, error };
      }

      // Validate data structure
      if (!Array.isArray(data)) {
        console.error("Collections data is not an array:", data);
        set({ collections: [], error: "Invalid data format received" });
        return { data: null, error: new Error("Invalid data format") };
      }

      console.log("Collections data validated:", data);
      console.log("Sample collection:", data[0]);
      
      set({ collections: data, error: null });
      console.log("Collections state updated successfully");
      
      return { data, error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      console.error("Exception in fetchCollections:", error);
      set({ collections: [], error: errorMessage });
      return { data: null, error };
    }
  },

  // ... rest of your existing functions remain the same ...

  createSnippet: async (snippet) => {
    const cleanedSnippet = {
      ...snippet,
      category_id: snippet.category_id || undefined,
      collection_id: snippet.collection_id || undefined,
    };

    const { data, error } = await supabase
      .from("snippets")
      .insert(cleanedSnippet)
      .select(
        `
        *,
        category:categories(*),
        collection:collections(*),
        user:profiles(*)
      `
      )
      .single();

    if (!error && data) {
      set({ snippets: [data, ...get().snippets] });
    }

    return { data, error };
  },

  updateSnippet: async (id, updates) => {
    const cleanedUpdates = {
      ...updates,
      category_id: updates.category_id || undefined,
      collection_id: updates.collection_id || undefined,
    };

    const { error } = await supabase
      .from("snippets")
      .update(cleanedUpdates)
      .eq("id", id);

    if (!error) {
      set({
        snippets: get().snippets.map((s) =>
          s.id === id ? { ...s, ...cleanedUpdates } : s
        ),
      });
    }

    return { error };
  },

  deleteSnippet: async (id) => {
    const { error } = await supabase.from("snippets").delete().eq("id", id);

    if (!error) {
      set({
        snippets: get().snippets.filter((s) => s.id !== id),
      });
    }

    return { error };
  },

  toggleFavorite: async (id, isFavorite) => {
    console.log("Store toggleFavorite called:", { id, isFavorite });

    try {
      const { error } = await supabase
        .from("snippets")
        .update({ is_favorite: isFavorite })
        .eq("id", id);

      console.log("Supabase update result:", { error });

      if (!error) {
        set({
          snippets: get().snippets.map((s) =>
            s.id === id ? { ...s, is_favorite: isFavorite } : s
          ),
        });
        console.log("Local state updated successfully");
      } else {
        console.error("Supabase error:", error);
      }

      return { error };
    } catch (error) {
      console.error("Store toggleFavorite error:", error);
      return { error };
    }
  },

  createCategory: async (category) => {
    const { data, error } = await supabase
      .from("categories")
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
      .from("collections")
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
  setSelectedCollection: (collectionId) =>
    set({ selectedCollection: collectionId }),
  clearError: () => set({ error: null }),
}));

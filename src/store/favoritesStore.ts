import { create } from "zustand";
import { supabase } from "../lib/supabase";

export interface Favorite {
  id: string;
  user_id: string;
  snippet_id: string;
  created_at: string;
  snippet?: {
    id: string;
    title: string;
    language: string;
    content: string;
    description?: string;
    tags?: string[];
  };
}

interface FavoritesState {
  favorites: Favorite[];
  isLoading: boolean;
  error: string | null;
  fetchFavorites: (userId: string) => Promise<void>;
  addToFavorites: (snippetId: string, userId: string) => Promise<void>;
  removeFromFavorites: (snippetId: string, userId: string) => Promise<void>;
  clearFavorites: () => void;
  initializeFavorites: (userId: string) => Promise<void>;
}

export const useFavoritesStore = create<FavoritesState>((set, get) => ({
  favorites: [],
  isLoading: false,
  error: null,

  fetchFavorites: async (userId: string) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from("favorites")
        .select(
          `
          *,
          snippet:snippets(id, title, language, content, description, tags)
        `
        )
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      set({ favorites: data || [], isLoading: false });
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Failed to fetch favorites",
        isLoading: false,
      });
    }
  },
  
  addToFavorites: async (snippetId: string, userId: string) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from("favorites")
        .insert({ snippet_id: snippetId, user_id: userId })
        .select(
          `
          *,
          snippet:snippets(id, title, language, content, description, tags)
        `
        )
        .single();

      if (error) throw error;

      // Immediately update state
      set((state) => ({
        favorites: [data, ...state.favorites],
        isLoading: false,
      }));

      console.log("Added to favorites, new count:", get().favorites.length);
    } catch (error) {
      console.error("Error adding to favorites:", error);
      set({
        error:
          error instanceof Error ? error.message : "Failed to add to favorites",
        isLoading: false,
      });
      throw error;
    }
  },

  removeFromFavorites: async (snippetId: string, userId: string) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase
        .from("favorites")
        .delete()
        .eq("snippet_id", snippetId)
        .eq("user_id", userId);

      if (error) throw error;

      set((state) => ({
        favorites: state.favorites.filter(
          (fav) => !(fav.snippet_id === snippetId && fav.user_id === userId)
        ),
        isLoading: false,
      }));
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : "Failed to remove from favorites",
        isLoading: false,
      });
      throw error;
    }
  },

  clearFavorites: () => set({ favorites: [], error: null }),

  initializeFavorites: async (userId: string) => {
    if (get().favorites.length === 0) {
      await get().fetchFavorites(userId);
    }
  },
}));

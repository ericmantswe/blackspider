import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { TorrentResult } from '../types';

interface FavoritesState {
  favorites: TorrentResult[];
  addFavorite: (torrent: TorrentResult) => void;
  removeFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favorites: [],
      addFavorite: (torrent) => set((state) => ({ 
        favorites: state.favorites.some(f => f.id === torrent.id) 
          ? state.favorites 
          : [...state.favorites, torrent] 
      })),
      removeFavorite: (id) => set((state) => ({ favorites: state.favorites.filter(f => f.id !== id) })),
      isFavorite: (id) => get().favorites.some(f => f.id === id),
    }),
    {
      name: 'black-spider-favorites',
    }
  )
);

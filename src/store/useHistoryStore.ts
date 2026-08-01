import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface HistoryItem {
  id: string;
  torrentId: string;
  title: string;
  category: string;
  magnetLink: string;
  date: string;
  status: 'Opened' | 'Copied';
}

interface HistoryState {
  history: HistoryItem[];
  addHistory: (item: Omit<HistoryItem, 'id' | 'date'>) => void;
  clearHistory: () => void;
}

export const useHistoryStore = create<HistoryState>()(
  persist(
    (set) => ({
      history: [],
      addHistory: (item) => set((state) => ({
        history: [
          {
            ...item,
            id: crypto.randomUUID(),
            date: new Date().toISOString(),
          },
          ...state.history,
        ].slice(0, 100) // Keep last 100 items
      })),
      clearHistory: () => set({ history: [] }),
    }),
    {
      name: 'black-spider-history',
    }
  )
);

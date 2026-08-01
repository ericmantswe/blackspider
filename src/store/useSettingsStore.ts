import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsState {
  theme: 'dark' | 'light';
  autoCopyMagnet: boolean;
  autoOpenMagnet: boolean;
  defaultCategory: string;
  setTheme: (theme: 'dark' | 'light') => void;
  setAutoCopy: (val: boolean) => void;
  setAutoOpen: (val: boolean) => void;
  setDefaultCategory: (val: string) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      theme: 'dark',
      autoCopyMagnet: false,
      autoOpenMagnet: true,
      defaultCategory: 'Trending',
      setTheme: (theme) => set({ theme }),
      setAutoCopy: (autoCopyMagnet) => set({ autoCopyMagnet }),
      setAutoOpen: (autoOpenMagnet) => set({ autoOpenMagnet }),
      setDefaultCategory: (defaultCategory) => set({ defaultCategory }),
    }),
    {
      name: 'black-spider-settings',
    }
  )
);

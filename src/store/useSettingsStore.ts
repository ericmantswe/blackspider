import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsState {
  theme: 'dark' | 'light';
  autoCopyMagnet: boolean;
  autoOpenMagnet: boolean;
  defaultCategory: string;
  firecrawlApiKey: string;
  setTheme: (theme: 'dark' | 'light') => void;
  setAutoCopy: (val: boolean) => void;
  setAutoOpen: (val: boolean) => void;
  setDefaultCategory: (val: string) => void;
  setFirecrawlApiKey: (val: string) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      theme: 'dark',
      autoCopyMagnet: false,
      autoOpenMagnet: true,
      defaultCategory: 'Trending',
      firecrawlApiKey: 'fc-3539be5ea22744d4b084ed54c7a2777f',
      setTheme: (theme) => set({ theme }),
      setAutoCopy: (autoCopyMagnet) => set({ autoCopyMagnet }),
      setAutoOpen: (autoOpenMagnet) => set({ autoOpenMagnet }),
      setDefaultCategory: (defaultCategory) => set({ defaultCategory }),
      setFirecrawlApiKey: (firecrawlApiKey) => set({ firecrawlApiKey }),
    }),
    {
      name: 'black-spider-settings',
    }
  )
);

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { BlogSettings } from '@/lib/bkend';

interface ThemeState {
  isDark: boolean;
  toggleTheme: () => void;
}

export const useTheme = create<ThemeState>()(
  persist(
    (set) => ({
      isDark: false,
      toggleTheme: () => set((state) => ({ isDark: !state.isDark })),
    }),
    { name: 'theme-storage' }
  )
);

interface SettingsState {
  settings: BlogSettings | null;
  setSettings: (settings: BlogSettings) => void;
}

export const useSettings = create<SettingsState>()((set) => ({
  settings: null,
  setSettings: (settings) => set({ settings }),
}));

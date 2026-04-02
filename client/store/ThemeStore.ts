import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { STORAGE_KEYS } from '@/shared/consts';

export type ThemeMode = 'light' | 'dark';

type ThemeState = {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
};

export const useThemeStore = create<ThemeState>()(
  persist(
    set => ({
      mode: 'light',
      setMode: mode => set({ mode }),
      toggleMode: () =>
        set(state => ({ mode: state.mode === 'dark' ? 'light' : 'dark' })),
    }),
    {
      name: STORAGE_KEYS.themeMode,
      partialize: state => ({ mode: state.mode }),
    },
  ),
);

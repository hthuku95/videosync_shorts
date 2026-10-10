import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type ThemeMode = 'light' | 'dark' | 'system';

// Resizable sidebar rail (ChatGPT-style). One source of truth: the paper
// width, the content-column margin and the navbar shift ALL derive from the
// effective width below, so the three edges always share one line.
export const DEFAULT_SIDEBAR_WIDTH = 240;
export const SIDEBAR_MIN_WIDTH = 200;
export const SIDEBAR_MAX_WIDTH = 420;
export const SIDEBAR_COLLAPSED_WIDTH = 76;
export const SIDEBAR_COLLAPSE_AT = 140;

export const clampSidebarWidth = (w: number): number =>
  Math.min(SIDEBAR_MAX_WIDTH, Math.max(SIDEBAR_MIN_WIDTH, Math.round(w)));

interface UIState {
  themeMode: ThemeMode;
  sidebarOpen: boolean;
  sidebarWidth: number;
  sidebarCollapsed: boolean;
  toggleTheme: () => void;
  setThemeMode: (mode: ThemeMode) => void;
  setSidebarOpen: (open: boolean) => void;
  setSidebarWidth: (width: number) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebarCollapsed: () => void;
}

// Helper to get system preference
const getSystemTheme = (): 'light' | 'dark' => {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

// Helper to get effective theme
export const getEffectiveTheme = (mode: ThemeMode): 'light' | 'dark' => {
  if (mode === 'system') {
    return getSystemTheme();
  }
  return mode;
};

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      themeMode: 'system',
      sidebarOpen: true,
      sidebarWidth: DEFAULT_SIDEBAR_WIDTH,
      sidebarCollapsed: false,
      toggleTheme: () => {
        const current = get().themeMode;
        const effectiveTheme = getEffectiveTheme(current);
        const newMode = effectiveTheme === 'dark' ? 'light' : 'dark';
        set({ themeMode: newMode });
      },
      setThemeMode: (mode: ThemeMode) => {
        set({ themeMode: mode });
      },
      setSidebarOpen: (open: boolean) => {
        set({ sidebarOpen: open });
      },
      setSidebarWidth: (width: number) => {
        set({ sidebarWidth: clampSidebarWidth(width), sidebarCollapsed: false });
      },
      setSidebarCollapsed: (collapsed: boolean) => {
        set({ sidebarCollapsed: collapsed });
      },
      toggleSidebarCollapsed: () => {
        set({ sidebarCollapsed: !get().sidebarCollapsed });
      },
    }),
    {
      name: 'website-video-ui',
      partialize: (state) => ({
        themeMode: state.themeMode,
        sidebarWidth: state.sidebarWidth,
        sidebarCollapsed: state.sidebarCollapsed,
      }),
    }
  )
);
import { create } from 'zustand';

interface UiState {
    sidebarOpen: boolean;
    theme: 'dark' | 'light';
    toggleSidebar: () => void;
    setTheme: (theme: 'dark' | 'light') => void;
}

export const useUiStore = create<UiState>((set) => ({
    sidebarOpen: true,
    theme: 'dark',
    toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
    setTheme: (theme) => set({ theme }),
}));

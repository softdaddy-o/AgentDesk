import { create } from 'zustand';

interface SettingsState {
    defaultShell: string;
    fontSize: number;
    fontFamily: string;
    setDefaultShell: (shell: string) => void;
    setFontSize: (size: number) => void;
    setFontFamily: (family: string) => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
    defaultShell: 'cmd.exe',
    fontSize: 14,
    fontFamily: "'Cascadia Code', 'Fira Code', 'Consolas', monospace",

    setDefaultShell: (shell) => set({ defaultShell: shell }),
    setFontSize: (size) => set({ fontSize: size }),
    setFontFamily: (family) => set({ fontFamily: family }),
}));

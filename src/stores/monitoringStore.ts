import { create } from 'zustand';
import type { GlobalCostSummary } from '../lib/types';
import * as cmd from '../lib/tauri-commands';

interface MonitoringState {
    summary: GlobalCostSummary | null;
    loading: boolean;
    fetchSummary: () => Promise<void>;
}

export const useMonitoringStore = create<MonitoringState>((set) => ({
    summary: null,
    loading: false,

    fetchSummary: async () => {
        set({ loading: true });
        const summary = await cmd.getGlobalCostSummary();
        set({ summary, loading: false });
    },
}));

import { create } from 'zustand';
import type { HistoryEntry, SearchResult } from '../lib/types';
import * as cmd from '../lib/tauri-commands';

interface HistoryState {
    entries: HistoryEntry[];
    total: number;
    query: string;
    sessionFilter: string | null;
    loading: boolean;

    search: (query: string, sessionId?: string) => Promise<void>;
    loadMore: () => Promise<void>;
    setSessionFilter: (sessionId: string | null) => void;
}

export const useHistoryStore = create<HistoryState>((set, get) => ({
    entries: [],
    total: 0,
    query: '',
    sessionFilter: null,
    loading: false,

    search: async (query, sessionId) => {
        set({ loading: true, query, sessionFilter: sessionId ?? null });
        const result: SearchResult = await cmd.searchHistory({
            query,
            sessionId,
            limit: 50,
            offset: 0,
        });
        set({ entries: result.entries, total: result.total, loading: false });
    },

    loadMore: async () => {
        const { entries, query, sessionFilter } = get();
        set({ loading: true });
        const result: SearchResult = await cmd.searchHistory({
            query,
            sessionId: sessionFilter ?? undefined,
            limit: 50,
            offset: entries.length,
        });
        set({
            entries: [...entries, ...result.entries],
            total: result.total,
            loading: false,
        });
    },

    setSessionFilter: (sessionId) => set({ sessionFilter: sessionId }),
}));

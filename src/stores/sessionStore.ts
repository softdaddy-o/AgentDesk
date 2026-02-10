import { create } from 'zustand';
import type { Session, SessionConfig, SessionStatus } from '../lib/types';

interface SessionState {
    sessions: Map<string, Session>;
    activeSessionId: string | null;

    addSession: (config: SessionConfig) => void;
    removeSession: (id: string) => void;
    updateStatus: (id: string, status: SessionStatus) => void;
    updateActivity: (id: string) => void;
    setActiveSession: (id: string | null) => void;
    getSession: (id: string) => Session | undefined;
}

export const useSessionStore = create<SessionState>((set, get) => ({
    sessions: new Map(),
    activeSessionId: null,

    addSession: (config) =>
        set((state) => {
            const sessions = new Map(state.sessions);
            sessions.set(config.id, {
                config,
                status: { type: 'Starting' },
                createdAt: Date.now(),
                lastActivity: Date.now(),
            });
            return {
                sessions,
                activeSessionId: state.activeSessionId ?? config.id,
            };
        }),

    removeSession: (id) =>
        set((state) => {
            const sessions = new Map(state.sessions);
            sessions.delete(id);
            const activeSessionId =
                state.activeSessionId === id
                    ? (sessions.keys().next().value ?? null)
                    : state.activeSessionId;
            return { sessions, activeSessionId };
        }),

    updateStatus: (id, status) =>
        set((state) => {
            const sessions = new Map(state.sessions);
            const session = sessions.get(id);
            if (session) {
                sessions.set(id, { ...session, status });
            }
            return { sessions };
        }),

    updateActivity: (id) =>
        set((state) => {
            const sessions = new Map(state.sessions);
            const session = sessions.get(id);
            if (session) {
                sessions.set(id, { ...session, lastActivity: Date.now() });
            }
            return { sessions };
        }),

    setActiveSession: (id) => set({ activeSessionId: id }),

    getSession: (id) => get().sessions.get(id),
}));

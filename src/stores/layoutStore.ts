import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type SplitDirection = 'none' | 'horizontal' | 'vertical' | 'grid';

export interface Pane {
    id: string;
    sessionId: string | null;
}

interface LayoutState {
    splitDirection: SplitDirection;
    panes: Pane[];
    activePaneId: string;

    splitHorizontal: () => void;
    splitVertical: () => void;
    splitGrid: () => void;
    closeSplit: () => void;
    closePane: (paneId: string) => void;
    setActivePane: (paneId: string) => void;
    setPaneSession: (paneId: string, sessionId: string) => void;
}

const DEFAULT_PANE: Pane = { id: 'pane-1', sessionId: null };

function makePanes(count: number, existing: Pane[]): Pane[] {
    const panes: Pane[] = [];
    for (let i = 0; i < count; i++) {
        panes.push(existing[i] ?? { id: `pane-${i + 1}`, sessionId: null });
    }
    return panes;
}

export const useLayoutStore = create<LayoutState>()(
    persist(
        (set) => ({
            splitDirection: 'none',
            panes: [DEFAULT_PANE],
            activePaneId: 'pane-1',

            splitHorizontal: () =>
                set((state) => {
                    if (state.splitDirection === 'horizontal') return state;
                    return {
                        splitDirection: 'horizontal',
                        panes: makePanes(2, state.panes),
                    };
                }),

            splitVertical: () =>
                set((state) => {
                    if (state.splitDirection === 'vertical') return state;
                    return {
                        splitDirection: 'vertical',
                        panes: makePanes(2, state.panes),
                    };
                }),

            splitGrid: () =>
                set((state) => {
                    if (state.splitDirection === 'grid') return state;
                    return {
                        splitDirection: 'grid',
                        panes: makePanes(4, state.panes),
                    };
                }),

            closeSplit: () =>
                set((state) => ({
                    splitDirection: 'none',
                    panes: [state.panes[0] ?? DEFAULT_PANE],
                    activePaneId: state.panes[0]?.id ?? 'pane-1',
                })),

            closePane: (paneId) =>
                set((state) => {
                    if (state.panes.length <= 1) return state;
                    const remaining = state.panes.filter((p) => p.id !== paneId);
                    const newDirection = remaining.length <= 1 ? 'none' as const : state.splitDirection;
                    return {
                        panes: remaining.length === 0 ? [DEFAULT_PANE] : remaining,
                        splitDirection: newDirection,
                        activePaneId:
                            state.activePaneId === paneId
                                ? remaining[0]?.id ?? 'pane-1'
                                : state.activePaneId,
                    };
                }),

            setActivePane: (paneId) => set({ activePaneId: paneId }),

            setPaneSession: (paneId, sessionId) =>
                set((state) => ({
                    panes: state.panes.map((p) =>
                        p.id === paneId ? { ...p, sessionId } : p,
                    ),
                })),
        }),
        {
            name: 'agentdesk-layout',
            partialize: (state) => ({
                splitDirection: state.splitDirection,
            }),
        },
    ),
);

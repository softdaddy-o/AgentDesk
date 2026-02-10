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
    splitRatio: number;       // 0-1, for horizontal/vertical (first pane fraction)
    gridRatioH: number;       // horizontal ratio for grid
    gridRatioV: number;       // vertical ratio for grid

    splitHorizontal: () => void;
    splitVertical: () => void;
    splitGrid: () => void;
    closeSplit: () => void;
    closePane: (paneId: string) => void;
    setActivePane: (paneId: string) => void;
    setPaneSession: (paneId: string, sessionId: string) => void;
    setSplitRatio: (ratio: number) => void;
    setGridRatioH: (ratio: number) => void;
    setGridRatioV: (ratio: number) => void;
}

const DEFAULT_PANE: Pane = { id: 'pane-1', sessionId: null };

function makePanes(count: number, existing: Pane[]): Pane[] {
    const panes: Pane[] = [];
    for (let i = 0; i < count; i++) {
        panes.push(existing[i] ?? { id: `pane-${i + 1}`, sessionId: null });
    }
    return panes;
}

function clampRatio(ratio: number): number {
    return Math.max(0.15, Math.min(0.85, ratio));
}

export const useLayoutStore = create<LayoutState>()(
    persist(
        (set) => ({
            splitDirection: 'none',
            panes: [DEFAULT_PANE],
            activePaneId: 'pane-1',
            splitRatio: 0.5,
            gridRatioH: 0.5,
            gridRatioV: 0.5,

            splitHorizontal: () =>
                set((state) => {
                    if (state.splitDirection === 'horizontal') return state;
                    return {
                        splitDirection: 'horizontal',
                        panes: makePanes(2, state.panes),
                        splitRatio: 0.5,
                    };
                }),

            splitVertical: () =>
                set((state) => {
                    if (state.splitDirection === 'vertical') return state;
                    return {
                        splitDirection: 'vertical',
                        panes: makePanes(2, state.panes),
                        splitRatio: 0.5,
                    };
                }),

            splitGrid: () =>
                set((state) => {
                    if (state.splitDirection === 'grid') return state;
                    return {
                        splitDirection: 'grid',
                        panes: makePanes(4, state.panes),
                        gridRatioH: 0.5,
                        gridRatioV: 0.5,
                    };
                }),

            closeSplit: () =>
                set((state) => ({
                    splitDirection: 'none',
                    panes: [state.panes[0] ?? DEFAULT_PANE],
                    activePaneId: state.panes[0]?.id ?? 'pane-1',
                    splitRatio: 0.5,
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

            setSplitRatio: (ratio) => set({ splitRatio: clampRatio(ratio) }),
            setGridRatioH: (ratio) => set({ gridRatioH: clampRatio(ratio) }),
            setGridRatioV: (ratio) => set({ gridRatioV: clampRatio(ratio) }),
        }),
        {
            name: 'agentdesk-layout',
            partialize: (state) => ({
                splitDirection: state.splitDirection,
                splitRatio: state.splitRatio,
                gridRatioH: state.gridRatioH,
                gridRatioV: state.gridRatioV,
            }),
        },
    ),
);

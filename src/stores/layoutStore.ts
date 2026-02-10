import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// --- Tree-based pane model ---

export interface LeafPane {
    type: 'leaf';
    id: string;
    sessionId: string | null;
}

export interface SplitPane {
    type: 'split';
    id: string;
    direction: 'horizontal' | 'vertical';
    ratio: number;
    children: [PaneNode, PaneNode];
}

export type PaneNode = LeafPane | SplitPane;

// --- Tree helpers ---

function makeLeaf(sessionId: string | null = null): LeafPane {
    return { type: 'leaf', id: crypto.randomUUID(), sessionId };
}

function splitLeaf(node: PaneNode, targetId: string, direction: 'horizontal' | 'vertical'): PaneNode {
    if (node.type === 'leaf') {
        if (node.id === targetId) {
            return {
                type: 'split',
                id: crypto.randomUUID(),
                direction,
                ratio: 0.5,
                children: [{ ...node }, makeLeaf()],
            };
        }
        return node;
    }
    return {
        ...node,
        children: [
            splitLeaf(node.children[0], targetId, direction),
            splitLeaf(node.children[1], targetId, direction),
        ],
    };
}

function removeLeaf(node: PaneNode, targetId: string): PaneNode | null {
    if (node.type === 'leaf') {
        return node.id === targetId ? null : node;
    }
    const left = removeLeaf(node.children[0], targetId);
    const right = removeLeaf(node.children[1], targetId);
    if (left === null) return right;
    if (right === null) return left;
    return { ...node, children: [left, right] };
}

function updateLeafSession(node: PaneNode, targetId: string, sessionId: string): PaneNode {
    if (node.type === 'leaf') {
        return node.id === targetId ? { ...node, sessionId } : node;
    }
    return {
        ...node,
        children: [
            updateLeafSession(node.children[0], targetId, sessionId),
            updateLeafSession(node.children[1], targetId, sessionId),
        ],
    };
}

function updateSplitRatio(node: PaneNode, splitId: string, ratio: number): PaneNode {
    if (node.type === 'leaf') return node;
    if (node.id === splitId) {
        return { ...node, ratio: Math.max(0.15, Math.min(0.85, ratio)) };
    }
    return {
        ...node,
        children: [
            updateSplitRatio(node.children[0], splitId, ratio),
            updateSplitRatio(node.children[1], splitId, ratio),
        ],
    };
}

function collectLeaves(node: PaneNode): LeafPane[] {
    if (node.type === 'leaf') return [node];
    return [...collectLeaves(node.children[0]), ...collectLeaves(node.children[1])];
}

function findLeaf(node: PaneNode, leafId: string): LeafPane | null {
    if (node.type === 'leaf') return node.id === leafId ? node : null;
    return findLeaf(node.children[0], leafId) ?? findLeaf(node.children[1], leafId);
}

// --- Store ---

interface LayoutState {
    root: PaneNode;
    activePaneId: string;

    splitPane: (paneId: string, direction: 'horizontal' | 'vertical') => void;
    closePane: (paneId: string) => void;
    setActivePane: (paneId: string) => void;
    setPaneSession: (paneId: string, sessionId: string) => void;
    setSplitRatio: (splitId: string, ratio: number) => void;
    resetLayout: () => void;

    // Derived helpers (not stored, computed on call)
    getLeaves: () => LeafPane[];
    getActiveLeaf: () => LeafPane | null;
    getLeafCount: () => number;
}

const DEFAULT_ROOT: LeafPane = { type: 'leaf', id: 'pane-root', sessionId: null };

export const useLayoutStore = create<LayoutState>()(
    persist(
        (set, get) => ({
            root: DEFAULT_ROOT,
            activePaneId: 'pane-root',

            splitPane: (paneId, direction) =>
                set((state) => ({
                    root: splitLeaf(state.root, paneId, direction),
                })),

            closePane: (paneId) =>
                set((state) => {
                    const leaves = collectLeaves(state.root);
                    if (leaves.length <= 1) return state;
                    const newRoot = removeLeaf(state.root, paneId);
                    if (!newRoot) return state;
                    const newLeaves = collectLeaves(newRoot);
                    const newActive = state.activePaneId === paneId
                        ? newLeaves[0]?.id ?? 'pane-root'
                        : state.activePaneId;
                    return { root: newRoot, activePaneId: newActive };
                }),

            setActivePane: (paneId) => set({ activePaneId: paneId }),

            setPaneSession: (paneId, sessionId) =>
                set((state) => ({
                    root: updateLeafSession(state.root, paneId, sessionId),
                })),

            setSplitRatio: (splitId, ratio) =>
                set((state) => ({
                    root: updateSplitRatio(state.root, splitId, ratio),
                })),

            resetLayout: () =>
                set({ root: { ...DEFAULT_ROOT }, activePaneId: 'pane-root' }),

            getLeaves: () => collectLeaves(get().root),
            getActiveLeaf: () => findLeaf(get().root, get().activePaneId),
            getLeafCount: () => collectLeaves(get().root).length,
        }),
        {
            name: 'agentdesk-layout',
            partialize: (state) => ({
                root: state.root,
            }),
        },
    ),
);

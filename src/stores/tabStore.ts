import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type TabType = 'dashboard' | 'terminal-grid' | 'sessions' | 'templates' | 'history' | 'monitoring' | 'settings' | 'custom';

export interface Tab {
    id: string;
    name: string;
    type: TabType;
    layoutState: unknown; // Dockview serialized layout (JSON)
    order: number;
    createdAt: number;
}

interface TabState {
    tabs: Tab[];
    activeTabId: string;

    // Tab CRUD
    addTab: (type: TabType, name?: string) => string;
    removeTab: (tabId: string) => void;
    setActiveTab: (tabId: string) => void;
    renameTab: (tabId: string, name: string) => void;
    reorderTabs: (tabIds: string[]) => void;
    updateLayout: (tabId: string, layoutState: unknown) => void;

    // Helpers
    getActiveTab: () => Tab | undefined;
    getTabById: (tabId: string) => Tab | undefined;
}

function generateId(): string {
    return `tab-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

const TAB_TYPE_PREFIX: Record<TabType, string> = {
    'dashboard': 'Dashboard',
    'terminal-grid': 'Terminal',
    'sessions': 'Sessions',
    'templates': 'Templates',
    'history': 'History',
    'monitoring': 'Monitoring',
    'settings': 'Settings',
    'custom': 'Custom',
};

function getDefaultTabName(type: TabType, existingTabs: Tab[]): string {
    const prefix = TAB_TYPE_PREFIX[type];
    const existingNames = new Set(existingTabs.map(t => t.name));
    let counter = 1;
    while (existingNames.has(`${prefix} ${counter}`)) {
        counter++;
    }
    return `${prefix} ${counter}`;
}

export const useTabStore = create<TabState>()(
    persist(
        (set, get) => ({
            tabs: [
                {
                    id: 'default-dashboard',
                    name: 'Dashboard',
                    type: 'dashboard',
                    layoutState: null,
                    order: 0,
                    createdAt: Date.now(),
                },
                {
                    id: 'default-terminal',
                    name: 'Terminal 1',
                    type: 'terminal-grid',
                    layoutState: null,
                    order: 1,
                    createdAt: Date.now(),
                },
            ],
            activeTabId: 'default-dashboard',

            addTab: (type: TabType, name?: string) => {
                const id = generateId();
                const tabs = get().tabs;
                const newTab: Tab = {
                    id,
                    name: name || getDefaultTabName(type, tabs),
                    type,
                    layoutState: null,
                    order: tabs.length,
                    createdAt: Date.now(),
                };

                set({
                    tabs: [...tabs, newTab],
                    activeTabId: id,
                });

                return id;
            },

            removeTab: (tabId: string) => {
                const { tabs, activeTabId } = get();
                const remainingTabs = tabs.filter(t => t.id !== tabId);

                // Prevent removing the last tab
                if (remainingTabs.length === 0) {
                    console.warn('Cannot remove the last tab');
                    return;
                }

                // If removing active tab, switch to previous or first tab
                let newActiveTabId = activeTabId;
                if (tabId === activeTabId) {
                    const removedIndex = tabs.findIndex(t => t.id === tabId);
                    newActiveTabId = removedIndex > 0
                        ? tabs[removedIndex - 1].id
                        : remainingTabs[0].id;
                }

                set({
                    tabs: remainingTabs,
                    activeTabId: newActiveTabId,
                });
            },

            setActiveTab: (tabId: string) => {
                const tab = get().tabs.find(t => t.id === tabId);
                if (tab) {
                    set({ activeTabId: tabId });
                }
            },

            renameTab: (tabId: string, name: string) => {
                set(state => ({
                    tabs: state.tabs.map(tab =>
                        tab.id === tabId ? { ...tab, name } : tab
                    ),
                }));
            },

            reorderTabs: (tabIds: string[]) => {
                const { tabs } = get();
                const tabMap = new Map(tabs.map(t => [t.id, t]));
                const reorderedTabs = tabIds
                    .map(id => tabMap.get(id))
                    .filter((tab): tab is Tab => tab !== undefined)
                    .map((tab, index) => ({ ...tab, order: index }));

                set({ tabs: reorderedTabs });
            },

            updateLayout: (tabId: string, layoutState: unknown) => {
                set(state => ({
                    tabs: state.tabs.map(tab =>
                        tab.id === tabId ? { ...tab, layoutState } : tab
                    ),
                }));
            },

            getActiveTab: () => {
                const { tabs, activeTabId } = get();
                return tabs.find(t => t.id === activeTabId);
            },

            getTabById: (tabId: string) => {
                return get().tabs.find(t => t.id === tabId);
            },
        }),
        {
            name: 'agentdesk-tabs',
            partialize: (state) => ({
                tabs: state.tabs,
                activeTabId: state.activeTabId,
            }),
        }
    )
);

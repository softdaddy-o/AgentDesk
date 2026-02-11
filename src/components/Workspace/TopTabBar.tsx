import { useCallback, useEffect, useRef, useState } from 'react';
import { useTabStore, type TabType } from '../../stores/tabStore';
import './TopTabBar.css';

const TAB_TYPE_ICONS: Record<TabType, string> = {
    'dashboard': '􀋲',
    'terminal-grid': '􀙥',
    'sessions': '􀐾',
    'templates': '􀉆',
    'history': '􀐫',
    'monitoring': '􀡋',
    'settings': '􀣋',
    'custom': '􀣋',
};

interface RenameState {
    tabId: string;
    value: string;
}

const ADD_MENU_ITEMS: { type: TabType; label: string }[] = [
    { type: 'dashboard', label: 'Dashboard' },
    { type: 'terminal-grid', label: 'Terminal Grid' },
    { type: 'sessions', label: 'Sessions' },
    { type: 'templates', label: 'Templates' },
    { type: 'history', label: 'History' },
    { type: 'monitoring', label: 'Monitoring' },
    { type: 'settings', label: 'Settings' },
];

export function TopTabBar() {
    const { tabs, activeTabId, addTab, removeTab, setActiveTab, renameTab } = useTabStore();
    const [showAddMenu, setShowAddMenu] = useState(false);
    const [renaming, setRenaming] = useState<RenameState | null>(null);
    const addMenuRef = useRef<HTMLDivElement>(null);

    // Dismiss add-menu on outside click
    useEffect(() => {
        if (!showAddMenu) return;

        function handleClickOutside(e: MouseEvent): void {
            if (addMenuRef.current && !addMenuRef.current.contains(e.target as Node)) {
                setShowAddMenu(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showAddMenu]);

    const handleTabClick = useCallback((tabId: string) => {
        if (renaming?.tabId !== tabId) {
            setActiveTab(tabId);
        }
    }, [renaming, setActiveTab]);

    const handleTabDoubleClick = useCallback((tabId: string, currentName: string) => {
        setRenaming({ tabId, value: currentName });
    }, []);

    const handleRenameSubmit = useCallback((tabId: string) => {
        if (renaming && renaming.value.trim()) {
            renameTab(tabId, renaming.value.trim());
        }
        setRenaming(null);
    }, [renaming, renameTab]);

    const handleCloseTab = useCallback((e: React.MouseEvent, tabId: string) => {
        e.stopPropagation();
        removeTab(tabId);
    }, [removeTab]);

    const handleAddTab = useCallback((type: TabType) => {
        addTab(type);
        setShowAddMenu(false);
    }, [addTab]);

    return (
        <div className="top-tab-bar">
            <div className="tab-list">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        className={`tab-item ${tab.id === activeTabId ? 'active' : ''}`}
                        onClick={() => handleTabClick(tab.id)}
                        onDoubleClick={() => handleTabDoubleClick(tab.id, tab.name)}
                    >
                        <span className="tab-icon">{TAB_TYPE_ICONS[tab.type]}</span>
                        {renaming?.tabId === tab.id ? (
                            <input
                                type="text"
                                className="tab-rename-input"
                                value={renaming.value}
                                onChange={(e) => setRenaming({ tabId: tab.id, value: e.target.value })}
                                onBlur={() => handleRenameSubmit(tab.id)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleRenameSubmit(tab.id);
                                    if (e.key === 'Escape') setRenaming(null);
                                }}
                                autoFocus
                                onClick={(e) => e.stopPropagation()}
                            />
                        ) : (
                            <span className="tab-title">{tab.name}</span>
                        )}
                        <button
                            className="close-button"
                            onClick={(e) => handleCloseTab(e, tab.id)}
                            title="Close tab"
                        >
                            ×
                        </button>
                    </button>
                ))}
            </div>

            <div className="add-tab-container" ref={addMenuRef}>
                <button
                    className="add-tab-button"
                    onClick={() => setShowAddMenu(prev => !prev)}
                    title="New Tab"
                >
                    +
                </button>
                {showAddMenu && (
                    <div className="add-tab-menu">
                        {ADD_MENU_ITEMS.map(({ type, label }) => (
                            <button
                                key={type}
                                className="menu-item"
                                onClick={() => handleAddTab(type)}
                            >
                                <span className="menu-icon">{TAB_TYPE_ICONS[type]}</span>
                                {label}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

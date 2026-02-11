import type { ReactNode } from 'react';
import { useTabStore, type Tab } from '../../stores/tabStore';
import { TerminalGridTab } from './TerminalGridTab';
import DashboardPage from '../../pages/DashboardPage';
import SessionPage from '../../pages/SessionPage';
import TemplatesPage from '../../pages/TemplatesPage';
import HistoryPage from '../../pages/HistoryPage';
import MonitoringPage from '../../pages/MonitoringPage';
import SettingsPage from '../../pages/SettingsPage';
import './TabContentArea.css';

function renderTabContent(tab: Tab): ReactNode {
    switch (tab.type) {
        case 'dashboard':
            return <DashboardPage />;
        case 'terminal-grid':
            return <TerminalGridTab tabId={tab.id} />;
        case 'sessions':
            return <SessionPage />;
        case 'templates':
            return <TemplatesPage />;
        case 'history':
            return <HistoryPage />;
        case 'monitoring':
            return <MonitoringPage />;
        case 'settings':
            return <SettingsPage />;
        default:
            return <p>Unknown tab type: {tab.type}</p>;
    }
}

export function TabContentArea() {
    const activeTab = useTabStore(
        (state) => state.tabs.find(t => t.id === state.activeTabId)
    );

    if (!activeTab) {
        return (
            <div className="tab-content-area-empty">
                <p>No active tab</p>
            </div>
        );
    }

    return (
        <div className="tab-content-area">
            {renderTabContent(activeTab)}
        </div>
    );
}

import { useEffect } from 'react';
import { TopTabBar } from '../components/Workspace/TopTabBar';
import { TabContentArea } from '../components/Workspace/TabContentArea';
import { useTabStore } from '../stores/tabStore';
import './TabWorkspacePage.css';

export default function TabWorkspacePage() {
    const { addTab, removeTab, setActiveTab } = useTabStore();

    useEffect(() => {
        function handleKeyDown(e: KeyboardEvent): void {
            if (!e.ctrlKey) return;

            switch (e.key) {
                case 't': {
                    e.preventDefault();
                    addTab('terminal-grid');
                    break;
                }

                case 'w': {
                    e.preventDefault();
                    const { activeTabId } = useTabStore.getState();
                    removeTab(activeTabId);
                    break;
                }

                case 'Tab': {
                    e.preventDefault();
                    const { tabs, activeTabId } = useTabStore.getState();
                    const currentIndex = tabs.findIndex(t => t.id === activeTabId);
                    if (currentIndex === -1) return;

                    const nextIndex = e.shiftKey
                        ? (currentIndex - 1 + tabs.length) % tabs.length
                        : (currentIndex + 1) % tabs.length;

                    setActiveTab(tabs[nextIndex].id);
                    break;
                }

                default: {
                    if (e.key >= '1' && e.key <= '9') {
                        e.preventDefault();
                        const index = parseInt(e.key) - 1;
                        const { tabs } = useTabStore.getState();
                        if (tabs[index]) {
                            setActiveTab(tabs[index].id);
                        }
                    }
                    break;
                }
            }
        }

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [addTab, removeTab, setActiveTab]);

    return (
        <div className="tab-workspace-page">
            <TopTabBar />
            <TabContentArea />
        </div>
    );
}

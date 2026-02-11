import { useEffect, useRef } from 'react';
import {
    DockviewApi,
    DockviewReact,
    DockviewReadyEvent,
    IDockviewPanelProps,
    SerializedDockview,
} from 'dockview';
import { useTabStore } from '../../stores/tabStore';
import 'dockview/dist/styles/dockview.css';
import './TerminalGridTab.css';

// POC placeholder -- full xterm.js integration in Phase 2
function TerminalPanel({ params }: IDockviewPanelProps) {
    const sessionId = params.sessionId as string | undefined;

    if (sessionId) {
        return (
            <div className="empty-panel">
                <p>Terminal Panel: {sessionId}</p>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    (xterm.js integration coming in Phase 2)
                </p>
            </div>
        );
    }

    return (
        <div className="empty-panel">
            <p>No session assigned</p>
            <button className="add-session-button">Add Terminal</button>
        </div>
    );
}

function createDefaultPanel(api: DockviewApi): void {
    api.addPanel({
        id: 'panel-1',
        component: 'terminal',
        params: { sessionId: undefined },
    });
}

const DOCKVIEW_COMPONENTS = {
    terminal: TerminalPanel,
} as const;

interface TerminalGridTabProps {
    tabId: string;
}

export function TerminalGridTab({ tabId }: TerminalGridTabProps) {
    const apiRef = useRef<DockviewApi | undefined>(undefined);
    const { updateLayout, getTabById } = useTabStore();

    function onReady(event: DockviewReadyEvent): void {
        apiRef.current = event.api;

        const tab = getTabById(tabId);
        const hasLayout = tab?.layoutState && typeof tab.layoutState === 'object';

        if (hasLayout) {
            try {
                event.api.fromJSON(tab.layoutState as SerializedDockview);
            } catch (error) {
                console.error('Failed to restore layout:', error);
                createDefaultPanel(event.api);
            }
        } else {
            createDefaultPanel(event.api);
        }

        event.api.onDidLayoutChange(() => {
            updateLayout(tabId, event.api.toJSON());
        });
    }

    useEffect(() => {
        return () => {
            apiRef.current?.dispose();
        };
    }, []);

    return (
        <div className="terminal-grid-tab">
            <DockviewReact
                onReady={onReady}
                components={DOCKVIEW_COMPONENTS}
                className="dockview-theme-agentdesk"
            />
        </div>
    );
}

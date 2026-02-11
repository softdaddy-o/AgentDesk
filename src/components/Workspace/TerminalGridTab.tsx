import { createContext, useContext, useRef, useState } from 'react';
import {
    DockviewApi,
    DockviewReact,
    DockviewReadyEvent,
    IDockviewPanelProps,
    SerializedDockview,
} from 'dockview';
import { useTabStore } from '../../stores/tabStore';
import { CellTitleBar } from './CellTitleBar';
import 'dockview/dist/styles/dockview.css';
import './TerminalGridTab.css';

let panelCounter = 3; // Start from 3 since we have panel-1 and panel-2

// Create context for Dockview API
const DockviewApiContext = createContext<DockviewApi | null>(null);

// POC placeholder -- full xterm.js integration in Phase 2
function TerminalPanel({ params, api }: IDockviewPanelProps) {
    const dockviewApi = useContext(DockviewApiContext);
    const sessionId = params.sessionId as string | undefined;
    const initialTitle = params.title as string | undefined;
    const [title, setTitle] = useState(initialTitle || 'Terminal');

    function handleSplitHorizontal() {
        if (!dockviewApi) return;

        const newPanelId = `panel-${panelCounter++}`;
        dockviewApi.addPanel({
            id: newPanelId,
            component: 'terminal',
            title: `Terminal ${panelCounter - 1}`,
            position: { referencePanel: api.id, direction: 'right' },
            params: { sessionId: undefined, title: `Terminal ${panelCounter - 1}` },
        });
    }

    function handleSplitVertical() {
        if (!dockviewApi) return;

        const newPanelId = `panel-${panelCounter++}`;
        dockviewApi.addPanel({
            id: newPanelId,
            component: 'terminal',
            title: `Terminal ${panelCounter - 1}`,
            position: { referencePanel: api.id, direction: 'below' },
            params: { sessionId: undefined, title: `Terminal ${panelCounter - 1}` },
        });
    }

    function handleMaximize() {
        // Toggle maximize for the current panel's group
        if (dockviewApi && api.group) {
            const panel = dockviewApi.getPanel(api.id);
            if (panel) {
                dockviewApi.maximizeGroup(panel);
            }
        }
    }

    function handleClose() {
        api.close();
    }

    function handleRename(newTitle: string) {
        setTitle(newTitle);
        api.updateParameters({ ...params, title: newTitle });
    }

    return (
        <div className="terminal-panel-container">
            <CellTitleBar
                title={title}
                sessionId={sessionId}
                onRename={handleRename}
                onSplitHorizontal={handleSplitHorizontal}
                onSplitVertical={handleSplitVertical}
                onMaximize={handleMaximize}
                onClose={handleClose}
            />
            <div className="terminal-content">
                {sessionId ? (
                    <div className="empty-panel">
                        <p>Terminal Session: {sessionId}</p>
                        <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                            (xterm.js integration coming in Phase 2)
                        </p>
                    </div>
                ) : (
                    <div className="empty-panel">
                        <p>No session assigned</p>
                        <button className="add-session-button">Add Terminal</button>
                    </div>
                )}
            </div>
        </div>
    );
}

function createDefaultLayout(api: DockviewApi): void {
    // Create initial panel
    const panel1 = api.addPanel({
        id: 'panel-1',
        component: 'terminal',
        title: 'Terminal 1',
        params: { sessionId: undefined, title: 'Terminal 1' },
    });

    // Add a second panel to demonstrate split
    api.addPanel({
        id: 'panel-2',
        component: 'terminal',
        title: 'Terminal 2',
        position: { referencePanel: panel1, direction: 'right' },
        params: { sessionId: undefined, title: 'Terminal 2' },
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
    const [dockviewApi, setDockviewApi] = useState<DockviewApi | null>(null);
    const { updateLayout, getTabById } = useTabStore();

    function onReady(event: DockviewReadyEvent): void {
        apiRef.current = event.api;
        setDockviewApi(event.api); // Store in state for context

        const tab = getTabById(tabId);
        const hasLayout = tab?.layoutState && typeof tab.layoutState === 'object';

        if (hasLayout) {
            try {
                event.api.fromJSON(tab.layoutState as SerializedDockview);
            } catch (error) {
                console.error('Failed to restore layout:', error);
                createDefaultLayout(event.api);
            }
        } else {
            createDefaultLayout(event.api);
        }

        event.api.onDidLayoutChange(() => {
            updateLayout(tabId, event.api.toJSON());
        });
    }

    return (
        <DockviewApiContext.Provider value={dockviewApi}>
            <div className="terminal-grid-tab">
                <DockviewReact
                    onReady={onReady}
                    components={DOCKVIEW_COMPONENTS}
                    className="dockview-theme-agentdesk"
                    watermarkComponent={() => (
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            height: '100%',
                            color: 'var(--text-muted)',
                            fontSize: '14px',
                        }}>
                            Drop panels here or right-click to add
                        </div>
                    )}
                    hideBorders={false}
                    disableFloatingGroups={false}
                    singleTabMode="fullwidth"
                />
            </div>
        </DockviewApiContext.Provider>
    );
}

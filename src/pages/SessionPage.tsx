import { useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSessionStore } from '../stores/sessionStore';
import { useLayoutStore } from '../stores/layoutStore';
import SessionOutput from '../components/Terminal/SessionOutput';
import TerminalToolbar from '../components/Terminal/TerminalToolbar';
import TabBar from '../components/Workspace/TabBar';
import SplitLayout from '../components/Workspace/SplitLayout';
import WorkspaceToolbar from '../components/Workspace/WorkspaceToolbar';

export default function SessionPage() {
    const { sessionId } = useParams<{ sessionId: string }>();
    const sessions = useSessionStore((s) => s.sessions);
    const setActiveSession = useSessionStore((s) => s.setActiveSession);
    const navigate = useNavigate();

    const panes = useLayoutStore((s) => s.panes);
    const activePaneId = useLayoutStore((s) => s.activePaneId);
    const setPaneSession = useLayoutStore((s) => s.setPaneSession);
    const setActivePane = useLayoutStore((s) => s.setActivePane);
    const splitHorizontal = useLayoutStore((s) => s.splitHorizontal);
    const splitVertical = useLayoutStore((s) => s.splitVertical);
    const splitGrid = useLayoutStore((s) => s.splitGrid);
    const closeSplit = useLayoutStore((s) => s.closeSplit);

    // Sync URL session to the active pane
    useEffect(() => {
        if (sessionId && sessions.has(sessionId)) {
            setPaneSession(activePaneId, sessionId);
            setActiveSession(sessionId);
        }
    }, [sessionId, activePaneId, setPaneSession, setActiveSession, sessions]);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.ctrlKey && e.shiftKey) {
                switch (e.key) {
                    case 'D':
                    case 'd':
                        e.preventDefault();
                        splitHorizontal();
                        break;
                    case 'E':
                    case 'e':
                        e.preventDefault();
                        splitVertical();
                        break;
                    case 'G':
                    case 'g':
                        e.preventDefault();
                        splitGrid();
                        break;
                    case 'W':
                    case 'w':
                        e.preventDefault();
                        closeSplit();
                        break;
                }
            }
            // Ctrl+Tab / Ctrl+Shift+Tab for tab switching
            if (e.ctrlKey && e.key === 'Tab') {
                e.preventDefault();
                const sessionList = [...sessions.keys()];
                if (sessionList.length <= 1) return;
                const activePane = panes.find((p) => p.id === activePaneId);
                const currentIdx = sessionList.indexOf(activePane?.sessionId ?? '');
                const nextIdx = e.shiftKey
                    ? (currentIdx - 1 + sessionList.length) % sessionList.length
                    : (currentIdx + 1) % sessionList.length;
                const nextSessionId = sessionList[nextIdx];
                setPaneSession(activePaneId, nextSessionId);
                navigate(`/session/${nextSessionId}`, { replace: true });
            }
            // Ctrl+1-4 for pane focus
            if (e.ctrlKey && !e.shiftKey && !e.altKey) {
                const num = parseInt(e.key);
                if (num >= 1 && num <= 4 && num <= panes.length) {
                    e.preventDefault();
                    setActivePane(panes[num - 1].id);
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [sessions, panes, activePaneId, setPaneSession, setActivePane, splitHorizontal, splitVertical, splitGrid, closeSplit, navigate]);

    // Handle pane click to set focus
    const handlePaneClick = useCallback(
        (paneId: string) => {
            setActivePane(paneId);
            const pane = panes.find((p) => p.id === paneId);
            if (pane?.sessionId) {
                navigate(`/session/${pane.sessionId}`, { replace: true });
            }
        },
        [setActivePane, panes, navigate],
    );

    if (!sessionId || !sessions.has(sessionId)) {
        return (
            <div className="empty-state">
                <h2>Session not found</h2>
                <p>This session may have been closed.</p>
                <button className="btn-primary" onClick={() => navigate('/')}>
                    Back to Dashboard
                </button>
            </div>
        );
    }

    return (
        <div className="session-view">
            <div className="workspace-header">
                <TabBar />
                <WorkspaceToolbar />
            </div>
            <SplitLayout>
                {panes.map((pane) => {
                    const paneSession = pane.sessionId ? sessions.get(pane.sessionId) : null;
                    return (
                        <div
                            key={pane.id}
                            className={`workspace-pane ${pane.id === activePaneId ? 'pane-active' : ''}`}
                            onClick={() => handlePaneClick(pane.id)}
                        >
                            {paneSession ? (
                                <>
                                    <TerminalToolbar sessionId={pane.sessionId!} />
                                    <div className="terminal-container">
                                        <SessionOutput
                                            key={pane.sessionId}
                                            sessionConfig={paneSession.config}
                                        />
                                    </div>
                                </>
                            ) : (
                                <div className="empty-pane">
                                    <p>Select a session from the tab bar</p>
                                </div>
                            )}
                        </div>
                    );
                })}
            </SplitLayout>
        </div>
    );
}

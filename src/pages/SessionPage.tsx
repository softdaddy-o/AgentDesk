import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSessionStore } from '../stores/sessionStore';
import { useLayoutStore } from '../stores/layoutStore';
import TabBar from '../components/Workspace/TabBar';
import PaneTree from '../components/Workspace/SplitLayout';

export default function SessionPage() {
    const { sessionId } = useParams<{ sessionId: string }>();
    const sessions = useSessionStore((s) => s.sessions);
    const setActiveSession = useSessionStore((s) => s.setActiveSession);
    const navigate = useNavigate();

    const root = useLayoutStore((s) => s.root);
    const activePaneId = useLayoutStore((s) => s.activePaneId);
    const setPaneSession = useLayoutStore((s) => s.setPaneSession);
    const splitPane = useLayoutStore((s) => s.splitPane);
    const closePane = useLayoutStore((s) => s.closePane);

    // Sync URL session to the active pane (only when URL changes)
    useEffect(() => {
        if (sessionId && sessions.has(sessionId)) {
            const currentActivePaneId = useLayoutStore.getState().activePaneId;
            setPaneSession(currentActivePaneId, sessionId);
            setActiveSession(sessionId);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sessionId]);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Ctrl+Shift+D / E for split
            if (e.ctrlKey && e.shiftKey) {
                if (e.key === 'D' || e.key === 'd') {
                    e.preventDefault();
                    splitPane(activePaneId, 'horizontal');
                } else if (e.key === 'E' || e.key === 'e') {
                    e.preventDefault();
                    splitPane(activePaneId, 'vertical');
                } else if (e.key === 'W' || e.key === 'w') {
                    e.preventDefault();
                    closePane(activePaneId);
                }
            }
            // Ctrl+Tab for session cycling
            if (e.ctrlKey && e.key === 'Tab') {
                e.preventDefault();
                const sessionList = [...sessions.keys()];
                if (sessionList.length <= 1) return;
                const activeLeaf = useLayoutStore.getState().getActiveLeaf();
                const currentIdx = sessionList.indexOf(activeLeaf?.sessionId ?? '');
                const nextIdx = e.shiftKey
                    ? (currentIdx - 1 + sessionList.length) % sessionList.length
                    : (currentIdx + 1) % sessionList.length;
                const nextSessionId = sessionList[nextIdx];
                setPaneSession(activePaneId, nextSessionId);
                navigate(`/session/${nextSessionId}`, { replace: true });
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [sessions, activePaneId, setPaneSession, splitPane, closePane, navigate]);

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
            </div>
            <PaneTree node={root} />
        </div>
    );
}

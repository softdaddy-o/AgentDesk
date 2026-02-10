import { useCallback } from 'react';
import { useSessionStore } from '../../stores/sessionStore';
import { useLayoutStore } from '../../stores/layoutStore';
import SessionOutput from '../Terminal/SessionOutput';
import TerminalToolbar from '../Terminal/TerminalToolbar';

interface PaneViewProps {
    paneId: string;
    sessionId: string | null;
}

export default function PaneView({ paneId, sessionId }: PaneViewProps) {
    const session = useSessionStore((s) => sessionId ? s.sessions.get(sessionId) : undefined);
    const activePaneId = useLayoutStore((s) => s.activePaneId);
    const setActivePane = useLayoutStore((s) => s.setActivePane);
    const splitPane = useLayoutStore((s) => s.splitPane);
    const closePane = useLayoutStore((s) => s.closePane);
    const leafCount = useLayoutStore((s) => s.getLeafCount());
    const isActive = activePaneId === paneId;

    const handleClick = useCallback(
        (e: React.MouseEvent) => {
            e.stopPropagation();
            setActivePane(paneId);
        },
        [paneId, setActivePane],
    );

    return (
        <div
            className={`workspace-pane ${isActive ? 'pane-active' : ''}`}
            onClick={handleClick}
        >
            {/* Per-pane split action buttons */}
            <div className="pane-actions">
                <button
                    className="pane-action-btn"
                    onClick={(e) => { e.stopPropagation(); splitPane(paneId, 'horizontal'); }}
                    title="Split left/right"
                >
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                        <rect x="1" y="1" width="6" height="14" rx="1" stroke="currentColor" strokeWidth="1.5" />
                        <rect x="9" y="1" width="6" height="14" rx="1" stroke="currentColor" strokeWidth="1.5" />
                    </svg>
                </button>
                <button
                    className="pane-action-btn"
                    onClick={(e) => { e.stopPropagation(); splitPane(paneId, 'vertical'); }}
                    title="Split top/bottom"
                >
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                        <rect x="1" y="1" width="14" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" />
                        <rect x="1" y="9" width="14" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" />
                    </svg>
                </button>
                {leafCount > 1 && (
                    <button
                        className="pane-action-btn pane-close-btn"
                        onClick={(e) => { e.stopPropagation(); closePane(paneId); }}
                        title="Close pane"
                    >
                        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                            <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                    </button>
                )}
            </div>

            {session && sessionId ? (
                <>
                    <TerminalToolbar sessionId={sessionId} />
                    <div className="terminal-container">
                        <SessionOutput key={sessionId} sessionConfig={session.config} />
                    </div>
                </>
            ) : (
                <div className="empty-pane">
                    <p>Select a session from the tab bar</p>
                </div>
            )}
        </div>
    );
}

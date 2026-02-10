import { useSessionStore } from '../../stores/sessionStore';
import { TOOL_LABELS } from '../../lib/constants';

interface SidebarProps {
    onNewSession: () => void;
}

export default function Sidebar({ onNewSession }: SidebarProps) {
    const sessions = useSessionStore((s) => s.sessions);
    const activeSessionId = useSessionStore((s) => s.activeSessionId);
    const setActiveSession = useSessionStore((s) => s.setActiveSession);

    const statusDot: Record<string, string> = {
        Starting: '#e0af68',
        Running: '#9ece6a',
        Idle: '#7aa2f7',
        Working: '#bb9af7',
        Error: '#f7768e',
        Stopped: '#414868',
    };

    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <h1 className="app-title">AgentDesk</h1>
            </div>
            <nav className="sidebar-nav">
                <button className="new-session-btn" onClick={onNewSession}>
                    + New Session
                </button>
                <div className="session-list">
                    {[...sessions.entries()].map(([id, session]) => (
                        <button
                            key={id}
                            className={`session-item ${id === activeSessionId ? 'active' : ''}`}
                            onClick={() => setActiveSession(id)}
                        >
                            <span
                                className="status-dot"
                                style={{ backgroundColor: statusDot[session.status.type] ?? '#414868' }}
                            />
                            <span className="session-item-name">{session.config.name}</span>
                            <span className="session-item-tool">
                                {TOOL_LABELS[session.config.tool] ?? session.config.tool}
                            </span>
                        </button>
                    ))}
                </div>
            </nav>
        </aside>
    );
}

import { useNavigate, useLocation } from 'react-router-dom';
import { useSessionStore } from '../../stores/sessionStore';
import { TOOL_LABELS } from '../../lib/constants';

export default function Sidebar() {
    const sessions = useSessionStore((s) => s.sessions);
    const setActiveSession = useSessionStore((s) => s.setActiveSession);
    const navigate = useNavigate();
    const location = useLocation();

    const statusDot: Record<string, string> = {
        Starting: '#e0af68',
        Running: '#9ece6a',
        Idle: '#7aa2f7',
        Working: '#bb9af7',
        Error: '#f7768e',
        Stopped: '#414868',
    };

    const isOnDashboard = location.pathname === '/';
    const isOnTemplates = location.pathname === '/templates';
    const isOnHistory = location.pathname === '/history';
    const isOnMonitoring = location.pathname === '/monitoring';
    const isOnSettings = location.pathname === '/settings';

    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <h1 className="app-title" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
                    AgentDesk
                </h1>
            </div>
            <nav className="sidebar-nav">
                <button
                    className={`sidebar-link ${isOnDashboard ? 'active' : ''}`}
                    onClick={() => navigate('/')}
                >
                    Dashboard
                </button>

                <div className="sidebar-section-label">Sessions</div>
                <div className="session-list">
                    {[...sessions.entries()].map(([id, session]) => {
                        const isActive = location.pathname === `/session/${id}`;
                        return (
                            <button
                                key={id}
                                className={`session-item ${isActive ? 'active' : ''}`}
                                onClick={() => {
                                    setActiveSession(id);
                                    navigate(`/session/${id}`);
                                }}
                            >
                                <span
                                    className="status-dot"
                                    style={{
                                        backgroundColor: statusDot[session.status.type] ?? '#414868',
                                    }}
                                />
                                <span className="session-item-name">{session.config.name}</span>
                                <span className="session-item-tool">
                                    {TOOL_LABELS[session.config.tool] ?? session.config.tool}
                                </span>
                            </button>
                        );
                    })}
                </div>

                <div className="sidebar-section-label">Tools</div>
                <button
                    className={`sidebar-link ${isOnTemplates ? 'active' : ''}`}
                    onClick={() => navigate('/templates')}
                >
                    Templates
                </button>
                <button
                    className={`sidebar-link ${isOnHistory ? 'active' : ''}`}
                    onClick={() => navigate('/history')}
                >
                    History
                </button>
                <button
                    className={`sidebar-link ${isOnMonitoring ? 'active' : ''}`}
                    onClick={() => navigate('/monitoring')}
                >
                    Monitoring
                </button>

                <div className="sidebar-spacer" />

                <button
                    className={`sidebar-link ${isOnSettings ? 'active' : ''}`}
                    onClick={() => navigate('/settings')}
                >
                    Settings
                </button>
            </nav>
        </aside>
    );
}

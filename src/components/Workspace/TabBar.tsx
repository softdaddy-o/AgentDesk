import { useSessionStore } from '../../stores/sessionStore';
import { useLayoutStore } from '../../stores/layoutStore';

const STATUS_COLORS: Record<string, string> = {
    Starting: '#e0af68',
    Running: '#9ece6a',
    Idle: '#7aa2f7',
    Working: '#bb9af7',
    Error: '#f7768e',
    Stopped: '#414868',
};

export default function TabBar() {
    const sessions = useSessionStore((s) => s.sessions);
    const panes = useLayoutStore((s) => s.panes);
    const activePaneId = useLayoutStore((s) => s.activePaneId);
    const setPaneSession = useLayoutStore((s) => s.setPaneSession);

    const activePaneSessionId = panes.find((p) => p.id === activePaneId)?.sessionId;
    const sessionList = [...sessions.entries()];

    if (sessionList.length === 0) return null;

    return (
        <div className="tab-bar">
            {sessionList.map(([id, session]) => (
                <button
                    key={id}
                    className={`tab-item ${id === activePaneSessionId ? 'active' : ''}`}
                    onClick={() => setPaneSession(activePaneId, id)}
                    title={session.config.name}
                >
                    <span
                        className="tab-dot"
                        style={{ background: STATUS_COLORS[session.status.type] ?? '#565f89' }}
                    />
                    <span className="tab-name">{session.config.name}</span>
                    <span className="tab-tool">{session.config.tool}</span>
                </button>
            ))}
        </div>
    );
}

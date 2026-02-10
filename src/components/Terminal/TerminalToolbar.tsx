import { useSessionStore } from '../../stores/sessionStore';
import { stopSession } from '../../lib/tauri-commands';
import { TOOL_LABELS } from '../../lib/constants';

interface TerminalToolbarProps {
    sessionId: string;
}

export default function TerminalToolbar({ sessionId }: TerminalToolbarProps) {
    const session = useSessionStore((s) => s.sessions.get(sessionId));
    if (!session) return null;

    const statusText = session.status.type === 'Error'
        ? `Error: ${session.status.message}`
        : session.status.type;

    const statusColor: Record<string, string> = {
        Starting: '#e0af68',
        Running: '#9ece6a',
        Idle: '#7aa2f7',
        Working: '#bb9af7',
        Error: '#f7768e',
        Stopped: '#414868',
    };

    const handleStop = () => {
        stopSession(sessionId);
    };

    return (
        <div className="terminal-toolbar">
            <div className="terminal-toolbar-left">
                <span className="session-name">{session.config.name}</span>
                <span className="session-tool">
                    {TOOL_LABELS[session.config.tool] ?? session.config.tool}
                </span>
                <span
                    className="session-status"
                    style={{ color: statusColor[session.status.type] ?? '#a9b1d6' }}
                >
                    {statusText}
                </span>
            </div>
            <div className="terminal-toolbar-right">
                <span className="session-cwd" title={session.config.workingDir}>
                    {session.config.workingDir}
                </span>
                {session.status.type !== 'Stopped' && (
                    <button className="toolbar-btn stop-btn" onClick={handleStop} title="Stop session">
                        Stop
                    </button>
                )}
            </div>
        </div>
    );
}

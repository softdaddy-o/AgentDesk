import type { Session } from '../../lib/types';
import { TOOL_LABELS } from '../../lib/constants';
import SessionBadge from './SessionBadge';

interface SessionCardProps {
    session: Session;
    onClick: () => void;
    onStop: () => void;
}

export default function SessionCard({ session, onClick, onStop }: SessionCardProps) {
    const { config, status, lastActivity } = session;
    const ago = formatTimeAgo(lastActivity);

    return (
        <div className="session-card" onClick={onClick}>
            <div className="session-card-header">
                <span className="session-card-name">{config.name}</span>
                <SessionBadge status={status} />
            </div>
            <div className="session-card-meta">
                <span className="session-card-tool">
                    {TOOL_LABELS[config.tool] ?? config.tool}
                </span>
                <span className="session-card-dir" title={config.workingDir}>
                    {config.workingDir}
                </span>
            </div>
            <div className="session-card-footer">
                <span className="session-card-time">{ago}</span>
                {status.type !== 'Stopped' && (
                    <button
                        className="toolbar-btn stop-btn"
                        onClick={(e) => {
                            e.stopPropagation();
                            onStop();
                        }}
                    >
                        Stop
                    </button>
                )}
            </div>
        </div>
    );
}

function formatTimeAgo(timestamp: number): string {
    const diff = Date.now() - timestamp;
    const seconds = Math.floor(diff / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
}

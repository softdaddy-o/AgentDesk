import type { SessionStatus } from '../../lib/types';

interface SessionBadgeProps {
    status: SessionStatus;
}

const STATUS_COLORS: Record<string, string> = {
    Starting: '#e0af68',
    Running: '#9ece6a',
    Idle: '#7aa2f7',
    Working: '#bb9af7',
    Error: '#f7768e',
    Stopped: '#414868',
};

export default function SessionBadge({ status }: SessionBadgeProps) {
    const label = status.type === 'Error' ? 'Error' : status.type;
    const color = STATUS_COLORS[status.type] ?? '#414868';

    return (
        <span className="session-badge" style={{ color, borderColor: color }}>
            <span className="badge-dot" style={{ backgroundColor: color }} />
            {label}
        </span>
    );
}

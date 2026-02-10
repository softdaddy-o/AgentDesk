import { useSessionStore } from '../../stores/sessionStore';

export default function StatusBar() {
    const sessions = useSessionStore((s) => s.sessions);
    const running = [...sessions.values()].filter(
        (s) => s.status.type === 'Running' || s.status.type === 'Working',
    ).length;
    const total = sessions.size;

    return (
        <footer className="status-bar">
            <span>Sessions: {running} active / {total} total</span>
        </footer>
    );
}

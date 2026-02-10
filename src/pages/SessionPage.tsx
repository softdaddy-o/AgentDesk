import { useParams, useNavigate } from 'react-router-dom';
import { useSessionStore } from '../stores/sessionStore';
import SessionOutput from '../components/Terminal/SessionOutput';
import TerminalToolbar from '../components/Terminal/TerminalToolbar';

export default function SessionPage() {
    const { sessionId } = useParams<{ sessionId: string }>();
    const session = useSessionStore((s) => sessionId ? s.sessions.get(sessionId) : undefined);
    const navigate = useNavigate();

    if (!sessionId || !session) {
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
            <TerminalToolbar sessionId={sessionId} />
            <div className="terminal-container">
                <SessionOutput key={sessionId} sessionConfig={session.config} />
            </div>
        </div>
    );
}

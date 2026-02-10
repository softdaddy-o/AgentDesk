import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSessionStore } from '../stores/sessionStore';

export function useKeyboard() {
    const navigate = useNavigate();
    const sessions = useSessionStore((s) => s.sessions);
    const activeSessionId = useSessionStore((s) => s.activeSessionId);
    const setActiveSession = useSessionStore((s) => s.setActiveSession);

    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            // Ctrl+N: New session (navigate to dashboard)
            if (e.ctrlKey && e.key === 'n') {
                e.preventDefault();
                navigate('/');
                return;
            }

            // Ctrl+D: Dashboard
            if (e.ctrlKey && e.key === 'd') {
                e.preventDefault();
                navigate('/');
                return;
            }

            const ids = [...sessions.keys()];
            if (ids.length === 0) return;

            const currentIdx = activeSessionId ? ids.indexOf(activeSessionId) : -1;

            // Ctrl+Tab: Next session
            if (e.ctrlKey && e.key === 'Tab' && !e.shiftKey) {
                e.preventDefault();
                const nextIdx = (currentIdx + 1) % ids.length;
                const nextId = ids[nextIdx];
                setActiveSession(nextId);
                navigate(`/session/${nextId}`);
                return;
            }

            // Ctrl+Shift+Tab: Previous session
            if (e.ctrlKey && e.shiftKey && e.key === 'Tab') {
                e.preventDefault();
                const prevIdx = (currentIdx - 1 + ids.length) % ids.length;
                const prevId = ids[prevIdx];
                setActiveSession(prevId);
                navigate(`/session/${prevId}`);
                return;
            }

            // Ctrl+1-9: Jump to session by index
            if (e.ctrlKey && e.key >= '1' && e.key <= '9') {
                const idx = parseInt(e.key) - 1;
                if (idx < ids.length) {
                    e.preventDefault();
                    const id = ids[idx];
                    setActiveSession(id);
                    navigate(`/session/${id}`);
                }
            }
        };

        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [navigate, sessions, activeSessionId, setActiveSession]);
}

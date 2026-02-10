import { useState } from 'react';
import type { SavedSession } from '../../lib/types';

interface RestoreDialogProps {
    sessions: SavedSession[];
    onRestore: (sessionIds: string[]) => void;
    onDismiss: () => void;
}

export default function RestoreDialog({ sessions, onRestore, onDismiss }: RestoreDialogProps) {
    const [selected, setSelected] = useState<Set<string>>(
        new Set(sessions.map((s) => s.id)),
    );

    const toggleSession = (id: string) => {
        setSelected((prev) => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    };

    return (
        <div className="dialog-overlay">
            <div className="dialog">
                <h2>Restore Previous Sessions?</h2>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
                    {sessions.length} session{sessions.length !== 1 ? 's were' : ' was'} running when the app last closed.
                </p>
                <div className="restore-session-list">
                    {sessions.map((session) => (
                        <label key={session.id} className="restore-session-item">
                            <input
                                type="checkbox"
                                checked={selected.has(session.id)}
                                onChange={() => toggleSession(session.id)}
                            />
                            <span className="restore-session-name">{session.name}</span>
                            <span className="restore-session-tool">{session.tool}</span>
                        </label>
                    ))}
                </div>
                <div className="dialog-actions">
                    <button className="btn-secondary" onClick={onDismiss}>
                        Dismiss
                    </button>
                    <button
                        className="btn-primary"
                        onClick={() => onRestore([...selected])}
                        disabled={selected.size === 0}
                    >
                        Restore ({selected.size})
                    </button>
                </div>
            </div>
        </div>
    );
}

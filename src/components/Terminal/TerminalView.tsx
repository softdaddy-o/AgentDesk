import { useEffect, useRef, useCallback, useState } from 'react';
import { useTerminal } from '../../hooks/useTerminal';
import { usePtyChannel } from '../../hooks/usePtyChannel';
import { createSession, writeToPty, resizePty } from '../../lib/tauri-commands';
import { useSessionStore } from '../../stores/sessionStore';
import { useToastStore } from '../../stores/toastStore';
import type { SessionConfig } from '../../lib/types';
import '@xterm/xterm/css/xterm.css';

interface TerminalViewProps {
    sessionConfig: SessionConfig;
    onOutput?: (text: string) => void;
}

export default function TerminalView({ sessionConfig, onOutput }: TerminalViewProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const sessionIdRef = useRef<string>(sessionConfig.id);
    const initializedRef = useRef(false);
    const updateStatus = useSessionStore((s) => s.updateStatus);
    const updateActivity = useSessionStore((s) => s.updateActivity);
    const addToast = useToastStore((s) => s.addToast);
    const [error, setError] = useState<string | null>(null);

    const onData = useCallback(
        (data: string) => {
            writeToPty(sessionIdRef.current, data);
        },
        [],
    );

    const onResize = useCallback(
        (cols: number, rows: number) => {
            resizePty(sessionIdRef.current, cols, rows);
        },
        [],
    );

    const { attach, write, fit } = useTerminal({ onData, onResize });

    const { getChannel } = usePtyChannel({
        onData: (data) => {
            write(data);
            updateActivity(sessionIdRef.current);
            if (onOutput) {
                const text = new TextDecoder().decode(data);
                onOutput(text);
            }
        },
        onExit: (exitCode) => {
            updateStatus(sessionIdRef.current, { type: 'Stopped' });
            addToast(`Session exited with code ${exitCode ?? 'unknown'}`, 'info');
        },
        onError: (message) => {
            updateStatus(sessionIdRef.current, { type: 'Error', message });
            addToast(`Session error: ${message}`, 'error');
        },
    });

    const initSession = useCallback(() => {
        if (!containerRef.current) return;

        setError(null);
        attach(containerRef.current);

        const channel = getChannel();
        const sid = sessionConfig.id;
        createSession(sessionConfig, channel as never)
            .then(() => {
                updateStatus(sid, { type: 'Running' });
                fit();
            })
            .catch((err) => {
                const message = String(err);
                updateStatus(sid, { type: 'Error', message });
                setError(message);
                addToast(`Failed to create session: ${message}`, 'error');
            });
    }, [sessionConfig, attach, getChannel, fit, updateStatus, addToast]);

    useEffect(() => {
        if (!containerRef.current || initializedRef.current) return;
        initializedRef.current = true;
        initSession();

        return () => {
            initializedRef.current = false;
        };
    }, [initSession]);

    const handleRetry = () => {
        initializedRef.current = false;
        setError(null);
        // Re-trigger init on next render
        setTimeout(() => {
            if (containerRef.current) {
                initializedRef.current = true;
                initSession();
            }
        }, 0);
    };

    return (
        <div style={{ width: '100%', height: '100%', position: 'relative', backgroundColor: '#1a1b26' }}>
            <div
                ref={containerRef}
                style={{
                    width: '100%',
                    height: '100%',
                    display: error ? 'none' : 'block',
                }}
            />
            {error && (
                <div className="terminal-error-overlay">
                    <div className="terminal-error-content">
                        <h3>Failed to start session</h3>
                        <p>{error}</p>
                        <button className="btn-primary" onClick={handleRetry}>
                            Retry
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

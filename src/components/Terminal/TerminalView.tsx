import { useEffect, useRef, useCallback } from 'react';
import { useTerminal } from '../../hooks/useTerminal';
import { usePtyChannel } from '../../hooks/usePtyChannel';
import { createSession, writeToPty, resizePty } from '../../lib/tauri-commands';
import { useSessionStore } from '../../stores/sessionStore';
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
            console.log(`Session ${sessionIdRef.current} exited with code ${exitCode}`);
        },
        onError: (message) => {
            updateStatus(sessionIdRef.current, { type: 'Error', message });
            console.error(`Session ${sessionIdRef.current} error: ${message}`);
        },
    });

    useEffect(() => {
        if (!containerRef.current || initializedRef.current) return;
        initializedRef.current = true;

        attach(containerRef.current);

        const channel = getChannel();
        createSession(sessionConfig, channel as never)
            .then(() => {
                updateStatus(sessionConfig.id, { type: 'Running' });
                fit();
            })
            .catch((err) => {
                updateStatus(sessionConfig.id, { type: 'Error', message: String(err) });
            });
    }, [sessionConfig, attach, getChannel, fit, updateStatus]);

    return (
        <div
            ref={containerRef}
            style={{
                width: '100%',
                height: '100%',
                backgroundColor: '#1a1b26',
            }}
        />
    );
}

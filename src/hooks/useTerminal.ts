import { useEffect, useRef, useCallback } from 'react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { WebglAddon } from '@xterm/addon-webgl';

interface UseTerminalOptions {
    onData: (data: string) => void;
    onResize: (cols: number, rows: number) => void;
}

export function useTerminal({ onData, onResize }: UseTerminalOptions) {
    const terminalRef = useRef<Terminal | null>(null);
    const fitAddonRef = useRef<FitAddon | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const callbacksRef = useRef({ onData, onResize });
    callbacksRef.current = { onData, onResize };

    const attach = useCallback((container: HTMLDivElement) => {
        if (terminalRef.current) return;
        containerRef.current = container;

        const terminal = new Terminal({
            cursorBlink: true,
            fontSize: 14,
            fontFamily: "'Cascadia Code', 'Fira Code', 'Consolas', monospace",
            theme: {
                background: '#1a1b26',
                foreground: '#a9b1d6',
                cursor: '#c0caf5',
                selectionBackground: '#33467c',
                black: '#15161e',
                red: '#f7768e',
                green: '#9ece6a',
                yellow: '#e0af68',
                blue: '#7aa2f7',
                magenta: '#bb9af7',
                cyan: '#7dcfff',
                white: '#a9b1d6',
                brightBlack: '#414868',
                brightRed: '#f7768e',
                brightGreen: '#9ece6a',
                brightYellow: '#e0af68',
                brightBlue: '#7aa2f7',
                brightMagenta: '#bb9af7',
                brightCyan: '#7dcfff',
                brightWhite: '#c0caf5',
            },
            allowProposedApi: true,
        });

        const fitAddon = new FitAddon();
        terminal.loadAddon(fitAddon);

        terminal.open(container);

        try {
            const webglAddon = new WebglAddon();
            webglAddon.onContextLoss(() => {
                webglAddon.dispose();
            });
            terminal.loadAddon(webglAddon);
        } catch {
            // WebGL not available, fall back to canvas
        }

        fitAddon.fit();

        terminal.onData((data) => {
            callbacksRef.current.onData(data);
        });

        terminal.onResize(({ cols, rows }) => {
            callbacksRef.current.onResize(cols, rows);
        });

        terminalRef.current = terminal;
        fitAddonRef.current = fitAddon;
    }, []);

    const write = useCallback((data: Uint8Array) => {
        terminalRef.current?.write(data);
    }, []);

    const fit = useCallback(() => {
        fitAddonRef.current?.fit();
    }, []);

    useEffect(() => {
        const handleResize = () => {
            fitAddonRef.current?.fit();
        };
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
            terminalRef.current?.dispose();
            terminalRef.current = null;
            fitAddonRef.current = null;
        };
    }, []);

    return { attach, write, fit, terminalRef };
}

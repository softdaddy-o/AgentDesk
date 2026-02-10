import { useState, useRef, useCallback } from 'react';
import TerminalView from './TerminalView';
import MarkdownView from './MarkdownView';
import { ansiToMarkdown } from '../../lib/ansi-to-markdown';
import type { SessionConfig } from '../../lib/types';

interface SessionOutputProps {
    sessionConfig: SessionConfig;
}

export default function SessionOutput({ sessionConfig }: SessionOutputProps) {
    const [mode, setMode] = useState<'raw' | 'markdown'>('raw');
    const [markdownContent, setMarkdownContent] = useState('');
    const outputBufferRef = useRef('');

    const appendToBuffer = useCallback((text: string) => {
        outputBufferRef.current += text;
    }, []);

    const switchToMarkdown = useCallback(() => {
        setMarkdownContent(ansiToMarkdown(outputBufferRef.current));
        setMode('markdown');
    }, []);

    return (
        <div className="session-output">
            <div className="output-mode-toggle">
                <button
                    className={`mode-btn ${mode === 'raw' ? 'active' : ''}`}
                    onClick={() => setMode('raw')}
                >
                    Terminal
                </button>
                <button
                    className={`mode-btn ${mode === 'markdown' ? 'active' : ''}`}
                    onClick={switchToMarkdown}
                >
                    Markdown
                </button>
            </div>
            <div className="output-content">
                {/* Terminal is always mounted (hidden when not active) to preserve state */}
                <div style={{ display: mode === 'raw' ? 'block' : 'none', height: '100%' }}>
                    <TerminalView
                        sessionConfig={sessionConfig}
                        onOutput={appendToBuffer}
                    />
                </div>
                {mode === 'markdown' && (
                    <MarkdownView content={markdownContent} />
                )}
            </div>
        </div>
    );
}

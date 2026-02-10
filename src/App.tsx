import { useState, useCallback } from 'react';
import Sidebar from './components/Layout/Sidebar';
import StatusBar from './components/Layout/StatusBar';
import TerminalView from './components/Terminal/TerminalView';
import TerminalToolbar from './components/Terminal/TerminalToolbar';
import { useSessionStore } from './stores/sessionStore';
import { DEFAULT_COLS, DEFAULT_ROWS, TOOL_COMMANDS } from './lib/constants';
import type { CliTool, SessionConfig } from './lib/types';

function App() {
    const sessions = useSessionStore((s) => s.sessions);
    const activeSessionId = useSessionStore((s) => s.activeSessionId);
    const addSession = useSessionStore((s) => s.addSession);
    const [showNewSession, setShowNewSession] = useState(false);

    const handleNewSession = useCallback(() => {
        setShowNewSession(true);
    }, []);

    const handleCreateSession = useCallback(
        (tool: CliTool, name: string, workingDir: string) => {
            const id = crypto.randomUUID();
            const toolConfig = TOOL_COMMANDS[tool] ?? TOOL_COMMANDS.Custom;
            const config: SessionConfig = {
                id,
                name: name || `Session ${sessions.size + 1}`,
                tool,
                command: tool === 'Custom' ? 'cmd.exe' : toolConfig.command,
                args: toolConfig.args,
                workingDir: workingDir || 'C:\\',
                envVars: {},
                cols: DEFAULT_COLS,
                rows: DEFAULT_ROWS,
            };
            addSession(config);
            setShowNewSession(false);
        },
        [addSession, sessions.size],
    );

    const activeSession = activeSessionId ? sessions.get(activeSessionId) : null;

    return (
        <div className="app-shell">
            <Sidebar onNewSession={handleNewSession} />
            <main className="main-content">
                {activeSession ? (
                    <div className="session-view">
                        <TerminalToolbar sessionId={activeSessionId!} />
                        <div className="terminal-container">
                            <TerminalView
                                key={activeSessionId}
                                sessionConfig={activeSession.config}
                            />
                        </div>
                    </div>
                ) : (
                    <div className="empty-state">
                        <h2>Welcome to AgentDesk</h2>
                        <p>Create a new session to get started</p>
                        <button className="new-session-btn" onClick={handleNewSession}>
                            + New Session
                        </button>
                    </div>
                )}
            </main>
            <StatusBar />

            {showNewSession && (
                <NewSessionDialog
                    onClose={() => setShowNewSession(false)}
                    onCreate={handleCreateSession}
                />
            )}
        </div>
    );
}

function NewSessionDialog({
    onClose,
    onCreate,
}: {
    onClose: () => void;
    onCreate: (tool: CliTool, name: string, workingDir: string) => void;
}) {
    const [tool, setTool] = useState<CliTool>('ClaudeCode');
    const [name, setName] = useState('');
    const [workingDir, setWorkingDir] = useState('');

    const tools: CliTool[] = ['ClaudeCode', 'Codex', 'Aider', 'Cline', 'Custom'];

    return (
        <div className="dialog-overlay" onClick={onClose}>
            <div className="dialog" onClick={(e) => e.stopPropagation()}>
                <h2>New Session</h2>
                <div className="form-group">
                    <label>Tool</label>
                    <div className="tool-grid">
                        {tools.map((t) => (
                            <button
                                key={t}
                                className={`tool-option ${tool === t ? 'selected' : ''}`}
                                onClick={() => setTool(t)}
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="form-group">
                    <label>Session Name</label>
                    <input
                        type="text"
                        placeholder="My Session"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </div>
                <div className="form-group">
                    <label>Working Directory</label>
                    <input
                        type="text"
                        placeholder="C:\projects\my-app"
                        value={workingDir}
                        onChange={(e) => setWorkingDir(e.target.value)}
                    />
                </div>
                <div className="dialog-actions">
                    <button className="btn-secondary" onClick={onClose}>
                        Cancel
                    </button>
                    <button
                        className="btn-primary"
                        onClick={() => onCreate(tool, name, workingDir)}
                    >
                        Create
                    </button>
                </div>
            </div>
        </div>
    );
}

export default App;

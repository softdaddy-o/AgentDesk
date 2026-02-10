import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSessionStore } from '../stores/sessionStore';
import SessionCard from '../components/Session/SessionCard';
import SessionConfigDialog from '../components/Session/SessionConfigDialog';
import QuickLaunchBar from '../components/Session/QuickLaunchBar';
import { stopSession } from '../lib/tauri-commands';
import { DEFAULT_COLS, DEFAULT_ROWS, TOOL_COMMANDS } from '../lib/constants';
import type { CliTool, SessionConfig } from '../lib/types';

export default function DashboardPage() {
    const sessions = useSessionStore((s) => s.sessions);
    const addSession = useSessionStore((s) => s.addSession);
    const setActiveSession = useSessionStore((s) => s.setActiveSession);
    const [showDialog, setShowDialog] = useState(false);
    const navigate = useNavigate();

    const handleCreate = useCallback(
        (tool: CliTool, name: string, workingDir: string) => {
            const id = crypto.randomUUID();
            const toolConfig = TOOL_COMMANDS[tool] ?? TOOL_COMMANDS.Custom;
            const config: SessionConfig = {
                id,
                name: name || `${tool} Session`,
                tool,
                command: tool === 'Custom' ? 'cmd.exe' : toolConfig.command,
                args: toolConfig.args,
                workingDir: workingDir || 'C:\\',
                envVars: {},
                cols: DEFAULT_COLS,
                rows: DEFAULT_ROWS,
            };
            addSession(config);
            setActiveSession(id);
            setShowDialog(false);
            navigate(`/session/${id}`);
        },
        [addSession, setActiveSession, navigate],
    );

    const handleQuickLaunch = useCallback(
        (tool: CliTool) => {
            handleCreate(tool, '', '');
        },
        [handleCreate],
    );

    const handleCardClick = useCallback(
        (id: string) => {
            setActiveSession(id);
            navigate(`/session/${id}`);
        },
        [setActiveSession, navigate],
    );

    const handleStop = useCallback((id: string) => {
        stopSession(id);
    }, []);

    const sessionList = [...sessions.entries()];

    return (
        <div className="dashboard-page">
            <div className="dashboard-header">
                <h1>Dashboard</h1>
                <div className="dashboard-actions">
                    <button className="btn-primary" onClick={() => setShowDialog(true)}>
                        + New Session
                    </button>
                </div>
            </div>
            <QuickLaunchBar onLaunch={handleQuickLaunch} />
            {sessionList.length === 0 ? (
                <div className="empty-state">
                    <h2>No sessions yet</h2>
                    <p>Create a new session to get started with your AI agent workflow.</p>
                    <button className="btn-primary" onClick={() => setShowDialog(true)}>
                        + Create First Session
                    </button>
                </div>
            ) : (
                <div className="session-grid">
                    {sessionList.map(([id, session]) => (
                        <SessionCard
                            key={id}
                            session={session}
                            onClick={() => handleCardClick(id)}
                            onStop={() => handleStop(id)}
                        />
                    ))}
                </div>
            )}
            {showDialog && (
                <SessionConfigDialog
                    onClose={() => setShowDialog(false)}
                    onCreate={handleCreate}
                />
            )}
        </div>
    );
}

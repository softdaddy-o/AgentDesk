import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSessionStore } from '../stores/sessionStore';
import SessionCard from '../components/Session/SessionCard';
import SessionConfigDialog from '../components/Session/SessionConfigDialog';
import QuickLaunchBar from '../components/Session/QuickLaunchBar';
import RestoreDialog from '../components/Session/RestoreDialog';
import {
    stopSession,
    getPlatformDefaults,
    saveSessionConfig,
    listRestorableSessions,
    updateSavedSessionStatus,
    markStaleSessionsStopped,
    type PlatformDefaults,
} from '../lib/tauri-commands';
import { DEFAULT_COLS, DEFAULT_ROWS, TOOL_COMMANDS } from '../lib/constants';
import type { CliTool, SessionConfig, SavedSession } from '../lib/types';

export default function DashboardPage() {
    const sessions = useSessionStore((s) => s.sessions);
    const addSession = useSessionStore((s) => s.addSession);
    const setActiveSession = useSessionStore((s) => s.setActiveSession);
    const [showDialog, setShowDialog] = useState(false);
    const [platform, setPlatform] = useState<PlatformDefaults | null>(null);
    const [restorableSessions, setRestorableSessions] = useState<SavedSession[]>([]);
    const navigate = useNavigate();

    // On mount: load platform defaults and check for restorable sessions
    useEffect(() => {
        getPlatformDefaults().then(setPlatform);
        listRestorableSessions().then((sessions) => {
            if (sessions.length > 0) {
                setRestorableSessions(sessions);
            }
        });
    }, []);

    const handleCreate = useCallback(
        (tool: CliTool, name: string, workingDir: string) => {
            const id = crypto.randomUUID();
            const toolConfig = TOOL_COMMANDS[tool] ?? TOOL_COMMANDS.Custom;
            const defaultShell = platform?.defaultShell ?? 'cmd.exe';
            const defaultHome = platform?.homeDir ?? '';
            const config: SessionConfig = {
                id,
                name: name || `${tool} Session`,
                tool,
                command: tool === 'Custom' ? defaultShell : toolConfig.command,
                args: tool === 'Custom' ? (platform?.defaultShellArgs ?? []) : toolConfig.args,
                workingDir: workingDir || defaultHome,
                envVars: {},
                cols: DEFAULT_COLS,
                rows: DEFAULT_ROWS,
            };
            addSession(config);
            setActiveSession(id);
            setShowDialog(false);

            // Persist to DB
            saveSessionConfig({
                id: config.id,
                name: config.name,
                tool: config.tool,
                command: config.command,
                args: config.args,
                workingDir: config.workingDir,
                envVars: config.envVars,
                cols: config.cols,
                rows: config.rows,
                status: 'running',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            });

            navigate(`/session/${id}`);
        },
        [addSession, setActiveSession, navigate, platform],
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
        updateSavedSessionStatus(id, 'stopped');
    }, []);

    const handleRestore = useCallback(
        (sessionIds: string[]) => {
            const toRestore = restorableSessions.filter((s) => sessionIds.includes(s.id));
            for (const saved of toRestore) {
                const config: SessionConfig = {
                    id: saved.id,
                    name: saved.name,
                    tool: saved.tool as CliTool,
                    command: saved.command,
                    args: saved.args,
                    workingDir: saved.workingDir,
                    envVars: saved.envVars,
                    cols: saved.cols,
                    rows: saved.rows,
                };
                addSession(config);
                updateSavedSessionStatus(saved.id, 'running');
            }
            // Mark non-restored as stopped
            const dismissed = restorableSessions.filter((s) => !sessionIds.includes(s.id));
            for (const s of dismissed) {
                updateSavedSessionStatus(s.id, 'stopped');
            }
            setRestorableSessions([]);
            if (toRestore.length > 0) {
                setActiveSession(toRestore[0].id);
                navigate(`/session/${toRestore[0].id}`);
            }
        },
        [restorableSessions, addSession, setActiveSession, navigate],
    );

    const handleDismissRestore = useCallback(() => {
        markStaleSessionsStopped();
        setRestorableSessions([]);
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
            {restorableSessions.length > 0 && (
                <RestoreDialog
                    sessions={restorableSessions}
                    onRestore={handleRestore}
                    onDismiss={handleDismissRestore}
                />
            )}
        </div>
    );
}

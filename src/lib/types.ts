export type CliTool = 'ClaudeCode' | 'Codex' | 'Aider' | 'Cline' | 'Custom';

export type SessionStatus =
    | { type: 'Starting' }
    | { type: 'Running' }
    | { type: 'Idle' }
    | { type: 'Working' }
    | { type: 'Error'; message: string }
    | { type: 'Stopped' };

export interface SessionConfig {
    id: string;
    name: string;
    tool: CliTool;
    command: string;
    args: string[];
    workingDir: string;
    envVars: Record<string, string>;
    cols: number;
    rows: number;
}

export interface Session {
    config: SessionConfig;
    status: SessionStatus;
    createdAt: number;
    lastActivity: number;
    pid?: number;
}

export interface TokenUsage {
    inputTokens: number;
    outputTokens: number;
    totalCost: number;
}

export interface PtyOutputEvent {
    type: 'data' | 'exited' | 'error';
    sessionId: string;
    data?: number[];
    exitCode?: number;
    message?: string;
}

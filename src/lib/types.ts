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

// Templates
export interface PromptTemplate {
    id: string;
    name: string;
    tool: string;
    prompt: string;
    description: string;
    tags: string[];
    createdAt: string;
    updatedAt: string;
}

export interface CreateTemplate {
    name: string;
    tool: string;
    prompt: string;
    description: string;
    tags: string[];
}

export interface UpdateTemplate {
    name?: string;
    tool?: string;
    prompt?: string;
    description?: string;
    tags?: string[];
}

// History
export interface HistoryEntry {
    id: number;
    sessionId: string;
    content: string;
    createdAt: string;
}

export interface SearchQuery {
    query: string;
    sessionId?: string;
    limit?: number;
    offset?: number;
}

export interface SearchResult {
    entries: HistoryEntry[];
    total: number;
}

// Monitoring
export interface TokenUsageRecord {
    id: number;
    sessionId: string;
    inputTokens: number;
    outputTokens: number;
    model: string;
    costUsd: number;
    recordedAt: string;
}

export interface RecordTokenUsage {
    sessionId: string;
    inputTokens: number;
    outputTokens: number;
    model: string;
    costUsd: number;
}

export interface SessionCostSummary {
    sessionId: string;
    totalInputTokens: number;
    totalOutputTokens: number;
    totalCostUsd: number;
    recordCount: number;
}

export interface GlobalCostSummary {
    totalInputTokens: number;
    totalOutputTokens: number;
    totalCostUsd: number;
    sessionCount: number;
    perSession: SessionCostSummary[];
}

export const DEFAULT_COLS = 120;
export const DEFAULT_ROWS = 30;

export const TOOL_COMMANDS: Record<string, { command: string; args: string[] }> = {
    ClaudeCode: { command: 'claude', args: [] },
    Codex: { command: 'codex', args: [] },
    Aider: { command: 'aider', args: [] },
    Cline: { command: 'cline', args: [] },
    Custom: { command: '', args: [] },
};

export const TOOL_LABELS: Record<string, string> = {
    ClaudeCode: 'Claude Code',
    Codex: 'Codex',
    Aider: 'Aider',
    Cline: 'Cline',
    Custom: 'Custom',
};

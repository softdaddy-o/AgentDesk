import { invoke, Channel } from '@tauri-apps/api/core';
import type { SessionConfig, PtyOutputEvent, PromptTemplate, CreateTemplate, UpdateTemplate, SearchQuery, SearchResult, RecordTokenUsage, TokenUsageRecord, SessionCostSummary, GlobalCostSummary, SavedSession } from './types';

export async function createSession(
    config: SessionConfig,
    onEvent: Channel<PtyOutputEvent>,
): Promise<string> {
    return invoke('create_session', { config, onEvent });
}

export async function writeToPty(sessionId: string, data: string): Promise<void> {
    return invoke('write_to_pty', { sessionId, data });
}

export async function resizePty(sessionId: string, cols: number, rows: number): Promise<void> {
    return invoke('resize_pty', { sessionId, cols, rows });
}

export async function stopSession(sessionId: string): Promise<void> {
    return invoke('stop_session', { sessionId });
}

export async function listSessions(): Promise<SessionConfig[]> {
    return invoke('list_sessions');
}

// Templates
export async function createTemplate(input: CreateTemplate): Promise<PromptTemplate> {
    return invoke('create_template', { input });
}

export async function listTemplates(): Promise<PromptTemplate[]> {
    return invoke('list_templates');
}

export async function getTemplate(id: string): Promise<PromptTemplate> {
    return invoke('get_template', { id });
}

export async function updateTemplate(id: string, input: UpdateTemplate): Promise<PromptTemplate> {
    return invoke('update_template', { id, input });
}

export async function deleteTemplate(id: string): Promise<void> {
    return invoke('delete_template', { id });
}

// History
export async function searchHistory(query: SearchQuery): Promise<SearchResult> {
    return invoke('search_history', { query });
}

export async function getSessionLog(sessionId: string): Promise<string> {
    return invoke('get_session_log', { sessionId });
}

export async function insertSessionLog(sessionId: string, content: string): Promise<void> {
    return invoke('insert_session_log', { sessionId, content });
}

// Monitoring
export async function recordTokenUsage(input: RecordTokenUsage): Promise<void> {
    return invoke('record_token_usage', { input });
}

export async function getSessionUsage(sessionId: string): Promise<TokenUsageRecord[]> {
    return invoke('get_session_usage', { sessionId });
}

export async function getSessionCostSummary(sessionId: string): Promise<SessionCostSummary> {
    return invoke('get_session_cost_summary', { sessionId });
}

export async function getGlobalCostSummary(): Promise<GlobalCostSummary> {
    return invoke('get_global_cost_summary');
}

// Session Persistence
export async function saveSessionConfig(input: SavedSession): Promise<void> {
    return invoke('save_session_config', { input });
}

export async function listSavedSessions(): Promise<SavedSession[]> {
    return invoke('list_saved_sessions');
}

export async function listRestorableSessions(): Promise<SavedSession[]> {
    return invoke('list_restorable_sessions');
}

export async function updateSavedSessionStatus(id: string, status: string): Promise<void> {
    return invoke('update_saved_session_status', { id, status });
}

export async function deleteSavedSession(id: string): Promise<void> {
    return invoke('delete_saved_session', { id });
}

export async function markStaleSessionsStopped(): Promise<void> {
    return invoke('mark_stale_sessions_stopped');
}

// Platform
export interface PlatformDefaults {
    defaultShell: string;
    defaultShellArgs: string[];
    homeDir: string;
    os: string;
}

export async function getPlatformDefaults(): Promise<PlatformDefaults> {
    return invoke('get_platform_defaults');
}

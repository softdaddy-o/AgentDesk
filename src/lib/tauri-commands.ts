import { invoke, Channel } from '@tauri-apps/api/core';
import type { SessionConfig, PtyOutputEvent, PromptTemplate, CreateTemplate, UpdateTemplate, SearchQuery, SearchResult } from './types';

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

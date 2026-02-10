import { invoke, Channel } from '@tauri-apps/api/core';
import type { SessionConfig, PtyOutputEvent } from './types';

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

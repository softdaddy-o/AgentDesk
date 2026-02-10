use tauri::ipc::Channel;
use tauri::State;

use crate::models::session::{PtyOutputEvent, SessionConfig};
use crate::state::AppState;

#[tauri::command]
pub fn create_session(
    state: State<'_, AppState>,
    config: SessionConfig,
    on_event: Channel<PtyOutputEvent>,
) -> Result<String, String> {
    state.pty_manager.create_session(&config, on_event, state.db.clone())
}

#[tauri::command]
pub fn write_to_pty(state: State<'_, AppState>, session_id: String, data: String) -> Result<(), String> {
    state.pty_manager.write_to_session(&session_id, data.as_bytes())
}

#[tauri::command]
pub fn resize_pty(
    state: State<'_, AppState>,
    session_id: String,
    cols: u16,
    rows: u16,
) -> Result<(), String> {
    state.pty_manager.resize_session(&session_id, cols, rows)
}

#[tauri::command]
pub fn stop_session(state: State<'_, AppState>, session_id: String) -> Result<(), String> {
    state.pty_manager.remove_session(&session_id)
}

#[tauri::command]
pub fn list_sessions(state: State<'_, AppState>) -> Result<Vec<String>, String> {
    state.pty_manager.list_session_ids()
}

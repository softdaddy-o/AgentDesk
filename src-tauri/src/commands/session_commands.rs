use tauri::State;

use crate::db::session_repo::{self, SavedSession};
use crate::state::AppState;

#[tauri::command]
pub fn save_session_config(input: SavedSession, state: State<'_, AppState>) -> Result<(), String> {
    state.db.with_conn(|conn| session_repo::save_session(conn, &input))
}

#[tauri::command]
pub fn list_saved_sessions(state: State<'_, AppState>) -> Result<Vec<SavedSession>, String> {
    state.db.with_conn(|conn| session_repo::list_all_sessions(conn))
}

#[tauri::command]
pub fn list_restorable_sessions(state: State<'_, AppState>) -> Result<Vec<SavedSession>, String> {
    state.db.with_conn(|conn| session_repo::list_restorable_sessions(conn))
}

#[tauri::command]
pub fn update_saved_session_status(id: String, status: String, state: State<'_, AppState>) -> Result<(), String> {
    state.db.with_conn(|conn| session_repo::update_session_status(conn, &id, &status))
}

#[tauri::command]
pub fn delete_saved_session(id: String, state: State<'_, AppState>) -> Result<(), String> {
    state.db.with_conn(|conn| session_repo::delete_session(conn, &id))
}

#[tauri::command]
pub fn mark_stale_sessions_stopped(state: State<'_, AppState>) -> Result<(), String> {
    state.db.with_conn(|conn| session_repo::mark_all_stopped(conn))
}

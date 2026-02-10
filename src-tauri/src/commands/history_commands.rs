use tauri::State;

use crate::db::history_repo;
use crate::models::history::{SearchQuery, SearchResult};
use crate::state::AppState;

#[tauri::command]
pub fn search_history(state: State<'_, AppState>, query: SearchQuery) -> Result<SearchResult, String> {
    state.db.with_conn(|conn| history_repo::search_logs(conn, &query))
}

#[tauri::command]
pub fn get_session_log(state: State<'_, AppState>, session_id: String) -> Result<String, String> {
    state.db.with_conn(|conn| history_repo::get_session_log(conn, &session_id))
}

#[tauri::command]
pub fn insert_session_log(state: State<'_, AppState>, session_id: String, content: String) -> Result<(), String> {
    state.db.with_conn(|conn| history_repo::insert_log(conn, &session_id, content.as_bytes()))
}

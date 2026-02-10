use tauri::State;

use crate::db::monitoring_repo;
use crate::models::monitoring::{GlobalCostSummary, RecordTokenUsage, SessionCostSummary, TokenUsageRecord};
use crate::state::AppState;

#[tauri::command]
pub fn record_token_usage(state: State<'_, AppState>, input: RecordTokenUsage) -> Result<(), String> {
    state.db.with_conn(|conn| monitoring_repo::record_usage(conn, &input))
}

#[tauri::command]
pub fn get_session_usage(state: State<'_, AppState>, session_id: String) -> Result<Vec<TokenUsageRecord>, String> {
    state.db.with_conn(|conn| monitoring_repo::get_session_usage(conn, &session_id))
}

#[tauri::command]
pub fn get_session_cost_summary(state: State<'_, AppState>, session_id: String) -> Result<SessionCostSummary, String> {
    state.db.with_conn(|conn| monitoring_repo::get_session_cost_summary(conn, &session_id))
}

#[tauri::command]
pub fn get_global_cost_summary(state: State<'_, AppState>) -> Result<GlobalCostSummary, String> {
    state.db.with_conn(|conn| monitoring_repo::get_global_cost_summary(conn))
}

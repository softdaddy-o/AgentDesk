use tauri::State;

use crate::db::template_repo;
use crate::models::template::{CreateTemplate, PromptTemplate, UpdateTemplate};
use crate::state::AppState;

#[tauri::command]
pub fn create_template(state: State<'_, AppState>, input: CreateTemplate) -> Result<PromptTemplate, String> {
    let id = uuid::Uuid::new_v4().to_string();
    state.db.with_conn(|conn| template_repo::create_template(conn, &id, &input))
}

#[tauri::command]
pub fn list_templates(state: State<'_, AppState>) -> Result<Vec<PromptTemplate>, String> {
    state.db.with_conn(|conn| template_repo::list_templates(conn))
}

#[tauri::command]
pub fn get_template(state: State<'_, AppState>, id: String) -> Result<PromptTemplate, String> {
    state.db.with_conn(|conn| template_repo::get_template(conn, &id))
}

#[tauri::command]
pub fn update_template(state: State<'_, AppState>, id: String, input: UpdateTemplate) -> Result<PromptTemplate, String> {
    state.db.with_conn(|conn| template_repo::update_template(conn, &id, &input))
}

#[tauri::command]
pub fn delete_template(state: State<'_, AppState>, id: String) -> Result<(), String> {
    state.db.with_conn(|conn| template_repo::delete_template(conn, &id))
}

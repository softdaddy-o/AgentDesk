mod commands;
mod db;
mod models;
mod pty;
mod state;

use tauri::Manager;

use state::AppState;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_dialog::init())
        .setup(|app| {
            let app_dir = app
                .path()
                .app_data_dir()
                .expect("Failed to get app data dir");

            let state = AppState::new(app_dir).expect("Failed to initialize app state");

            // Run migrations
            state.db.with_conn(|conn| {
                db::migrations::run_migrations(conn)
                    .map_err(|_| rusqlite::Error::InvalidQuery)?;
                Ok(())
            }).expect("Failed to run migrations");

            app.manage(state);
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::create_session,
            commands::write_to_pty,
            commands::resize_pty,
            commands::stop_session,
            commands::list_sessions,
            commands::create_template,
            commands::list_templates,
            commands::get_template,
            commands::update_template,
            commands::delete_template,
            commands::search_history,
            commands::get_session_log,
            commands::insert_session_log,
            commands::record_token_usage,
            commands::get_session_usage,
            commands::get_session_cost_summary,
            commands::get_global_cost_summary,
            commands::get_platform_defaults,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

mod commands;
mod models;
mod pty;
mod state;

use state::AppState;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .manage(AppState::new())
        .invoke_handler(tauri::generate_handler![
            commands::create_session,
            commands::write_to_pty,
            commands::resize_pty,
            commands::stop_session,
            commands::list_sessions,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

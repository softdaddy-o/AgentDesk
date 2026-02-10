use crate::pty::PtyManager;

pub struct AppState {
    pub pty_manager: PtyManager,
}

impl AppState {
    pub fn new() -> Self {
        AppState {
            pty_manager: PtyManager::new(),
        }
    }
}

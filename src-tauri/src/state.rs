use std::path::PathBuf;

use crate::db::DbPool;
use crate::pty::PtyManager;

pub struct AppState {
    pub pty_manager: PtyManager,
    pub db: DbPool,
}

impl AppState {
    pub fn new(app_dir: PathBuf) -> Result<Self, String> {
        let db = DbPool::new(&app_dir)?;
        Ok(AppState {
            pty_manager: PtyManager::new(),
            db,
        })
    }
}

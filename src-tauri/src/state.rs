use std::path::PathBuf;
use std::sync::Arc;

use crate::db::DbPool;
use crate::pty::PtyManager;

pub struct AppState {
    pub pty_manager: PtyManager,
    pub db: Arc<DbPool>,
}

impl AppState {
    pub fn new(app_dir: PathBuf) -> Result<Self, String> {
        let db = Arc::new(DbPool::new(&app_dir)?);
        Ok(AppState {
            pty_manager: PtyManager::new(),
            db,
        })
    }
}

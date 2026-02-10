use rusqlite::Connection;
use std::path::PathBuf;
use std::sync::Mutex;

pub struct DbPool {
    conn: Mutex<Connection>,
}

impl DbPool {
    pub fn new(app_dir: &PathBuf) -> Result<Self, String> {
        std::fs::create_dir_all(app_dir).map_err(|e| format!("Failed to create app dir: {e}"))?;
        let db_path = app_dir.join("agentdesk.db");
        let conn = Connection::open(&db_path)
            .map_err(|e| format!("Failed to open database: {e}"))?;

        // Enable WAL mode for better concurrent performance
        conn.execute_batch("PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON;")
            .map_err(|e| format!("Failed to set PRAGMA: {e}"))?;

        Ok(DbPool {
            conn: Mutex::new(conn),
        })
    }

    pub fn with_conn<F, T>(&self, f: F) -> Result<T, String>
    where
        F: FnOnce(&Connection) -> Result<T, rusqlite::Error>,
    {
        let conn = self.conn.lock().map_err(|e| format!("Lock error: {e}"))?;
        f(&conn).map_err(|e| format!("Database error: {e}"))
    }
}

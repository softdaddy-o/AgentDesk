use std::collections::HashMap;
use std::sync::{Arc, Mutex};
use tauri::ipc::Channel;

use crate::db::DbPool;
use crate::models::session::{PtyOutputEvent, SessionConfig};
use crate::pty::session::PtySession;

pub struct PtyManager {
    sessions: Mutex<HashMap<String, PtySession>>,
}

impl PtyManager {
    pub fn new() -> Self {
        PtyManager {
            sessions: Mutex::new(HashMap::new()),
        }
    }

    pub fn create_session(
        &self,
        config: &SessionConfig,
        channel: Channel<PtyOutputEvent>,
        db: Arc<DbPool>,
    ) -> Result<String, String> {
        let session = PtySession::spawn(config, channel, db)?;
        let id = session.session_id().to_string();
        self.sessions
            .lock()
            .map_err(|e| format!("Lock error: {e}"))?
            .insert(id.clone(), session);
        Ok(id)
    }

    pub fn write_to_session(&self, session_id: &str, data: &[u8]) -> Result<(), String> {
        let sessions = self
            .sessions
            .lock()
            .map_err(|e| format!("Lock error: {e}"))?;
        let session = sessions
            .get(session_id)
            .ok_or_else(|| format!("Session not found: {session_id}"))?;
        session.write(data)
    }

    pub fn resize_session(&self, session_id: &str, cols: u16, rows: u16) -> Result<(), String> {
        let sessions = self
            .sessions
            .lock()
            .map_err(|e| format!("Lock error: {e}"))?;
        let session = sessions
            .get(session_id)
            .ok_or_else(|| format!("Session not found: {session_id}"))?;
        session.resize(cols, rows)
    }

    pub fn remove_session(&self, session_id: &str) -> Result<(), String> {
        self.sessions
            .lock()
            .map_err(|e| format!("Lock error: {e}"))?
            .remove(session_id);
        Ok(())
    }

    pub fn list_session_ids(&self) -> Result<Vec<String>, String> {
        let sessions = self
            .sessions
            .lock()
            .map_err(|e| format!("Lock error: {e}"))?;
        Ok(sessions.keys().cloned().collect())
    }
}

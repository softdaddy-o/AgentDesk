use rusqlite::{params, Connection};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SavedSession {
    pub id: String,
    pub name: String,
    pub tool: String,
    pub command: String,
    pub args: Vec<String>,
    pub working_dir: String,
    pub env_vars: std::collections::HashMap<String, String>,
    pub cols: u16,
    pub rows: u16,
    pub status: String,
    pub created_at: String,
    pub updated_at: String,
}

pub fn save_session(conn: &Connection, session: &SavedSession) -> Result<(), rusqlite::Error> {
    let args_json = serde_json::to_string(&session.args).unwrap_or_else(|_| "[]".to_string());
    let env_json = serde_json::to_string(&session.env_vars).unwrap_or_else(|_| "{}".to_string());

    conn.execute(
        "INSERT OR REPLACE INTO sessions (id, name, tool, command, args, working_dir, env_vars, cols, rows, status, updated_at)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, datetime('now'))",
        params![
            session.id,
            session.name,
            session.tool,
            session.command,
            args_json,
            session.working_dir,
            env_json,
            session.cols,
            session.rows,
            session.status,
        ],
    )?;
    Ok(())
}

pub fn update_session_status(conn: &Connection, id: &str, status: &str) -> Result<(), rusqlite::Error> {
    conn.execute(
        "UPDATE sessions SET status = ?1, updated_at = datetime('now') WHERE id = ?2",
        params![status, id],
    )?;
    Ok(())
}

pub fn list_all_sessions(conn: &Connection) -> Result<Vec<SavedSession>, rusqlite::Error> {
    let mut stmt = conn.prepare(
        "SELECT id, name, tool, command, args, working_dir, env_vars, cols, rows, status, created_at, updated_at
         FROM sessions ORDER BY created_at DESC"
    )?;
    let rows = stmt.query_map([], |row| {
        let args_str: String = row.get(4)?;
        let env_str: String = row.get(6)?;
        Ok(SavedSession {
            id: row.get(0)?,
            name: row.get(1)?,
            tool: row.get(2)?,
            command: row.get(3)?,
            args: serde_json::from_str(&args_str).unwrap_or_default(),
            working_dir: row.get(5)?,
            env_vars: serde_json::from_str(&env_str).unwrap_or_default(),
            cols: row.get(7)?,
            rows: row.get(8)?,
            status: row.get(9)?,
            created_at: row.get(10)?,
            updated_at: row.get(11)?,
        })
    })?;
    rows.collect()
}

pub fn list_restorable_sessions(conn: &Connection) -> Result<Vec<SavedSession>, rusqlite::Error> {
    let mut stmt = conn.prepare(
        "SELECT id, name, tool, command, args, working_dir, env_vars, cols, rows, status, created_at, updated_at
         FROM sessions WHERE status = 'running' ORDER BY created_at DESC"
    )?;
    let rows = stmt.query_map([], |row| {
        let args_str: String = row.get(4)?;
        let env_str: String = row.get(6)?;
        Ok(SavedSession {
            id: row.get(0)?,
            name: row.get(1)?,
            tool: row.get(2)?,
            command: row.get(3)?,
            args: serde_json::from_str(&args_str).unwrap_or_default(),
            working_dir: row.get(5)?,
            env_vars: serde_json::from_str(&env_str).unwrap_or_default(),
            cols: row.get(7)?,
            rows: row.get(8)?,
            status: row.get(9)?,
            created_at: row.get(10)?,
            updated_at: row.get(11)?,
        })
    })?;
    rows.collect()
}

pub fn delete_session(conn: &Connection, id: &str) -> Result<(), rusqlite::Error> {
    conn.execute("DELETE FROM sessions WHERE id = ?1", [id])?;
    Ok(())
}

pub fn mark_all_stopped(conn: &Connection) -> Result<(), rusqlite::Error> {
    conn.execute(
        "UPDATE sessions SET status = 'stopped', updated_at = datetime('now') WHERE status = 'running'",
        [],
    )?;
    Ok(())
}

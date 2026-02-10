use rusqlite::{params, Connection};

use crate::models::history::{HistoryEntry, SearchQuery, SearchResult};

pub fn insert_log(conn: &Connection, session_id: &str, content: &[u8]) -> Result<(), rusqlite::Error> {
    let text = String::from_utf8_lossy(content);
    conn.execute(
        "INSERT INTO session_logs (session_id, content) VALUES (?1, ?2)",
        params![session_id, text.as_ref()],
    )?;
    Ok(())
}

pub fn search_logs(conn: &Connection, query: &SearchQuery) -> Result<SearchResult, rusqlite::Error> {
    let limit = query.limit.unwrap_or(50);
    let offset = query.offset.unwrap_or(0);

    if query.query.is_empty() {
        // List recent logs
        let (where_clause, param_values): (String, Vec<Box<dyn rusqlite::types::ToSql>>) =
            if let Some(sid) = &query.session_id {
                ("WHERE session_id = ?1".to_string(), vec![Box::new(sid.clone())])
            } else {
                (String::new(), vec![])
            };

        let count_sql = format!("SELECT COUNT(*) FROM session_logs {where_clause}");
        let total: i64 = if param_values.is_empty() {
            conn.query_row(&count_sql, [], |row| row.get(0))?
        } else {
            conn.query_row(&count_sql, rusqlite::params_from_iter(&param_values), |row| row.get(0))?
        };

        let select_sql = format!(
            "SELECT id, session_id, content, created_at FROM session_logs {where_clause} ORDER BY created_at DESC LIMIT ?{} OFFSET ?{}",
            param_values.len() + 1,
            param_values.len() + 2,
        );

        let mut all_params: Vec<Box<dyn rusqlite::types::ToSql>> = param_values;
        all_params.push(Box::new(limit));
        all_params.push(Box::new(offset));

        let mut stmt = conn.prepare(&select_sql)?;
        let entries: Vec<HistoryEntry> = stmt
            .query_map(rusqlite::params_from_iter(&all_params), |row| {
                Ok(HistoryEntry {
                    id: row.get(0)?,
                    session_id: row.get(1)?,
                    content: row.get(2)?,
                    created_at: row.get(3)?,
                })
            })?
            .collect::<Result<_, _>>()?;

        Ok(SearchResult { entries, total })
    } else {
        // FTS5 search
        let fts_query = &query.query;

        let (where_extra, mut param_values): (String, Vec<Box<dyn rusqlite::types::ToSql>>) =
            if let Some(sid) = &query.session_id {
                (" AND f.session_id = ?2".to_string(), vec![Box::new(fts_query.clone()), Box::new(sid.clone())])
            } else {
                (String::new(), vec![Box::new(fts_query.clone())])
            };

        let count_sql = format!(
            "SELECT COUNT(*) FROM session_logs_fts f WHERE f.content MATCH ?1{where_extra}"
        );
        let total: i64 = conn.query_row(&count_sql, rusqlite::params_from_iter(&param_values), |row| row.get(0))?;

        let select_sql = format!(
            "SELECT f.rowid, f.session_id, snippet(session_logs_fts, 1, '<mark>', '</mark>', '...', 64) as content, l.created_at
             FROM session_logs_fts f
             JOIN session_logs l ON l.id = f.rowid
             WHERE f.content MATCH ?1{where_extra}
             ORDER BY rank
             LIMIT ?{} OFFSET ?{}",
            param_values.len() + 1,
            param_values.len() + 2,
        );

        param_values.push(Box::new(limit));
        param_values.push(Box::new(offset));

        let mut stmt = conn.prepare(&select_sql)?;
        let entries: Vec<HistoryEntry> = stmt
            .query_map(rusqlite::params_from_iter(&param_values), |row| {
                Ok(HistoryEntry {
                    id: row.get(0)?,
                    session_id: row.get(1)?,
                    content: row.get(2)?,
                    created_at: row.get(3)?,
                })
            })?
            .collect::<Result<_, _>>()?;

        Ok(SearchResult { entries, total })
    }
}

pub fn get_session_log(conn: &Connection, session_id: &str) -> Result<String, rusqlite::Error> {
    let mut stmt = conn.prepare(
        "SELECT content FROM session_logs WHERE session_id = ?1 ORDER BY created_at ASC"
    )?;
    let rows: Vec<String> = stmt
        .query_map([session_id], |row| row.get(0))?
        .collect::<Result<_, _>>()?;
    Ok(rows.join(""))
}

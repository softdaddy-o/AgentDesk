use rusqlite::{params, Connection};

use crate::models::monitoring::{GlobalCostSummary, RecordTokenUsage, SessionCostSummary, TokenUsageRecord};

pub fn record_usage(conn: &Connection, input: &RecordTokenUsage) -> Result<(), rusqlite::Error> {
    conn.execute(
        "INSERT INTO token_usage (session_id, input_tokens, output_tokens, model, cost_usd) VALUES (?1, ?2, ?3, ?4, ?5)",
        params![input.session_id, input.input_tokens, input.output_tokens, input.model, input.cost_usd],
    )?;
    Ok(())
}

pub fn get_session_usage(conn: &Connection, session_id: &str) -> Result<Vec<TokenUsageRecord>, rusqlite::Error> {
    let mut stmt = conn.prepare(
        "SELECT id, session_id, input_tokens, output_tokens, model, cost_usd, recorded_at FROM token_usage WHERE session_id = ?1 ORDER BY recorded_at DESC"
    )?;
    let rows = stmt.query_map([session_id], |row| {
        Ok(TokenUsageRecord {
            id: row.get(0)?,
            session_id: row.get(1)?,
            input_tokens: row.get(2)?,
            output_tokens: row.get(3)?,
            model: row.get(4)?,
            cost_usd: row.get(5)?,
            recorded_at: row.get(6)?,
        })
    })?;
    rows.collect()
}

pub fn get_session_cost_summary(conn: &Connection, session_id: &str) -> Result<SessionCostSummary, rusqlite::Error> {
    conn.query_row(
        "SELECT COALESCE(SUM(input_tokens), 0), COALESCE(SUM(output_tokens), 0), COALESCE(SUM(cost_usd), 0.0), COUNT(*) FROM token_usage WHERE session_id = ?1",
        [session_id],
        |row| {
            Ok(SessionCostSummary {
                session_id: session_id.to_string(),
                total_input_tokens: row.get(0)?,
                total_output_tokens: row.get(1)?,
                total_cost_usd: row.get(2)?,
                record_count: row.get(3)?,
            })
        },
    )
}

pub fn get_global_cost_summary(conn: &Connection) -> Result<GlobalCostSummary, rusqlite::Error> {
    let total_input: i64 = conn.query_row("SELECT COALESCE(SUM(input_tokens), 0) FROM token_usage", [], |r| r.get(0))?;
    let total_output: i64 = conn.query_row("SELECT COALESCE(SUM(output_tokens), 0) FROM token_usage", [], |r| r.get(0))?;
    let total_cost: f64 = conn.query_row("SELECT COALESCE(SUM(cost_usd), 0.0) FROM token_usage", [], |r| r.get(0))?;

    let mut stmt = conn.prepare(
        "SELECT session_id, SUM(input_tokens), SUM(output_tokens), SUM(cost_usd), COUNT(*) FROM token_usage GROUP BY session_id ORDER BY SUM(cost_usd) DESC"
    )?;
    let per_session: Vec<SessionCostSummary> = stmt
        .query_map([], |row| {
            Ok(SessionCostSummary {
                session_id: row.get(0)?,
                total_input_tokens: row.get(1)?,
                total_output_tokens: row.get(2)?,
                total_cost_usd: row.get(3)?,
                record_count: row.get(4)?,
            })
        })?
        .collect::<Result<_, _>>()?;

    Ok(GlobalCostSummary {
        total_input_tokens: total_input,
        total_output_tokens: total_output,
        total_cost_usd: total_cost,
        session_count: per_session.len() as i64,
        per_session,
    })
}

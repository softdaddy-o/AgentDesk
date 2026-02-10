use rusqlite::{params, Connection};

use crate::models::template::{CreateTemplate, PromptTemplate, UpdateTemplate};

pub fn create_template(conn: &Connection, id: &str, input: &CreateTemplate) -> Result<PromptTemplate, rusqlite::Error> {
    let tags_json = serde_json::to_string(&input.tags).unwrap_or_else(|_| "[]".to_string());
    conn.execute(
        "INSERT INTO templates (id, name, tool, prompt, description, tags) VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
        params![id, input.name, input.tool, input.prompt, input.description, tags_json],
    )?;
    get_template(conn, id)
}

pub fn get_template(conn: &Connection, id: &str) -> Result<PromptTemplate, rusqlite::Error> {
    conn.query_row(
        "SELECT id, name, tool, prompt, description, tags, created_at, updated_at FROM templates WHERE id = ?1",
        [id],
        |row| {
            let tags_str: String = row.get(5)?;
            let tags: Vec<String> = serde_json::from_str(&tags_str).unwrap_or_default();
            Ok(PromptTemplate {
                id: row.get(0)?,
                name: row.get(1)?,
                tool: row.get(2)?,
                prompt: row.get(3)?,
                description: row.get(4)?,
                tags,
                created_at: row.get(6)?,
                updated_at: row.get(7)?,
            })
        },
    )
}

pub fn list_templates(conn: &Connection) -> Result<Vec<PromptTemplate>, rusqlite::Error> {
    let mut stmt = conn.prepare(
        "SELECT id, name, tool, prompt, description, tags, created_at, updated_at FROM templates ORDER BY updated_at DESC",
    )?;
    let rows = stmt.query_map([], |row| {
        let tags_str: String = row.get(5)?;
        let tags: Vec<String> = serde_json::from_str(&tags_str).unwrap_or_default();
        Ok(PromptTemplate {
            id: row.get(0)?,
            name: row.get(1)?,
            tool: row.get(2)?,
            prompt: row.get(3)?,
            description: row.get(4)?,
            tags,
            created_at: row.get(6)?,
            updated_at: row.get(7)?,
        })
    })?;
    rows.collect()
}

pub fn update_template(conn: &Connection, id: &str, input: &UpdateTemplate) -> Result<PromptTemplate, rusqlite::Error> {
    if let Some(name) = &input.name {
        conn.execute("UPDATE templates SET name = ?1, updated_at = datetime('now') WHERE id = ?2", params![name, id])?;
    }
    if let Some(tool) = &input.tool {
        conn.execute("UPDATE templates SET tool = ?1, updated_at = datetime('now') WHERE id = ?2", params![tool, id])?;
    }
    if let Some(prompt) = &input.prompt {
        conn.execute("UPDATE templates SET prompt = ?1, updated_at = datetime('now') WHERE id = ?2", params![prompt, id])?;
    }
    if let Some(description) = &input.description {
        conn.execute("UPDATE templates SET description = ?1, updated_at = datetime('now') WHERE id = ?2", params![description, id])?;
    }
    if let Some(tags) = &input.tags {
        let tags_json = serde_json::to_string(tags).unwrap_or_else(|_| "[]".to_string());
        conn.execute("UPDATE templates SET tags = ?1, updated_at = datetime('now') WHERE id = ?2", params![tags_json, id])?;
    }
    get_template(conn, id)
}

pub fn delete_template(conn: &Connection, id: &str) -> Result<(), rusqlite::Error> {
    conn.execute("DELETE FROM templates WHERE id = ?1", [id])?;
    Ok(())
}

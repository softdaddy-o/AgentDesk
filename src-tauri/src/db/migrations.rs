use rusqlite::Connection;

const MIGRATIONS: &[(&str, &str)] = &[
    ("001_initial_schema", include_str!("../../migrations/001_initial_schema.sql")),
    ("002_add_templates", include_str!("../../migrations/002_add_templates.sql")),
    ("003_add_monitoring", include_str!("../../migrations/003_add_monitoring.sql")),
];

pub fn run_migrations(conn: &Connection) -> Result<(), String> {
    conn.execute_batch(
        "CREATE TABLE IF NOT EXISTS _migrations (
            name TEXT PRIMARY KEY,
            applied_at TEXT NOT NULL DEFAULT (datetime('now'))
        );"
    ).map_err(|e| format!("Failed to create migrations table: {e}"))?;

    for (name, sql) in MIGRATIONS {
        let already_applied: bool = conn
            .query_row(
                "SELECT COUNT(*) > 0 FROM _migrations WHERE name = ?1",
                [name],
                |row| row.get(0),
            )
            .map_err(|e| format!("Failed to check migration {name}: {e}"))?;

        if !already_applied {
            conn.execute_batch(sql)
                .map_err(|e| format!("Failed to run migration {name}: {e}"))?;
            conn.execute("INSERT INTO _migrations (name) VALUES (?1)", [name])
                .map_err(|e| format!("Failed to record migration {name}: {e}"))?;
        }
    }

    Ok(())
}

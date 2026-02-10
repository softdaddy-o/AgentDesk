-- Sessions table
CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    tool TEXT NOT NULL,
    command TEXT NOT NULL,
    args TEXT NOT NULL DEFAULT '[]',
    working_dir TEXT NOT NULL,
    env_vars TEXT NOT NULL DEFAULT '{}',
    cols INTEGER NOT NULL DEFAULT 120,
    rows INTEGER NOT NULL DEFAULT 30,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Session logs (batched writes)
CREATE TABLE IF NOT EXISTS session_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT NOT NULL,
    content BLOB NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_session_logs_session_id ON session_logs(session_id);

-- FTS5 virtual table for full-text search across session logs
CREATE VIRTUAL TABLE IF NOT EXISTS session_logs_fts USING fts5(
    session_id,
    content,
    content=session_logs,
    content_rowid=id
);

-- Triggers to keep FTS in sync
CREATE TRIGGER IF NOT EXISTS session_logs_ai AFTER INSERT ON session_logs BEGIN
    INSERT INTO session_logs_fts(rowid, session_id, content) VALUES (new.id, new.session_id, new.content);
END;

CREATE TRIGGER IF NOT EXISTS session_logs_ad AFTER DELETE ON session_logs BEGIN
    INSERT INTO session_logs_fts(session_logs_fts, rowid, session_id, content) VALUES ('delete', old.id, old.session_id, old.content);
END;

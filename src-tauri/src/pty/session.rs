use portable_pty::{native_pty_system, CommandBuilder, MasterPty, PtySize};
use std::io::{Read, Write};
use std::sync::{Arc, Mutex};
use std::time::{Duration, Instant};
use tauri::ipc::Channel;

use crate::db::DbPool;
use crate::models::session::{PtyOutputEvent, SessionConfig};

const FLUSH_INTERVAL: Duration = Duration::from_secs(5);
const FLUSH_SIZE: usize = 32 * 1024; // 32KB

pub struct PtySession {
    master: Arc<Mutex<Box<dyn MasterPty + Send>>>,
    writer: Arc<Mutex<Box<dyn Write + Send>>>,
    session_id: String,
}

impl PtySession {
    pub fn spawn(config: &SessionConfig, channel: Channel<PtyOutputEvent>, db: Arc<DbPool>) -> Result<Self, String> {
        let pty_system = native_pty_system();

        let pair = pty_system
            .openpty(PtySize {
                rows: config.rows,
                cols: config.cols,
                pixel_width: 0,
                pixel_height: 0,
            })
            .map_err(|e| format!("Failed to open PTY: {e}"))?;

        let mut cmd = CommandBuilder::new(&config.command);
        for arg in &config.args {
            cmd.arg(arg);
        }
        if config.working_dir.exists() {
            cmd.cwd(&config.working_dir);
        }
        for (key, value) in &config.env_vars {
            cmd.env(key, value);
        }

        let _child = pair
            .slave
            .spawn_command(cmd)
            .map_err(|e| format!("Failed to spawn command: {e}"))?;

        // Drop slave immediately - we only need the master
        drop(pair.slave);

        let writer = pair
            .master
            .take_writer()
            .map_err(|e| format!("Failed to get PTY writer: {e}"))?;

        let mut reader = pair
            .master
            .try_clone_reader()
            .map_err(|e| format!("Failed to get PTY reader: {e}"))?;

        let session_id = config.id.clone();
        let channel_session_id = session_id.clone();

        // Spawn reader thread with log batching
        std::thread::spawn(move || {
            let mut buf = [0u8; 4096];
            let mut log_buffer: Vec<u8> = Vec::new();
            let mut last_flush = Instant::now();

            loop {
                match reader.read(&mut buf) {
                    Ok(0) => {
                        flush_log(&db, &channel_session_id, &mut log_buffer);
                        let _ = channel.send(PtyOutputEvent::Exited {
                            session_id: channel_session_id.clone(),
                            exit_code: None,
                        });
                        break;
                    }
                    Ok(n) => {
                        let _ = channel.send(PtyOutputEvent::Data {
                            session_id: channel_session_id.clone(),
                            data: buf[..n].to_vec(),
                        });

                        log_buffer.extend_from_slice(&buf[..n]);

                        if log_buffer.len() >= FLUSH_SIZE || last_flush.elapsed() >= FLUSH_INTERVAL {
                            flush_log(&db, &channel_session_id, &mut log_buffer);
                            last_flush = Instant::now();
                        }
                    }
                    Err(e) => {
                        flush_log(&db, &channel_session_id, &mut log_buffer);
                        let _ = channel.send(PtyOutputEvent::Error {
                            session_id: channel_session_id.clone(),
                            message: format!("Read error: {e}"),
                        });
                        break;
                    }
                }
            }
        });

        Ok(PtySession {
            master: Arc::new(Mutex::new(pair.master)),
            writer: Arc::new(Mutex::new(writer)),
            session_id,
        })
    }

    pub fn write(&self, data: &[u8]) -> Result<(), String> {
        self.writer
            .lock()
            .map_err(|e| format!("Lock error: {e}"))?
            .write_all(data)
            .map_err(|e| format!("Write error: {e}"))
    }

    pub fn resize(&self, cols: u16, rows: u16) -> Result<(), String> {
        self.master
            .lock()
            .map_err(|e| format!("Lock error: {e}"))?
            .resize(PtySize {
                rows,
                cols,
                pixel_width: 0,
                pixel_height: 0,
            })
            .map_err(|e| format!("Resize error: {e}"))
    }

    pub fn session_id(&self) -> &str {
        &self.session_id
    }
}

fn flush_log(db: &Arc<DbPool>, session_id: &str, buffer: &mut Vec<u8>) {
    if buffer.is_empty() {
        return;
    }

    // Scan for token usage patterns before flushing
    if let Ok(text) = std::str::from_utf8(buffer) {
        let records = super::token_parser::extract_token_usage(text, session_id);
        if !records.is_empty() {
            let _ = db.with_conn(|conn| {
                for record in &records {
                    let _ = crate::db::monitoring_repo::record_usage(conn, record);
                }
                Ok(())
            });
        }
    }

    let _ = db.with_conn(|conn| {
        crate::db::history_repo::insert_log(conn, session_id, buffer)
    });
    buffer.clear();
}

use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::path::PathBuf;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum CliTool {
    ClaudeCode,
    Codex,
    Aider,
    Cline,
    Custom,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[allow(dead_code)]
pub enum SessionStatus {
    Starting,
    Running,
    Idle,
    Working,
    Error(String),
    Stopped,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SessionConfig {
    pub id: String,
    pub name: String,
    pub tool: CliTool,
    pub command: String,
    pub args: Vec<String>,
    pub working_dir: PathBuf,
    pub env_vars: HashMap<String, String>,
    pub cols: u16,
    pub rows: u16,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type")]
pub enum PtyOutputEvent {
    #[serde(rename = "data")]
    Data {
        #[serde(rename = "sessionId")]
        session_id: String,
        data: Vec<u8>,
    },
    #[serde(rename = "exited")]
    Exited {
        #[serde(rename = "sessionId")]
        session_id: String,
        #[serde(rename = "exitCode")]
        exit_code: Option<i32>,
    },
    #[serde(rename = "error")]
    Error {
        #[serde(rename = "sessionId")]
        session_id: String,
        message: String,
    },
}

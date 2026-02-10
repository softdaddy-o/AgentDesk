use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TokenUsageRecord {
    pub id: i64,
    pub session_id: String,
    pub input_tokens: i64,
    pub output_tokens: i64,
    pub model: String,
    pub cost_usd: f64,
    pub recorded_at: String,
}

#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RecordTokenUsage {
    pub session_id: String,
    pub input_tokens: i64,
    pub output_tokens: i64,
    pub model: String,
    pub cost_usd: f64,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SessionCostSummary {
    pub session_id: String,
    pub total_input_tokens: i64,
    pub total_output_tokens: i64,
    pub total_cost_usd: f64,
    pub record_count: i64,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct GlobalCostSummary {
    pub total_input_tokens: i64,
    pub total_output_tokens: i64,
    pub total_cost_usd: f64,
    pub session_count: i64,
    pub per_session: Vec<SessionCostSummary>,
}

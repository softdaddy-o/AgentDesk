use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PromptTemplate {
    pub id: String,
    pub name: String,
    pub tool: String,
    pub prompt: String,
    pub description: String,
    pub tags: Vec<String>,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateTemplate {
    pub name: String,
    pub tool: String,
    pub prompt: String,
    pub description: String,
    pub tags: Vec<String>,
}

#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UpdateTemplate {
    pub name: Option<String>,
    pub tool: Option<String>,
    pub prompt: Option<String>,
    pub description: Option<String>,
    pub tags: Option<Vec<String>>,
}

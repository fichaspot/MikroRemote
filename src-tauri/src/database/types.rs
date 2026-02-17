use rusqlite::Connection;
use serde::{Deserialize, Serialize};
use std::sync::{Arc, Mutex};

pub type DbConnection = Arc<Mutex<Connection>>;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct DbProfile {
    pub id: String,
    pub name: String,
    pub created_at: String,
    pub updated_at: String,
    pub server: String,
    pub network: String,
    pub server_keys: String,
    pub clients: String,
}

#[derive(Debug, Serialize, Clone)]
pub struct DbProfileSummary {
    pub id: String,
    pub name: String,
    pub created_at: String,
    pub updated_at: String,
    pub client_count: i64,
    pub server_address: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct DbRouter {
    pub id: String,
    pub name: String,
    pub host: String,
    pub port: i64,
    pub username: String,
    pub password: String,
    pub last_identity: Option<String>,
    pub last_version: Option<String>,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct DbVps {
    pub id: String,
    pub name: String,
    pub host: String,
    pub port: i64,
    pub username: String,
    pub auth_type: String,
    pub password: String,
    pub key_path: String,
    pub last_arch: Option<String>,
    pub last_deploy_at: Option<String>,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Serialize, Clone)]
pub struct DashboardStats {
    pub profile_count: i64,
    pub router_count: i64,
    pub vps_count: i64,
    pub recent_profiles: Vec<DbProfileSummary>,
}

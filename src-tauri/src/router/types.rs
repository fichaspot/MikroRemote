use serde::{Deserialize, Serialize};

#[allow(dead_code)]
#[derive(Debug, Clone, Deserialize)]
pub struct RouterCredentials {
    pub host: String,
    pub port: u16,
    pub username: String,
    pub password: String,
}

#[derive(Debug, Clone, Serialize)]
pub struct RouterInfo {
    pub identity: String,
    pub board_name: String,
    pub version: String,
    pub architecture: String,
    pub uptime: String,
    pub cpu_load: String,
    pub free_memory: String,
    pub total_memory: String,
}

#[derive(Debug, Clone, Serialize)]
pub struct WgPeer {
    pub id: String,
    pub interface: String,
    pub public_key: String,
    pub endpoint_address: String,
    pub endpoint_port: String,
    pub allowed_address: String,
    pub current_endpoint_address: String,
    pub current_endpoint_port: String,
    pub rx: String,
    pub tx: String,
    pub last_handshake: String,
    pub comment: String,
    pub disabled: bool,
}

#[derive(Debug, Clone, Serialize)]
pub struct DeployResult {
    pub success: bool,
    pub message: String,
}

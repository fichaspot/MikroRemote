use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct VpsDetection {
    pub arch: String,
    pub boot_mode: String,
    pub storage: String,
    pub eth: String,
    pub address: String,
    pub gateway: String,
    pub dns: String,
    pub img_url: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ChrDeployResult {
    pub success: bool,
    pub output: String,
    pub detection: VpsDetection,
}

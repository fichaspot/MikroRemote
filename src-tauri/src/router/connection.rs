use mikrotik_rs::MikrotikDevice;
use std::sync::Arc;
use tokio::sync::Mutex;

use super::types::RouterInfo;

pub struct RouterState {
    pub device: Option<MikrotikDevice>,
    pub info: Option<RouterInfo>,
}

impl RouterState {
    pub fn new() -> Self {
        Self {
            device: None,
            info: None,
        }
    }
}

pub type RouterConnection = Arc<Mutex<RouterState>>;

pub fn create_connection_state() -> RouterConnection {
    Arc::new(Mutex::new(RouterState::new()))
}

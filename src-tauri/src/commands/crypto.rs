use crate::crypto::wireguard;
use serde::Serialize;

#[derive(Serialize)]
pub struct KeyPairResult {
    pub private_key: String,
    pub public_key: String,
}

#[tauri::command]
pub fn wg_generate_keypair() -> KeyPairResult {
    let kp = wireguard::generate_keypair();
    KeyPairResult {
        private_key: kp.private_key,
        public_key: kp.public_key,
    }
}

#[tauri::command]
pub fn wg_derive_public_key(private_key: String) -> Result<String, String> {
    wireguard::derive_public_key(&private_key)
}

#[tauri::command]
pub fn wg_generate_psk() -> String {
    wireguard::generate_psk()
}

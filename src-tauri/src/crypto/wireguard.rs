use base64::engine::general_purpose::STANDARD as BASE64;
use base64::Engine;
use rand::rngs::OsRng;
use x25519_dalek::{PublicKey, StaticSecret};

pub struct WgKeyPair {
    pub private_key: String,
    pub public_key: String,
}

pub fn generate_keypair() -> WgKeyPair {
    let secret = StaticSecret::random_from_rng(OsRng);
    let public = PublicKey::from(&secret);

    WgKeyPair {
        private_key: BASE64.encode(secret.as_bytes()),
        public_key: BASE64.encode(public.as_bytes()),
    }
}

pub fn derive_public_key(private_key_b64: &str) -> Result<String, String> {
    let bytes = BASE64
        .decode(private_key_b64)
        .map_err(|e| format!("Invalid base64: {}", e))?;

    if bytes.len() != 32 {
        return Err("Private key must be 32 bytes".into());
    }

    let mut key_bytes = [0u8; 32];
    key_bytes.copy_from_slice(&bytes);

    let secret = StaticSecret::from(key_bytes);
    let public = PublicKey::from(&secret);

    Ok(BASE64.encode(public.as_bytes()))
}

pub fn generate_psk() -> String {
    let mut psk = [0u8; 32];
    rand::RngCore::fill_bytes(&mut OsRng, &mut psk);
    BASE64.encode(psk)
}

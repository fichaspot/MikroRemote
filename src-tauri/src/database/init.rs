use rusqlite::Connection;
use std::fs;
use std::path::Path;

use super::types::DbConnection;
use std::sync::{Arc, Mutex};

pub fn initialize_database(app_data_dir: &Path) -> Result<DbConnection, String> {
    fs::create_dir_all(app_data_dir).map_err(|e| format!("No se pudo crear directorio de datos: {e}"))?;

    let db_path = app_data_dir.join("mikroremote.db");
    let conn = Connection::open(&db_path)
        .map_err(|e| format!("No se pudo abrir la base de datos: {e}"))?;

    conn.execute_batch(
        "CREATE TABLE IF NOT EXISTS profiles (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            server TEXT NOT NULL,
            network TEXT NOT NULL,
            server_keys TEXT NOT NULL,
            clients TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS routers (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            host TEXT NOT NULL,
            port INTEGER NOT NULL DEFAULT 8728,
            username TEXT NOT NULL DEFAULT 'admin',
            password TEXT NOT NULL DEFAULT '',
            last_identity TEXT,
            last_version TEXT,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS vps_servers (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            host TEXT NOT NULL,
            port INTEGER NOT NULL DEFAULT 22,
            username TEXT NOT NULL DEFAULT 'root',
            auth_type TEXT NOT NULL DEFAULT 'password',
            password TEXT NOT NULL DEFAULT '',
            key_path TEXT NOT NULL DEFAULT '',
            last_arch TEXT,
            last_deploy_at TEXT,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        );"
    )
    .map_err(|e| format!("No se pudo crear las tablas: {e}"))?;

    Ok(Arc::new(Mutex::new(conn)))
}

use rusqlite::params;

use super::types::{DbConnection, DbProfile, DbProfileSummary};

pub fn insert_profile(conn: &DbConnection, profile: &DbProfile) -> Result<(), String> {
    let db = conn.lock().map_err(|e| format!("Lock error: {e}"))?;
    db.execute(
        "INSERT OR REPLACE INTO profiles (id, name, created_at, updated_at, server, network, server_keys, clients)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)",
        params![
            profile.id,
            profile.name,
            profile.created_at,
            profile.updated_at,
            profile.server,
            profile.network,
            profile.server_keys,
            profile.clients,
        ],
    )
    .map_err(|e| format!("Error al guardar perfil: {e}"))?;
    Ok(())
}

pub fn get_all_summaries(conn: &DbConnection) -> Result<Vec<DbProfileSummary>, String> {
    let db = conn.lock().map_err(|e| format!("Lock error: {e}"))?;
    let mut stmt = db
        .prepare(
            "SELECT id, name, created_at, updated_at, clients, server FROM profiles ORDER BY updated_at DESC",
        )
        .map_err(|e| format!("Error en consulta: {e}"))?;

    let rows = stmt
        .query_map([], |row| {
            let clients_json: String = row.get(4)?;
            let server_json: String = row.get(5)?;

            let client_count = serde_json::from_str::<Vec<serde_json::Value>>(&clients_json)
                .map(|v| v.len() as i64)
                .unwrap_or(0);

            let server_address = serde_json::from_str::<serde_json::Value>(&server_json)
                .ok()
                .and_then(|v| v.get("address").and_then(|a| a.as_str().map(String::from)))
                .unwrap_or_default();

            Ok(DbProfileSummary {
                id: row.get(0)?,
                name: row.get(1)?,
                created_at: row.get(2)?,
                updated_at: row.get(3)?,
                client_count,
                server_address,
            })
        })
        .map_err(|e| format!("Error al leer perfiles: {e}"))?;

    let mut summaries = Vec::new();
    for row in rows {
        summaries.push(row.map_err(|e| format!("Error en fila: {e}"))?);
    }
    Ok(summaries)
}

pub fn get_by_id(conn: &DbConnection, id: &str) -> Result<DbProfile, String> {
    let db = conn.lock().map_err(|e| format!("Lock error: {e}"))?;
    db.query_row(
        "SELECT id, name, created_at, updated_at, server, network, server_keys, clients FROM profiles WHERE id = ?1",
        params![id],
        |row| {
            Ok(DbProfile {
                id: row.get(0)?,
                name: row.get(1)?,
                created_at: row.get(2)?,
                updated_at: row.get(3)?,
                server: row.get(4)?,
                network: row.get(5)?,
                server_keys: row.get(6)?,
                clients: row.get(7)?,
            })
        },
    )
    .map_err(|e| format!("Perfil no encontrado: {e}"))
}

pub fn delete_profile(conn: &DbConnection, id: &str) -> Result<(), String> {
    let db = conn.lock().map_err(|e| format!("Lock error: {e}"))?;
    db.execute("DELETE FROM profiles WHERE id = ?1", params![id])
        .map_err(|e| format!("Error al eliminar perfil: {e}"))?;
    Ok(())
}

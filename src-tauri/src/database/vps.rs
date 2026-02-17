use rusqlite::params;

use super::types::{DbConnection, DbVps};

pub fn insert_vps(conn: &DbConnection, vps: &DbVps) -> Result<(), String> {
    let db = conn.lock().map_err(|e| format!("Lock error: {e}"))?;
    db.execute(
        "INSERT OR REPLACE INTO vps_servers (id, name, host, port, username, auth_type, password, key_path, last_arch, last_deploy_at, created_at, updated_at)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12)",
        params![
            vps.id,
            vps.name,
            vps.host,
            vps.port,
            vps.username,
            vps.auth_type,
            vps.password,
            vps.key_path,
            vps.last_arch,
            vps.last_deploy_at,
            vps.created_at,
            vps.updated_at,
        ],
    )
    .map_err(|e| format!("Error al guardar VPS: {e}"))?;
    Ok(())
}

pub fn get_all(conn: &DbConnection) -> Result<Vec<DbVps>, String> {
    let db = conn.lock().map_err(|e| format!("Lock error: {e}"))?;
    let mut stmt = db
        .prepare(
            "SELECT id, name, host, port, username, auth_type, password, key_path, last_arch, last_deploy_at, created_at, updated_at
             FROM vps_servers ORDER BY updated_at DESC",
        )
        .map_err(|e| format!("Error en consulta: {e}"))?;

    let rows = stmt
        .query_map([], |row| {
            Ok(DbVps {
                id: row.get(0)?,
                name: row.get(1)?,
                host: row.get(2)?,
                port: row.get(3)?,
                username: row.get(4)?,
                auth_type: row.get(5)?,
                password: row.get(6)?,
                key_path: row.get(7)?,
                last_arch: row.get(8)?,
                last_deploy_at: row.get(9)?,
                created_at: row.get(10)?,
                updated_at: row.get(11)?,
            })
        })
        .map_err(|e| format!("Error al leer VPS: {e}"))?;

    let mut list = Vec::new();
    for row in rows {
        list.push(row.map_err(|e| format!("Error en fila: {e}"))?);
    }
    Ok(list)
}

pub fn delete_vps(conn: &DbConnection, id: &str) -> Result<(), String> {
    let db = conn.lock().map_err(|e| format!("Lock error: {e}"))?;
    db.execute("DELETE FROM vps_servers WHERE id = ?1", params![id])
        .map_err(|e| format!("Error al eliminar VPS: {e}"))?;
    Ok(())
}

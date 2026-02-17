use rusqlite::params;

use super::types::{DbConnection, DbRouter};

pub fn insert_router(conn: &DbConnection, router: &DbRouter) -> Result<(), String> {
    let db = conn.lock().map_err(|e| format!("Lock error: {e}"))?;
    db.execute(
        "INSERT OR REPLACE INTO routers (id, name, host, port, username, password, last_identity, last_version, created_at, updated_at)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)",
        params![
            router.id,
            router.name,
            router.host,
            router.port,
            router.username,
            router.password,
            router.last_identity,
            router.last_version,
            router.created_at,
            router.updated_at,
        ],
    )
    .map_err(|e| format!("Error al guardar router: {e}"))?;
    Ok(())
}

pub fn get_all(conn: &DbConnection) -> Result<Vec<DbRouter>, String> {
    let db = conn.lock().map_err(|e| format!("Lock error: {e}"))?;
    let mut stmt = db
        .prepare(
            "SELECT id, name, host, port, username, password, last_identity, last_version, created_at, updated_at
             FROM routers ORDER BY updated_at DESC",
        )
        .map_err(|e| format!("Error en consulta: {e}"))?;

    let rows = stmt
        .query_map([], |row| {
            Ok(DbRouter {
                id: row.get(0)?,
                name: row.get(1)?,
                host: row.get(2)?,
                port: row.get(3)?,
                username: row.get(4)?,
                password: row.get(5)?,
                last_identity: row.get(6)?,
                last_version: row.get(7)?,
                created_at: row.get(8)?,
                updated_at: row.get(9)?,
            })
        })
        .map_err(|e| format!("Error al leer routers: {e}"))?;

    let mut routers = Vec::new();
    for row in rows {
        routers.push(row.map_err(|e| format!("Error en fila: {e}"))?);
    }
    Ok(routers)
}

pub fn delete_router(conn: &DbConnection, id: &str) -> Result<(), String> {
    let db = conn.lock().map_err(|e| format!("Lock error: {e}"))?;
    db.execute("DELETE FROM routers WHERE id = ?1", params![id])
        .map_err(|e| format!("Error al eliminar router: {e}"))?;
    Ok(())
}

pub fn update_info(
    conn: &DbConnection,
    id: &str,
    identity: &str,
    version: &str,
) -> Result<(), String> {
    let db = conn.lock().map_err(|e| format!("Lock error: {e}"))?;
    let now = chrono_now();
    db.execute(
        "UPDATE routers SET last_identity = ?1, last_version = ?2, updated_at = ?3 WHERE id = ?4",
        params![identity, version, now, id],
    )
    .map_err(|e| format!("Error al actualizar router: {e}"))?;
    Ok(())
}

fn chrono_now() -> String {
    let now = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap_or_default();
    // ISO-like timestamp without chrono dependency
    let secs = now.as_secs();
    let days = secs / 86400;
    let time_secs = secs % 86400;
    let hours = time_secs / 3600;
    let minutes = (time_secs % 3600) / 60;
    let seconds = time_secs % 60;
    // Simple epoch-day to date conversion
    let mut y = 1970i64;
    let mut remaining = days as i64;
    loop {
        let days_in_year = if y % 4 == 0 && (y % 100 != 0 || y % 400 == 0) { 366 } else { 365 };
        if remaining < days_in_year {
            break;
        }
        remaining -= days_in_year;
        y += 1;
    }
    let leap = y % 4 == 0 && (y % 100 != 0 || y % 400 == 0);
    let month_days = [31, if leap { 29 } else { 28 }, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    let mut m = 0usize;
    for md in &month_days {
        if remaining < *md as i64 {
            break;
        }
        remaining -= *md as i64;
        m += 1;
    }
    format!("{y:04}-{:02}-{:02}T{hours:02}:{minutes:02}:{seconds:02}Z", m + 1, remaining + 1)
}

use tauri::State;

use crate::database::types::{DbConnection, DbProfile, DbProfileSummary, DbRouter, DbVps, DashboardStats};
use crate::database::{profiles, routers, vps};

fn now_iso() -> String {
    let now = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap_or_default();
    let secs = now.as_secs();
    let days = secs / 86400;
    let time_secs = secs % 86400;
    let hours = time_secs / 3600;
    let minutes = (time_secs % 3600) / 60;
    let seconds = time_secs % 60;
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

// === Profiles ===

#[tauri::command]
pub async fn db_save_profile(
    conn: State<'_, DbConnection>,
    id: Option<String>,
    name: String,
    server: String,
    network: String,
    server_keys: String,
    clients: String,
) -> Result<String, String> {
    let conn = conn.inner().clone();
    tokio::task::spawn_blocking(move || {
        let now = now_iso();
        let profile_id = id.unwrap_or_else(|| uuid::Uuid::new_v4().to_string());
        let profile = DbProfile {
            id: profile_id.clone(),
            name,
            created_at: now.clone(),
            updated_at: now,
            server,
            network,
            server_keys,
            clients,
        };
        profiles::insert_profile(&conn, &profile)?;
        Ok(profile_id)
    })
    .await
    .map_err(|e| format!("Task error: {e}"))?
}

#[tauri::command]
pub async fn db_get_profiles(
    conn: State<'_, DbConnection>,
) -> Result<Vec<DbProfileSummary>, String> {
    let conn = conn.inner().clone();
    tokio::task::spawn_blocking(move || profiles::get_all_summaries(&conn))
        .await
        .map_err(|e| format!("Task error: {e}"))?
}

#[tauri::command]
pub async fn db_get_profile(
    conn: State<'_, DbConnection>,
    id: String,
) -> Result<DbProfile, String> {
    let conn = conn.inner().clone();
    tokio::task::spawn_blocking(move || profiles::get_by_id(&conn, &id))
        .await
        .map_err(|e| format!("Task error: {e}"))?
}

#[tauri::command]
pub async fn db_delete_profile(
    conn: State<'_, DbConnection>,
    id: String,
) -> Result<(), String> {
    let conn = conn.inner().clone();
    tokio::task::spawn_blocking(move || profiles::delete_profile(&conn, &id))
        .await
        .map_err(|e| format!("Task error: {e}"))?
}

// === Routers ===

#[tauri::command]
pub async fn db_save_router(
    conn: State<'_, DbConnection>,
    id: Option<String>,
    name: String,
    host: String,
    port: i64,
    username: String,
    password: String,
) -> Result<String, String> {
    let conn = conn.inner().clone();
    tokio::task::spawn_blocking(move || {
        let now = now_iso();
        let router_id = id.unwrap_or_else(|| uuid::Uuid::new_v4().to_string());
        let router = DbRouter {
            id: router_id.clone(),
            name,
            host,
            port,
            username,
            password,
            last_identity: None,
            last_version: None,
            created_at: now.clone(),
            updated_at: now,
        };
        routers::insert_router(&conn, &router)?;
        Ok(router_id)
    })
    .await
    .map_err(|e| format!("Task error: {e}"))?
}

#[tauri::command]
pub async fn db_get_routers(
    conn: State<'_, DbConnection>,
) -> Result<Vec<DbRouter>, String> {
    let conn = conn.inner().clone();
    tokio::task::spawn_blocking(move || routers::get_all(&conn))
        .await
        .map_err(|e| format!("Task error: {e}"))?
}

#[tauri::command]
pub async fn db_delete_router(
    conn: State<'_, DbConnection>,
    id: String,
) -> Result<(), String> {
    let conn = conn.inner().clone();
    tokio::task::spawn_blocking(move || routers::delete_router(&conn, &id))
        .await
        .map_err(|e| format!("Task error: {e}"))?
}

#[tauri::command]
pub async fn db_update_router_info(
    conn: State<'_, DbConnection>,
    id: String,
    identity: String,
    version: String,
) -> Result<(), String> {
    let conn = conn.inner().clone();
    tokio::task::spawn_blocking(move || routers::update_info(&conn, &id, &identity, &version))
        .await
        .map_err(|e| format!("Task error: {e}"))?
}

// === VPS ===

#[tauri::command]
pub async fn db_save_vps(
    conn: State<'_, DbConnection>,
    id: Option<String>,
    name: String,
    host: String,
    port: i64,
    username: String,
    auth_type: String,
    password: String,
    key_path: String,
) -> Result<String, String> {
    let conn = conn.inner().clone();
    tokio::task::spawn_blocking(move || {
        let now = now_iso();
        let vps_id = id.unwrap_or_else(|| uuid::Uuid::new_v4().to_string());
        let v = DbVps {
            id: vps_id.clone(),
            name,
            host,
            port,
            username,
            auth_type,
            password,
            key_path,
            last_arch: None,
            last_deploy_at: None,
            created_at: now.clone(),
            updated_at: now,
        };
        vps::insert_vps(&conn, &v)?;
        Ok(vps_id)
    })
    .await
    .map_err(|e| format!("Task error: {e}"))?
}

#[tauri::command]
pub async fn db_get_vps_list(
    conn: State<'_, DbConnection>,
) -> Result<Vec<DbVps>, String> {
    let conn = conn.inner().clone();
    tokio::task::spawn_blocking(move || vps::get_all(&conn))
        .await
        .map_err(|e| format!("Task error: {e}"))?
}

#[tauri::command]
pub async fn db_delete_vps(
    conn: State<'_, DbConnection>,
    id: String,
) -> Result<(), String> {
    let conn = conn.inner().clone();
    tokio::task::spawn_blocking(move || vps::delete_vps(&conn, &id))
        .await
        .map_err(|e| format!("Task error: {e}"))?
}

// === Dashboard ===

#[tauri::command]
pub async fn db_get_stats(
    conn: State<'_, DbConnection>,
) -> Result<DashboardStats, String> {
    let conn = conn.inner().clone();
    tokio::task::spawn_blocking(move || {
        let db = conn.lock().map_err(|e| format!("Lock error: {e}"))?;

        let profile_count: i64 = db
            .query_row("SELECT COUNT(*) FROM profiles", [], |row| row.get(0))
            .map_err(|e| format!("Error contando perfiles: {e}"))?;

        let router_count: i64 = db
            .query_row("SELECT COUNT(*) FROM routers", [], |row| row.get(0))
            .map_err(|e| format!("Error contando routers: {e}"))?;

        let vps_count: i64 = db
            .query_row("SELECT COUNT(*) FROM vps_servers", [], |row| row.get(0))
            .map_err(|e| format!("Error contando VPS: {e}"))?;

        drop(db);

        let recent_profiles = profiles::get_all_summaries(&conn)?
            .into_iter()
            .take(5)
            .collect();

        Ok(DashboardStats {
            profile_count,
            router_count,
            vps_count,
            recent_profiles,
        })
    })
    .await
    .map_err(|e| format!("Task error: {e}"))?
}

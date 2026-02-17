use mikrotik_rs::protocol::command::CommandBuilder;
use mikrotik_rs::protocol::CommandResponse;
use mikrotik_rs::MikrotikDevice;
use tauri::State;

use crate::router::connection::RouterConnection;
use crate::router::types::{DeployResult, RouterInfo, WgPeer};

fn attr_str(attrs: &std::collections::HashMap<String, Option<String>>, key: &str) -> String {
    attrs
        .get(key)
        .and_then(|v| v.as_deref())
        .unwrap_or("")
        .to_string()
}

#[tauri::command]
pub async fn router_connect(
    host: String,
    port: u16,
    username: String,
    password: String,
    state: State<'_, RouterConnection>,
) -> Result<RouterInfo, String> {
    let addr = format!("{}:{}", host, port);
    let device = MikrotikDevice::connect(&addr, &username, Some(&password))
        .await
        .map_err(|e| format!("Error de conexión: {}", e))?;

    let identity = get_identity(&device).await?;
    let info = get_system_resource(&device, &identity).await?;

    let mut conn = state.lock().await;
    conn.device = Some(device);
    conn.info = Some(info.clone());

    Ok(info)
}

#[tauri::command]
pub async fn router_disconnect(state: State<'_, RouterConnection>) -> Result<(), String> {
    let mut conn = state.lock().await;
    conn.device = None;
    conn.info = None;
    Ok(())
}

#[tauri::command]
pub async fn router_is_connected(state: State<'_, RouterConnection>) -> Result<bool, String> {
    let conn = state.lock().await;
    Ok(conn.device.is_some())
}

#[tauri::command]
pub async fn router_get_info(state: State<'_, RouterConnection>) -> Result<RouterInfo, String> {
    let conn = state.lock().await;
    conn.info
        .clone()
        .ok_or_else(|| "No hay conexión activa".to_string())
}

#[tauri::command]
pub async fn router_deploy_script(
    script: String,
    state: State<'_, RouterConnection>,
) -> Result<DeployResult, String> {
    let conn = state.lock().await;
    let device = conn
        .device
        .as_ref()
        .ok_or_else(|| "No hay conexión activa".to_string())?;

    let script_name = format!("mikroremote-deploy-{}", chrono_timestamp());

    // Add script
    let add_cmd = CommandBuilder::new()
        .command("/system/script/add")
        .attribute("name", Some(&script_name))
        .attribute("source", Some(&script))
        .build();

    let mut rx = device
        .send_command(add_cmd)
        .await
        .map_err(|e| format!("Error al enviar comando: {}", e))?;

    let mut script_id = String::new();

    while let Some(res) = rx.recv().await {
        match res {
            Ok(CommandResponse::Reply(reply)) => {
                if let Some(Some(ret)) = reply.attributes.get("ret") {
                    script_id = ret.clone();
                }
            }
            Ok(CommandResponse::Trap(trap)) => {
                return Ok(DeployResult {
                    success: false,
                    message: format!("Error al crear script: {}", trap.message),
                });
            }
            Ok(CommandResponse::Fatal(reason)) => {
                return Ok(DeployResult {
                    success: false,
                    message: format!("Error fatal: {}", reason),
                });
            }
            _ => {}
        }
    }

    // Run script
    let run_cmd = CommandBuilder::new()
        .command("/system/script/run")
        .attribute("number", Some(&script_name))
        .build();

    let mut rx = device
        .send_command(run_cmd)
        .await
        .map_err(|e| format!("Error al enviar comando: {}", e))?;

    let mut run_error: Option<String> = None;

    while let Some(res) = rx.recv().await {
        match res {
            Ok(CommandResponse::Trap(trap)) => {
                run_error = Some(format!("Error al ejecutar: {}", trap.message));
            }
            Ok(CommandResponse::Fatal(reason)) => {
                run_error = Some(format!("Error fatal: {}", reason));
            }
            _ => {}
        }
    }

    // Cleanup: remove the script
    if !script_id.is_empty() {
        let remove_cmd = CommandBuilder::new()
            .command("/system/script/remove")
            .attribute("numbers", Some(&script_id))
            .build();
        if let Ok(mut rx) = device.send_command(remove_cmd).await {
            while rx.recv().await.is_some() {}
        }
    }

    match run_error {
        Some(err) => Ok(DeployResult {
            success: false,
            message: err,
        }),
        None => Ok(DeployResult {
            success: true,
            message: "Script desplegado correctamente".to_string(),
        }),
    }
}

#[tauri::command]
pub async fn router_list_wg_peers(
    state: State<'_, RouterConnection>,
) -> Result<Vec<WgPeer>, String> {
    let conn = state.lock().await;
    let device = conn
        .device
        .as_ref()
        .ok_or_else(|| "No hay conexión activa".to_string())?;

    let cmd = CommandBuilder::new()
        .command("/interface/wireguard/peers/print")
        .build();

    let mut rx = device
        .send_command(cmd)
        .await
        .map_err(|e| format!("Error al enviar comando: {}", e))?;

    let mut peers = Vec::new();

    while let Some(res) = rx.recv().await {
        match res {
            Ok(CommandResponse::Reply(reply)) => {
                let a = &reply.attributes;
                peers.push(WgPeer {
                    id: attr_str(a, ".id"),
                    interface: attr_str(a, "interface"),
                    public_key: attr_str(a, "public-key"),
                    endpoint_address: attr_str(a, "endpoint-address"),
                    endpoint_port: attr_str(a, "endpoint-port"),
                    allowed_address: attr_str(a, "allowed-address"),
                    current_endpoint_address: attr_str(a, "current-endpoint-address"),
                    current_endpoint_port: attr_str(a, "current-endpoint-port"),
                    rx: attr_str(a, "rx"),
                    tx: attr_str(a, "tx"),
                    last_handshake: attr_str(a, "last-handshake"),
                    comment: attr_str(a, "comment"),
                    disabled: a
                        .get("disabled")
                        .and_then(|v| v.as_deref())
                        .map(|v| v == "true")
                        .unwrap_or(false),
                });
            }
            Ok(CommandResponse::Trap(trap)) => {
                return Err(format!("Error al listar peers: {}", trap.message));
            }
            _ => {}
        }
    }

    Ok(peers)
}

#[tauri::command]
pub async fn router_remove_wg_peer(
    peer_id: String,
    state: State<'_, RouterConnection>,
) -> Result<(), String> {
    let conn = state.lock().await;
    let device = conn
        .device
        .as_ref()
        .ok_or_else(|| "No hay conexión activa".to_string())?;

    let cmd = CommandBuilder::new()
        .command("/interface/wireguard/peers/remove")
        .attribute("numbers", Some(&peer_id))
        .build();

    let mut rx = device
        .send_command(cmd)
        .await
        .map_err(|e| format!("Error al enviar comando: {}", e))?;

    while let Some(res) = rx.recv().await {
        match res {
            Ok(CommandResponse::Trap(trap)) => {
                return Err(format!("Error al eliminar peer: {}", trap.message));
            }
            Ok(CommandResponse::Fatal(reason)) => {
                return Err(format!("Error fatal: {}", reason));
            }
            _ => {}
        }
    }

    Ok(())
}

// Helper functions

async fn get_identity(device: &MikrotikDevice) -> Result<String, String> {
    let cmd = CommandBuilder::new()
        .command("/system/identity/print")
        .build();

    let mut rx = device
        .send_command(cmd)
        .await
        .map_err(|e| format!("Error: {}", e))?;

    let mut identity = String::from("Unknown");

    while let Some(res) = rx.recv().await {
        if let Ok(CommandResponse::Reply(reply)) = res {
            if let Some(Some(name)) = reply.attributes.get("name") {
                identity = name.clone();
            }
        }
    }

    Ok(identity)
}

async fn get_system_resource(
    device: &MikrotikDevice,
    identity: &str,
) -> Result<RouterInfo, String> {
    let cmd = CommandBuilder::new()
        .command("/system/resource/print")
        .build();

    let mut rx = device
        .send_command(cmd)
        .await
        .map_err(|e| format!("Error: {}", e))?;

    while let Some(res) = rx.recv().await {
        if let Ok(CommandResponse::Reply(reply)) = res {
            let a = &reply.attributes;
            return Ok(RouterInfo {
                identity: identity.to_string(),
                board_name: attr_str(a, "board-name"),
                version: attr_str(a, "version"),
                architecture: attr_str(a, "architecture-name"),
                uptime: attr_str(a, "uptime"),
                cpu_load: attr_str(a, "cpu-load"),
                free_memory: attr_str(a, "free-memory"),
                total_memory: attr_str(a, "total-memory"),
            });
        }
    }

    Err("No se pudo obtener información del router".to_string())
}

fn chrono_timestamp() -> u64 {
    std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap_or_default()
        .as_secs()
}

mod commands;
mod crypto;
mod database;
mod router;
mod ssh;

use tauri::Manager;
use commands::crypto::{wg_derive_public_key, wg_generate_keypair, wg_generate_psk};
use commands::chr::{chr_deploy, chr_detect_vps};
use commands::database::{
    db_delete_profile, db_delete_router, db_delete_vps, db_get_profile, db_get_profiles,
    db_get_routers, db_get_stats, db_get_vps_list, db_save_profile, db_save_router,
    db_save_vps, db_update_router_info,
};
use commands::router::{
    router_connect, router_deploy_script, router_disconnect, router_get_info,
    router_is_connected, router_list_wg_peers, router_remove_wg_peer,
};
use router::connection::create_connection_state;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .setup(|app| {
            let app_data_dir = app.path().app_data_dir()?;

            let db_conn = database::init::initialize_database(&app_data_dir)
                .map_err(|e| Box::<dyn std::error::Error>::from(e))?;

            app.manage(db_conn);
            Ok(())
        })
        .manage(create_connection_state())
        .invoke_handler(tauri::generate_handler![
            wg_generate_keypair,
            wg_derive_public_key,
            wg_generate_psk,
            router_connect,
            router_disconnect,
            router_is_connected,
            router_get_info,
            router_deploy_script,
            router_list_wg_peers,
            router_remove_wg_peer,
            db_save_profile,
            db_get_profiles,
            db_get_profile,
            db_delete_profile,
            db_save_router,
            db_get_routers,
            db_delete_router,
            db_update_router_info,
            db_get_stats,
            chr_detect_vps,
            chr_deploy,
            db_save_vps,
            db_get_vps_list,
            db_delete_vps,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

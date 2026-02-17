use std::time::Duration;

use async_ssh2_tokio::client::{AuthMethod, Client, ServerCheckMethod};
use tokio::time::timeout;

use crate::ssh::types::{ChrDeployResult, VpsDetection};

const SSH_CONNECT_TIMEOUT: Duration = Duration::from_secs(15);
const SSH_DEPLOY_TIMEOUT: Duration = Duration::from_secs(300);

async fn ssh_connect(
    host: &str,
    port: u16,
    username: &str,
    auth_type: &str,
    password: Option<&str>,
    key_path: Option<&str>,
) -> Result<Client, String> {
    let auth_method = match auth_type {
        "key" => {
            let path = key_path.ok_or("Se requiere ruta de llave SSH")?;
            AuthMethod::with_key_file(path, password.map(|p| p.to_string()).as_deref())
        }
        _ => {
            let pass = password.unwrap_or("");
            AuthMethod::with_password(pass)
        }
    };

    let connect_future = Client::connect(
        (host, port),
        username,
        auth_method,
        ServerCheckMethod::NoCheck,
    );

    match timeout(SSH_CONNECT_TIMEOUT, connect_future).await {
        Ok(Ok(client)) => Ok(client),
        Ok(Err(e)) => {
            let err_str = e.to_string();
            if err_str.contains("Authentication") || err_str.contains("authentication") {
                Err(format!("Autenticación fallida para {}@{}:{}. Verifica usuario y contraseña/llave.", username, host, port))
            } else if err_str.contains("refused") || err_str.contains("Connection refused") {
                Err(format!("Conexión rechazada en {}:{}. Verifica que el servicio SSH esté activo.", host, port))
            } else {
                Err(format!("Error SSH en {}:{} — {}", host, port, err_str))
            }
        }
        Err(_) => {
            Err(format!(
                "Timeout de conexión SSH ({}s). No se pudo conectar a {}:{}. Verifica que el host sea accesible y el puerto SSH esté abierto.",
                SSH_CONNECT_TIMEOUT.as_secs(), host, port
            ))
        }
    }
}

async fn exec(client: &Client, cmd: &str) -> Result<String, String> {
    let result = client
        .execute(cmd)
        .await
        .map_err(|e| format!("Error ejecutando comando: {e}"))?;
    Ok(result.stdout.trim().to_string())
}

fn compute_img_url(arch: &str, boot_mode: &str, version: &str) -> String {
    match arch {
        "aarch64" => format!(
            "https://github.com/elseif/MikroTikPatch/releases/download/{version}-arm64/chr-{version}-arm64.img.zip"
        ),
        _ => {
            // x86_64, i386, i686, etc.
            if boot_mode == "UEFI" {
                format!(
                    "https://github.com/elseif/MikroTikPatch/releases/download/{version}/chr-{version}.img.zip"
                )
            } else {
                format!(
                    "https://github.com/elseif/MikroTikPatch/releases/download/{version}/chr-{version}-legacy-bios.img.zip"
                )
            }
        }
    }
}

#[tauri::command]
pub async fn chr_detect_vps(
    host: String,
    port: u16,
    username: String,
    auth_type: String,
    password: Option<String>,
    key_path: Option<String>,
) -> Result<VpsDetection, String> {
    let client = ssh_connect(
        &host,
        port,
        &username,
        &auth_type,
        password.as_deref(),
        key_path.as_deref(),
    )
    .await?;

    // Detect architecture
    let arch = exec(&client, "uname -m").await?;

    // Detect boot mode
    let boot_mode =
        exec(&client, "[ -d /sys/firmware/efi ] && echo UEFI || echo BIOS").await?;

    // Detect primary storage device (skip loop, ram, sr devices)
    let storage = exec(
        &client,
        "for d in /sys/block/*; do case $(basename $d) in loop*|ram*|sr*) continue ;; *) echo $(basename $d); break ;; esac; done",
    )
    .await?;
    if storage.is_empty() {
        return Err("No se detectó disco de almacenamiento".to_string());
    }

    // Detect ETH from default route
    let eth = exec(
        &client,
        "ip route show default | grep '^default' | sed -n 's/.* dev \\([^ ]*\\) .*/\\1/p'",
    )
    .await
    .unwrap_or_default();

    // Detect IP address with CIDR on the interface
    let address = if !eth.is_empty() {
        let addr_output = exec(
            &client,
            &format!("ip addr show {} | grep global | cut -d' ' -f 6 | head -n 1", eth),
        )
        .await?;
        if addr_output.is_empty() {
            format!("{host}/24")
        } else {
            addr_output
        }
    } else {
        format!("{host}/24")
    };

    // Detect gateway
    let gateway = exec(
        &client,
        "ip route list | grep default | cut -d' ' -f 3",
    )
    .await
    .unwrap_or_default();

    // Detect DNS
    let dns = exec(
        &client,
        "grep '^nameserver' /etc/resolv.conf | awk '{print $2}' | head -n 1",
    )
    .await
    .unwrap_or_else(|_| "8.8.8.8".to_string());
    let dns = if dns.is_empty() {
        "8.8.8.8".to_string()
    } else {
        dns
    };

    let img_url = compute_img_url(&arch, &boot_mode, "7.20.8");

    Ok(VpsDetection {
        arch,
        boot_mode,
        storage,
        eth,
        address,
        gateway,
        dns,
        img_url,
    })
}

#[tauri::command]
pub async fn chr_deploy(
    host: String,
    port: u16,
    username: String,
    auth_type: String,
    password: Option<String>,
    key_path: Option<String>,
    version: String,
    detection_json: String,
) -> Result<ChrDeployResult, String> {
    let detection: VpsDetection =
        serde_json::from_str(&detection_json).map_err(|e| format!("JSON inválido: {e}"))?;

    let client = ssh_connect(
        &host,
        port,
        &username,
        &auth_type,
        password.as_deref(),
        key_path.as_deref(),
    )
    .await?;

    // Recalculate img_url with the user-specified version
    let img_url = compute_img_url(&detection.arch, &detection.boot_mode, &version);

    // Build the deploy script as a sequence of commands
    let storage = &detection.storage;
    let address = &detection.address;
    let gateway = &detection.gateway;
    let dns = &detection.dns;

    // Step 1: Download, extract, mount, write image (this returns normally)
    let install_script = format!(
        r#"set -e
echo "=== Descargando imagen CHR ==="
wget --no-check-certificate -O /tmp/chr.img.zip "{img_url}" || {{ echo "ERROR: Fallo descarga de {img_url}"; exit 1; }}

echo "=== Descomprimiendo imagen ==="
cd /tmp
unzip -p chr.img.zip > chr.img || {{ echo "ERROR: Fallo descompresión"; exit 1; }}
echo "Imagen: /tmp/chr.img"

echo "=== Montando imagen para configurar red ==="
if LOOP=$(losetup -Pf --show chr.img 2>/dev/null); then
  sleep 3
  MNT=/tmp/chr_mount
  mkdir -p $MNT
  if mount ${{LOOP}}p2 $MNT 2>/dev/null; then
    echo "=== Escribiendo autorun.scr ==="
    cat > $MNT/rw/autorun.scr << 'AUTOEOF'
/ip address add address={address} interface=ether1
/ip route add gateway={gateway}
/ip dns set servers={dns}
AUTOEOF
    echo "autorun.scr escrito correctamente"
    umount $MNT
  else
    echo "ADVERTENCIA: No se pudo montar partición 2, se omite autorun.scr"
  fi
  losetup -d $LOOP
fi

echo "=== Escribiendo imagen en /dev/{storage} ==="
dd if=/tmp/chr.img of=/dev/{storage} bs=4M conv=fsync 2>&1
echo "=== Imagen CHR escrita exitosamente ==="
echo "DEPLOY_OK"
"#
    );

    // Run install script with timeout (download+dd can take a few minutes)
    let exec_result = timeout(SSH_DEPLOY_TIMEOUT, client.execute(&install_script)).await;

    let (success, output) = match exec_result {
        Ok(Ok(result)) => {
            let combined = format!("{}\n{}", result.stdout, result.stderr);
            let ok = combined.contains("DEPLOY_OK");
            (ok, combined.trim().to_string())
        }
        Ok(Err(e)) => {
            return Err(format!("Error ejecutando script: {e}"));
        }
        Err(_) => {
            return Err("Timeout: el script tardó más de 5 minutos".to_string());
        }
    };

    if !success {
        return Ok(ChrDeployResult {
            success: false,
            output,
            detection,
        });
    }

    // Step 2: Fire-and-forget reboot (don't wait for response)
    let reboot_output = format!(
        "{}\n=== Reiniciando servidor con MikroTik CHR ===",
        output
    );

    // Spawn reboot in background — we don't care if execute hangs or errors
    let reboot_client = client;
    tokio::spawn(async move {
        let _ = timeout(
            Duration::from_secs(10),
            reboot_client.execute(
                "echo 1 > /proc/sys/kernel/sysrq 2>/dev/null; echo b > /proc/sysrq-trigger 2>/dev/null; reboot -f 2>/dev/null"
            ),
        ).await;
    });

    Ok(ChrDeployResult {
        success: true,
        output: reboot_output,
        detection,
    })
}

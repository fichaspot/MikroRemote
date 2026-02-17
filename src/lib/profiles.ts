import { open, save } from "@tauri-apps/plugin-dialog";
import { readTextFile, writeTextFile } from "@tauri-apps/plugin-fs";
import type { WgServerConfig, WgNetworkConfig, WgServerKeys, WgClientConfig } from "@/types";

export interface SavedProfile {
  name: string;
  createdAt: string;
  server: WgServerConfig;
  network: WgNetworkConfig;
  serverKeys: WgServerKeys;
  clients: WgClientConfig[];
}

export async function saveProfileToFile(profile: SavedProfile): Promise<string | null> {
  const filePath = await save({
    title: "Guardar Perfil WireGuard",
    defaultPath: `${profile.server.interfaceName || "wireguard"}-perfil.json`,
    filters: [{ name: "JSON", extensions: ["json"] }],
  });
  if (!filePath) return null;

  await writeTextFile(filePath, JSON.stringify(profile, null, 2));
  return filePath;
}

export async function loadProfileFromFile(): Promise<SavedProfile | null> {
  const filePath = await open({
    title: "Cargar Perfil WireGuard",
    filters: [{ name: "JSON", extensions: ["json"] }],
  });
  if (!filePath) return null;

  const content = await readTextFile(filePath);
  const data = JSON.parse(content);

  // Validación básica
  if (!data.server || !data.network || !data.clients) {
    throw new Error("Formato de perfil inválido: faltan campos requeridos");
  }

  return {
    name: data.name || data.profileName || "Importado",
    createdAt: data.createdAt || new Date().toISOString(),
    server: data.server,
    network: data.network,
    serverKeys: data.serverKeys || { privateKey: "", publicKey: "", imported: false },
    clients: data.clients,
  };
}

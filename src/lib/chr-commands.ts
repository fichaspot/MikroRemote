import { invoke } from "@tauri-apps/api/core";
import type { VpsDetection, ChrDeployResult, SavedVps } from "@/types";

// --- Raw result types (snake_case from Rust) ---

interface VpsDetectionResult {
  arch: string;
  boot_mode: string;
  storage: string;
  eth: string;
  address: string;
  gateway: string;
  dns: string;
  img_url: string;
}

interface ChrDeployResultRaw {
  success: boolean;
  output: string;
  detection: VpsDetectionResult;
}

interface SavedVpsResult {
  id: string;
  name: string;
  host: string;
  port: number;
  username: string;
  auth_type: string;
  password: string;
  key_path: string;
  last_arch: string | null;
  last_deploy_at: string | null;
  created_at: string;
  updated_at: string;
}

// --- Mappers ---

function mapDetection(r: VpsDetectionResult): VpsDetection {
  return {
    arch: r.arch,
    bootMode: r.boot_mode,
    storage: r.storage,
    eth: r.eth,
    address: r.address,
    gateway: r.gateway,
    dns: r.dns,
    imgUrl: r.img_url,
  };
}

function mapVps(r: SavedVpsResult): SavedVps {
  return {
    id: r.id,
    name: r.name,
    host: r.host,
    port: r.port,
    username: r.username,
    authType: r.auth_type as "password" | "key",
    password: r.password,
    keyPath: r.key_path,
    lastArch: r.last_arch ?? undefined,
    lastDeployAt: r.last_deploy_at ?? undefined,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

// --- CHR Commands ---

export async function chrDetectVps(params: {
  host: string;
  port: number;
  username: string;
  authType: string;
  password?: string;
  keyPath?: string;
}): Promise<VpsDetection> {
  const result = await invoke<VpsDetectionResult>("chr_detect_vps", {
    host: params.host,
    port: params.port,
    username: params.username,
    authType: params.authType,
    password: params.password ?? null,
    keyPath: params.keyPath ?? null,
  });
  return mapDetection(result);
}

export async function chrDeploy(params: {
  host: string;
  port: number;
  username: string;
  authType: string;
  password?: string;
  keyPath?: string;
  version: string;
  detectionJson: string;
}): Promise<ChrDeployResult> {
  const result = await invoke<ChrDeployResultRaw>("chr_deploy", {
    host: params.host,
    port: params.port,
    username: params.username,
    authType: params.authType,
    password: params.password ?? null,
    keyPath: params.keyPath ?? null,
    version: params.version,
    detectionJson: params.detectionJson,
  });
  return {
    success: result.success,
    output: result.output,
    detection: mapDetection(result.detection),
  };
}

// --- VPS DB Commands ---

export async function dbSaveVps(params: {
  id?: string;
  name: string;
  host: string;
  port: number;
  username: string;
  authType: string;
  password: string;
  keyPath: string;
}): Promise<string> {
  return invoke<string>("db_save_vps", {
    id: params.id ?? null,
    name: params.name,
    host: params.host,
    port: params.port,
    username: params.username,
    authType: params.authType,
    password: params.password,
    keyPath: params.keyPath,
  });
}

export async function dbGetVpsList(): Promise<SavedVps[]> {
  const results = await invoke<SavedVpsResult[]>("db_get_vps_list");
  return results.map(mapVps);
}

export async function dbDeleteVps(id: string): Promise<void> {
  await invoke("db_delete_vps", { id });
}

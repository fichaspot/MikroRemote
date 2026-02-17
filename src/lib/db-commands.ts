import { invoke } from "@tauri-apps/api/core";
import type {
  ProfileSummary,
  SavedRouter,
  DashboardStats,
  DbProfile,
} from "@/types";

// --- Raw result types (snake_case from Rust) ---

interface ProfileSummaryResult {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
  client_count: number;
  server_address: string;
}

interface SavedRouterResult {
  id: string;
  name: string;
  host: string;
  port: number;
  username: string;
  password: string;
  last_identity: string | null;
  last_version: string | null;
  created_at: string;
  updated_at: string;
}

interface DashboardStatsResult {
  profile_count: number;
  router_count: number;
  vps_count: number;
  recent_profiles: ProfileSummaryResult[];
}

interface DbProfileResult {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
  server: string;
  network: string;
  server_keys: string;
  clients: string;
}

// --- Mappers ---

function mapSummary(r: ProfileSummaryResult): ProfileSummary {
  return {
    id: r.id,
    name: r.name,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    clientCount: r.client_count,
    serverAddress: r.server_address,
  };
}

function mapRouter(r: SavedRouterResult): SavedRouter {
  return {
    id: r.id,
    name: r.name,
    host: r.host,
    port: r.port,
    username: r.username,
    password: r.password,
    lastIdentity: r.last_identity ?? undefined,
    lastVersion: r.last_version ?? undefined,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

function mapDbProfile(r: DbProfileResult): DbProfile {
  return {
    id: r.id,
    name: r.name,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    server: r.server,
    network: r.network,
    serverKeys: r.server_keys,
    clients: r.clients,
  };
}

// --- Profiles ---

export async function dbSaveProfile(params: {
  id?: string;
  name: string;
  server: string;
  network: string;
  serverKeys: string;
  clients: string;
}): Promise<string> {
  return invoke<string>("db_save_profile", {
    id: params.id ?? null,
    name: params.name,
    server: params.server,
    network: params.network,
    serverKeys: params.serverKeys,
    clients: params.clients,
  });
}

export async function dbGetProfiles(): Promise<ProfileSummary[]> {
  const results = await invoke<ProfileSummaryResult[]>("db_get_profiles");
  return results.map(mapSummary);
}

export async function dbGetProfile(id: string): Promise<DbProfile> {
  const result = await invoke<DbProfileResult>("db_get_profile", { id });
  return mapDbProfile(result);
}

export async function dbDeleteProfile(id: string): Promise<void> {
  await invoke("db_delete_profile", { id });
}

// --- Routers ---

export async function dbSaveRouter(params: {
  id?: string;
  name: string;
  host: string;
  port: number;
  username: string;
  password: string;
}): Promise<string> {
  return invoke<string>("db_save_router", {
    id: params.id ?? null,
    name: params.name,
    host: params.host,
    port: params.port,
    username: params.username,
    password: params.password,
  });
}

export async function dbGetRouters(): Promise<SavedRouter[]> {
  const results = await invoke<SavedRouterResult[]>("db_get_routers");
  return results.map(mapRouter);
}

export async function dbDeleteRouter(id: string): Promise<void> {
  await invoke("db_delete_router", { id });
}

export async function dbUpdateRouterInfo(
  id: string,
  identity: string,
  version: string
): Promise<void> {
  await invoke("db_update_router_info", { id, identity, version });
}

// --- Dashboard ---

export async function dbGetStats(): Promise<DashboardStats> {
  const result = await invoke<DashboardStatsResult>("db_get_stats");
  return {
    profileCount: result.profile_count,
    routerCount: result.router_count,
    vpsCount: result.vps_count,
    recentProfiles: result.recent_profiles.map(mapSummary),
  };
}

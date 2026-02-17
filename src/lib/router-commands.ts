import { invoke } from "@tauri-apps/api/core";
import type { RouterInfo, WgPeer, DeployResult } from "@/types";

interface RouterInfoResult {
  identity: string;
  board_name: string;
  version: string;
  architecture: string;
  uptime: string;
  cpu_load: string;
  free_memory: string;
  total_memory: string;
}

interface WgPeerResult {
  id: string;
  interface: string;
  public_key: string;
  endpoint_address: string;
  endpoint_port: string;
  allowed_address: string;
  current_endpoint_address: string;
  current_endpoint_port: string;
  rx: string;
  tx: string;
  last_handshake: string;
  comment: string;
  disabled: boolean;
}

function mapRouterInfo(r: RouterInfoResult): RouterInfo {
  return {
    identity: r.identity,
    boardName: r.board_name,
    version: r.version,
    architecture: r.architecture,
    uptime: r.uptime,
    cpuLoad: r.cpu_load,
    freeMemory: r.free_memory,
    totalMemory: r.total_memory,
  };
}

function mapWgPeer(p: WgPeerResult): WgPeer {
  return {
    id: p.id,
    interface: p.interface,
    publicKey: p.public_key,
    endpointAddress: p.endpoint_address,
    endpointPort: p.endpoint_port,
    allowedAddress: p.allowed_address,
    currentEndpointAddress: p.current_endpoint_address,
    currentEndpointPort: p.current_endpoint_port,
    rx: p.rx,
    tx: p.tx,
    lastHandshake: p.last_handshake,
    comment: p.comment,
    disabled: p.disabled,
  };
}

export async function routerConnect(
  host: string,
  port: number,
  username: string,
  password: string
): Promise<RouterInfo> {
  const result = await invoke<RouterInfoResult>("router_connect", {
    host,
    port,
    username,
    password,
  });
  return mapRouterInfo(result);
}

export async function routerDisconnect(): Promise<void> {
  await invoke("router_disconnect");
}

export async function routerIsConnected(): Promise<boolean> {
  return invoke<boolean>("router_is_connected");
}

export async function routerGetInfo(): Promise<RouterInfo> {
  const result = await invoke<RouterInfoResult>("router_get_info");
  return mapRouterInfo(result);
}

export async function routerDeployScript(
  script: string
): Promise<DeployResult> {
  return invoke<DeployResult>("router_deploy_script", { script });
}

export async function routerListWgPeers(): Promise<WgPeer[]> {
  const results = await invoke<WgPeerResult[]>("router_list_wg_peers");
  return results.map(mapWgPeer);
}

export async function routerRemoveWgPeer(peerId: string): Promise<void> {
  await invoke("router_remove_wg_peer", { peerId });
}

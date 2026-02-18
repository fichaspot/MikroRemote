export interface WgKeyPair {
  privateKey: string;
  publicKey: string;
}

export interface WgServerConfig {
  address: string;
  listenPort: number;
  interfaceName: string;
}

export interface WgNetworkConfig {
  subnet: string;
  subnetMask: number;
  clientStartIp: string;
  clientCount: number;
  serverIp: string;
}

export interface WgClientConfig {
  id: string;
  name: string;
  ip: string;
  keys: WgKeyPair;
  psk: string;
  dns: string;
  allowedIps: string;
  endpoint: string;
  keepalive: number;
  lanSegments?: string[];
}

export interface WgServerKeys {
  privateKey: string;
  publicKey: string;
  imported: boolean;
}

export interface WgProfile {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  server: WgServerConfig;
  network: WgNetworkConfig;
  serverKeys: WgServerKeys;
  clients: WgClientConfig[];
}

export interface GeneratedConfigs {
  serverRsc: string;
  clientConfs: { name: string; content: string }[];
  peerRsc: string;
  mikrotikClientRsc: string;
}

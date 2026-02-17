export interface RouterCredentials {
  host: string;
  port: number;
  username: string;
  password: string;
}

export interface RouterInfo {
  identity: string;
  boardName: string;
  version: string;
  architecture: string;
  uptime: string;
  cpuLoad: string;
  freeMemory: string;
  totalMemory: string;
}

export interface WgPeer {
  id: string;
  interface: string;
  publicKey: string;
  endpointAddress: string;
  endpointPort: string;
  allowedAddress: string;
  currentEndpointAddress: string;
  currentEndpointPort: string;
  rx: string;
  tx: string;
  lastHandshake: string;
  comment: string;
  disabled: boolean;
}

export interface DeployResult {
  success: boolean;
  message: string;
}

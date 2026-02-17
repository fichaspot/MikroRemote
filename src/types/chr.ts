export interface VpsDetection {
  arch: string;
  bootMode: string;
  storage: string;
  eth: string;
  address: string;
  gateway: string;
  dns: string;
  imgUrl: string;
}

export interface ChrDeployResult {
  success: boolean;
  output: string;
  detection: VpsDetection;
}

export interface SavedVps {
  id: string;
  name: string;
  host: string;
  port: number;
  username: string;
  authType: "password" | "key";
  password: string;
  keyPath: string;
  lastArch?: string;
  lastDeployAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProfileSummary {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  clientCount: number;
  serverAddress: string;
}

export interface SavedRouter {
  id: string;
  name: string;
  host: string;
  port: number;
  username: string;
  password: string;
  lastIdentity?: string;
  lastVersion?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  profileCount: number;
  routerCount: number;
  vpsCount: number;
  recentProfiles: ProfileSummary[];
}

export interface DbProfile {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  server: string;
  network: string;
  serverKeys: string;
  clients: string;
}

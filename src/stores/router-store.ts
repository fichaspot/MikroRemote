import { create } from "zustand";
import type { RouterInfo, WgPeer, RouterCredentials, SavedRouter } from "@/types";
import { dbGetRouters, dbSaveRouter, dbDeleteRouter } from "@/lib/db-commands";
import { toast } from "sonner";

interface RouterState {
  isConnected: boolean;
  isConnecting: boolean;
  isDeploying: boolean;
  info: RouterInfo | null;
  credentials: RouterCredentials | null;
  peers: WgPeer[];
  error: string | null;

  // Saved routers from DB
  savedRouters: SavedRouter[];
  isLoadingSaved: boolean;

  setConnected: (connected: boolean) => void;
  setConnecting: (connecting: boolean) => void;
  setDeploying: (deploying: boolean) => void;
  setInfo: (info: RouterInfo | null) => void;
  setCredentials: (credentials: RouterCredentials | null) => void;
  setPeers: (peers: WgPeer[]) => void;
  setError: (error: string | null) => void;
  reset: () => void;

  // Saved routers actions
  fetchSavedRouters: () => Promise<void>;
  saveRouter: (params: {
    id?: string;
    name: string;
    host: string;
    port: number;
    username: string;
    password: string;
  }) => Promise<string | null>;
  deleteSavedRouter: (id: string) => Promise<void>;
}

export const useRouterStore = create<RouterState>((set) => ({
  isConnected: false,
  isConnecting: false,
  isDeploying: false,
  info: null,
  credentials: null,
  peers: [],
  error: null,
  savedRouters: [],
  isLoadingSaved: false,

  setConnected: (isConnected) => set({ isConnected }),
  setConnecting: (isConnecting) => set({ isConnecting }),
  setDeploying: (isDeploying) => set({ isDeploying }),
  setInfo: (info) => set({ info }),
  setCredentials: (credentials) => set({ credentials }),
  setPeers: (peers) => set({ peers }),
  setError: (error) => set({ error }),
  reset: () =>
    set({
      isConnected: false,
      isConnecting: false,
      isDeploying: false,
      info: null,
      credentials: null,
      peers: [],
      error: null,
    }),

  fetchSavedRouters: async () => {
    set({ isLoadingSaved: true });
    try {
      const savedRouters = await dbGetRouters();
      set({ savedRouters });
    } catch (e) {
      toast.error(`Error al cargar routers: ${e}`);
    } finally {
      set({ isLoadingSaved: false });
    }
  },

  saveRouter: async (params) => {
    try {
      const id = await dbSaveRouter(params);
      toast.success("Router guardado");
      const savedRouters = await dbGetRouters();
      set({ savedRouters });
      return id;
    } catch (e) {
      toast.error(`Error al guardar router: ${e}`);
      return null;
    }
  },

  deleteSavedRouter: async (id) => {
    try {
      await dbDeleteRouter(id);
      toast.success("Router eliminado");
      const savedRouters = await dbGetRouters();
      set({ savedRouters });
    } catch (e) {
      toast.error(`Error al eliminar router: ${e}`);
    }
  },
}));

import { create } from "zustand";
import type { SavedVps, VpsDetection, ChrDeployResult } from "@/types";
import { dbGetVpsList, dbSaveVps, dbDeleteVps } from "@/lib/chr-commands";
import { toast } from "sonner";

interface VpsState {
  savedVps: SavedVps[];
  isLoadingSaved: boolean;
  detection: VpsDetection | null;
  deployResult: ChrDeployResult | null;

  setDetection: (detection: VpsDetection | null) => void;
  setDeployResult: (result: ChrDeployResult | null) => void;
  reset: () => void;

  fetchSavedVps: () => Promise<void>;
  saveVps: (params: {
    id?: string;
    name: string;
    host: string;
    port: number;
    username: string;
    authType: string;
    password: string;
    keyPath: string;
  }) => Promise<string | null>;
  deleteVps: (id: string) => Promise<void>;
}

export const useVpsStore = create<VpsState>((set) => ({
  savedVps: [],
  isLoadingSaved: false,
  detection: null,
  deployResult: null,

  setDetection: (detection) => set({ detection }),
  setDeployResult: (deployResult) => set({ deployResult }),
  reset: () => set({ detection: null, deployResult: null }),

  fetchSavedVps: async () => {
    set({ isLoadingSaved: true });
    try {
      const savedVps = await dbGetVpsList();
      set({ savedVps });
    } catch (e) {
      toast.error(`Error al cargar VPS: ${e}`);
    } finally {
      set({ isLoadingSaved: false });
    }
  },

  saveVps: async (params) => {
    try {
      const id = await dbSaveVps(params);
      toast.success("VPS guardado");
      const savedVps = await dbGetVpsList();
      set({ savedVps });
      return id;
    } catch (e) {
      toast.error(`Error al guardar VPS: ${e}`);
      return null;
    }
  },

  deleteVps: async (id) => {
    try {
      await dbDeleteVps(id);
      toast.success("VPS eliminado");
      const savedVps = await dbGetVpsList();
      set({ savedVps });
    } catch (e) {
      toast.error(`Error al eliminar VPS: ${e}`);
    }
  },
}));

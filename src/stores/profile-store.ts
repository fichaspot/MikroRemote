import { create } from "zustand";
import type { ProfileSummary } from "@/types";
import { dbGetProfiles, dbSaveProfile, dbDeleteProfile } from "@/lib/db-commands";
import { toast } from "sonner";

interface ProfileStoreState {
  profiles: ProfileSummary[];
  isLoading: boolean;

  fetchProfiles: () => Promise<void>;
  saveProfile: (params: {
    id?: string;
    name: string;
    server: string;
    network: string;
    serverKeys: string;
    clients: string;
  }) => Promise<string | null>;
  deleteProfile: (id: string) => Promise<void>;
}

export const useProfileStore = create<ProfileStoreState>((set) => ({
  profiles: [],
  isLoading: false,

  fetchProfiles: async () => {
    set({ isLoading: true });
    try {
      const profiles = await dbGetProfiles();
      set({ profiles });
    } catch (e) {
      toast.error(`Error al cargar perfiles: ${e}`);
    } finally {
      set({ isLoading: false });
    }
  },

  saveProfile: async (params) => {
    try {
      const id = await dbSaveProfile(params);
      toast.success("Perfil guardado en base de datos");
      // Refresh list
      const profiles = await dbGetProfiles();
      set({ profiles });
      return id;
    } catch (e) {
      toast.error(`Error al guardar perfil: ${e}`);
      return null;
    }
  },

  deleteProfile: async (id) => {
    try {
      await dbDeleteProfile(id);
      toast.success("Perfil eliminado");
      const profiles = await dbGetProfiles();
      set({ profiles });
    } catch (e) {
      toast.error(`Error al eliminar perfil: ${e}`);
    }
  },
}));

import { create } from "zustand";
import type {
  WgServerConfig,
  WgNetworkConfig,
  WgClientConfig,
  WgServerKeys,
  GeneratedConfigs,
} from "@/types";

export const WIZARD_STEPS = [
  "Inicio",
  "Servidor",
  "Red",
  "Clientes",
  "Llaves",
  "Resumen",
  "Resultados",
] as const;

export type WizardStep = (typeof WIZARD_STEPS)[number];

interface WizardState {
  currentStep: number;
  profileName: string;
  server: WgServerConfig;
  network: WgNetworkConfig;
  serverKeys: WgServerKeys;
  clients: WgClientConfig[];
  generatedConfigs: GeneratedConfigs | null;
  isGenerating: boolean;

  // Actions
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  setProfileName: (name: string) => void;
  setServer: (server: Partial<WgServerConfig>) => void;
  setNetwork: (network: Partial<WgNetworkConfig>) => void;
  setServerKeys: (keys: Partial<WgServerKeys>) => void;
  setClients: (clients: WgClientConfig[]) => void;
  updateClient: (id: string, data: Partial<WgClientConfig>) => void;
  setGeneratedConfigs: (configs: GeneratedConfigs | null) => void;
  setIsGenerating: (v: boolean) => void;
  reset: () => void;
  loadFromProfile: (data: {
    profileName: string;
    server: WgServerConfig;
    network: WgNetworkConfig;
    serverKeys: WgServerKeys;
    clients: WgClientConfig[];
  }) => void;
}

const initialServer: WgServerConfig = {
  address: "",
  listenPort: 51820,
  interfaceName: "wireguard1",
};

const initialNetwork: WgNetworkConfig = {
  subnet: "10.0.0.0",
  subnetMask: 24,
  clientStartIp: "10.0.0.2",
  clientCount: 5,
  serverIp: "10.0.0.1",
};

const initialServerKeys: WgServerKeys = {
  privateKey: "",
  publicKey: "",
  imported: false,
};

export const useWizardStore = create<WizardState>((set) => ({
  currentStep: 0,
  profileName: "",
  server: { ...initialServer },
  network: { ...initialNetwork },
  serverKeys: { ...initialServerKeys },
  clients: [],
  generatedConfigs: null,
  isGenerating: false,

  setStep: (step) => set({ currentStep: step }),
  nextStep: () => set((s) => ({ currentStep: Math.min(s.currentStep + 1, WIZARD_STEPS.length - 1) })),
  prevStep: () => set((s) => ({ currentStep: Math.max(s.currentStep - 1, 0) })),
  setProfileName: (profileName) => set({ profileName }),
  setServer: (server) => set((s) => ({ server: { ...s.server, ...server } })),
  setNetwork: (network) => set((s) => ({ network: { ...s.network, ...network } })),
  setServerKeys: (keys) => set((s) => ({ serverKeys: { ...s.serverKeys, ...keys } })),
  setClients: (clients) => set({ clients }),
  updateClient: (id, data) =>
    set((s) => ({
      clients: s.clients.map((c) => (c.id === id ? { ...c, ...data } : c)),
    })),
  setGeneratedConfigs: (generatedConfigs) => set({ generatedConfigs }),
  setIsGenerating: (isGenerating) => set({ isGenerating }),
  reset: () =>
    set({
      currentStep: 0,
      profileName: "",
      server: { ...initialServer },
      network: { ...initialNetwork },
      serverKeys: { ...initialServerKeys },
      clients: [],
      generatedConfigs: null,
      isGenerating: false,
    }),
  loadFromProfile: (data) =>
    set({
      currentStep: 0,
      profileName: data.profileName,
      server: data.server,
      network: data.network,
      serverKeys: data.serverKeys,
      clients: data.clients,
      generatedConfigs: null,
      isGenerating: false,
    }),
}));

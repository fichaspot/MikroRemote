import { create } from "zustand";
import { getCurrentWebview } from "@tauri-apps/api/webview";

type Theme = "dark" | "light";

export const ZOOM_LEVELS = [0.75, 0.8, 0.9, 1.0, 1.1, 1.25, 1.5] as const;

interface AppState {
  theme: Theme;
  toggleTheme: () => void;
  zoom: number;
  setZoom: (level: number) => void;
}

function applyTheme(theme: Theme) {
  if (theme === "dark") {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
}

function getStoredTheme(): Theme {
  try {
    const stored = localStorage.getItem("mikroremote-theme");
    if (stored === "light" || stored === "dark") return stored;
  } catch {}
  return "dark";
}

function getStoredZoom(): number {
  try {
    const stored = localStorage.getItem("mikroremote-zoom");
    if (stored) {
      const val = parseFloat(stored);
      if (ZOOM_LEVELS.includes(val as (typeof ZOOM_LEVELS)[number])) return val;
    }
  } catch {}
  return 1.0;
}

export function applyZoom(level: number) {
  getCurrentWebview().setZoom(level).catch(() => {});
}

const initialTheme = getStoredTheme();
const initialZoom = getStoredZoom();

export const useAppStore = create<AppState>((set) => ({
  theme: initialTheme,
  toggleTheme: () =>
    set((s) => {
      const next: Theme = s.theme === "dark" ? "light" : "dark";
      localStorage.setItem("mikroremote-theme", next);
      applyTheme(next);
      return { theme: next };
    }),
  zoom: initialZoom,
  setZoom: (level: number) =>
    set(() => {
      localStorage.setItem("mikroremote-zoom", String(level));
      applyZoom(level);
      return { zoom: level };
    }),
}));

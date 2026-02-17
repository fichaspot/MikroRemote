import { create } from "zustand";

type Theme = "dark" | "light";

interface AppState {
  theme: Theme;
  toggleTheme: () => void;
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

const initialTheme = getStoredTheme();

export const useAppStore = create<AppState>((set) => ({
  theme: initialTheme,
  toggleTheme: () =>
    set((s) => {
      const next: Theme = s.theme === "dark" ? "light" : "dark";
      localStorage.setItem("mikroremote-theme", next);
      applyTheme(next);
      return { theme: next };
    }),
}));

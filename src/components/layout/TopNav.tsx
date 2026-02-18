import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Shield,
  Lock,
  Server,
  Cloud,
  FolderOpen,
  Settings,
  Sun,
  Moon,
  Minus,
  Square,
  X,
} from "lucide-react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { cn } from "@/lib/utils";
import { Tooltip } from "@/components/ui/tooltip";
import { useAppStore } from "@/stores/app-store";

const appWindow = getCurrentWindow();

const navItems = [
  { label: "Inicio", icon: LayoutDashboard, path: "/", disabled: false },
  { label: "WireGuard", icon: Shield, path: "/wireguard", disabled: false },
  { label: "OpenVPN", icon: Lock, path: "/openvpn", disabled: true },
  { label: "Routers", icon: Server, path: "/routers", disabled: false },
  { label: "CHR Deploy", icon: Cloud, path: "/chr-deploy", disabled: false },
  { label: "Perfiles", icon: FolderOpen, path: "/profiles", disabled: false },
  { label: "Ajustes", icon: Settings, path: "/settings", disabled: true },
];

export function TopNav() {
  const { theme, toggleTheme } = useAppStore();

  return (
    <header data-tauri-drag-region className="h-12 border-b border-border bg-sidebar-background shrink-0 flex items-center px-5 gap-6 select-none">
      {/* Logo */}
      <NavLink to="/" className="flex items-center gap-2.5 shrink-0 mr-2">
        <div className="w-6 h-6 bg-primary rounded-sm flex items-center justify-center">
          <span className="text-white text-xs font-bold font-mono">M</span>
        </div>
        <span className="font-mono font-bold text-sm tracking-wider text-foreground uppercase">
          MikroRemote
        </span>
      </NavLink>

      {/* Separator */}
      <div className="w-px h-5 bg-border shrink-0" />

      {/* Navigation */}
      <nav className="flex items-center gap-1 flex-1">
        {navItems.map((item) => {
          const Icon = item.icon;

          if (item.disabled) {
            return (
              <Tooltip key={item.path} content="Próximamente" side="bottom">
                <div className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground/40 cursor-not-allowed select-none">
                  <Icon className="w-3.5 h-3.5" />
                  <span className="hidden lg:inline">{item.label}</span>
                </div>
              </Tooltip>
            );
          }

          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/"}
              className={({ isActive }) =>
                cn(
                  "relative flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium uppercase tracking-wider transition-colors",
                  isActive
                    ? "text-primary nav-active"
                    : "text-muted-foreground hover:text-foreground"
                )
              }
            >
              <Icon className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Theme toggle + Version badge */}
      <div className="shrink-0 flex items-center gap-3">
        <button
          onClick={toggleTheme}
          className="p-1.5 rounded-sm text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Cambiar tema"
        >
          {theme === "dark" ? (
            <Sun className="w-3.5 h-3.5" />
          ) : (
            <Moon className="w-3.5 h-3.5" />
          )}
        </button>
        <span className="text-[10px] font-mono text-muted-foreground/50 uppercase tracking-widest">
          v0.2
        </span>
      </div>

      {/* Window controls */}
      <div className="shrink-0 flex items-center -mr-5">
        <button
          onClick={() => appWindow.minimize()}
          className="titlebar-btn h-12 w-11 inline-flex items-center justify-center text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          aria-label="Minimizar"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => appWindow.toggleMaximize()}
          className="titlebar-btn h-12 w-11 inline-flex items-center justify-center text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          aria-label="Maximizar"
        >
          <Square className="w-3 h-3" />
        </button>
        <button
          onClick={() => appWindow.close()}
          className="titlebar-btn h-12 w-11 inline-flex items-center justify-center text-muted-foreground hover:bg-[#CF132B] hover:text-white transition-colors"
          aria-label="Cerrar"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </header>
  );
}

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, Lock, Server, Database, Cloud, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { dbGetStats } from "@/lib/db-commands";
import type { DashboardStats } from "@/types";

const features = [
  {
    icon: Shield,
    label: "WireGuard",
    status: "active" as const,
    description: "Configura túneles VPN WireGuard con un asistente paso a paso",
  },
  {
    icon: Server,
    label: "Conexión al Router",
    status: "active" as const,
    description: "Administración directa vía API de RouterOS",
  },
  {
    icon: Cloud,
    label: "CHR Deploy",
    status: "active" as const,
    description: "Instala MikroTik CHR en servidores VPS vía SSH",
  },
  {
    icon: Database,
    label: "Almacenamiento SQLite",
    status: "active" as const,
    description: "Perfiles y routers persistentes en base de datos local",
  },
  {
    icon: Lock,
    label: "OpenVPN",
    status: "coming" as const,
    description: "Gestión de PKI y configuración de servidor OpenVPN",
    version: "v0.4",
  },
];

export function DashboardPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    dbGetStats().then(setStats).catch(() => {});
  }, []);

  return (
    <div className="min-h-full">
      {/* Hero section */}
      <div className="relative border-b border-border overflow-hidden">
        {/* Subtle grid background */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

        <div className="relative px-8 py-12 max-w-5xl mx-auto">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-primary" />
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground">
                Panel de Control
              </span>
            </div>
            <h1 className="text-3xl font-bold uppercase tracking-wide text-foreground">
              MikroRemote
            </h1>
            <p className="text-sm text-muted-foreground max-w-lg leading-relaxed">
              Simplifica la administración de WireGuard y OpenVPN en MikroTik RouterOS
            </p>
          </div>

          {/* Stats row */}
          {stats && (
            <div className="flex items-center gap-8 mt-8 pt-6 border-t border-border">
              <StatBlock icon={Shield} value={stats.profileCount} label="Perfiles" />
              <div className="w-px h-8 bg-border" />
              <StatBlock icon={Server} value={stats.routerCount} label="Routers" />
              <div className="w-px h-8 bg-border" />
              <StatBlock icon={Cloud} value={stats.vpsCount} label="VPS" />
            </div>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div className="px-8 py-8 max-w-5xl mx-auto space-y-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-2 h-2 bg-primary" />
          <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground">
            Acciones Rápidas
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-border">
          <ActionCard
            icon={Shield}
            title="WireGuard"
            description="Asistente de 7 pasos para generar configuración WireGuard."
            action="Iniciar Asistente"
            onClick={() => navigate("/wireguard")}
          />
          <ActionCard
            icon={Cloud}
            title="CHR Deploy"
            description="Instala MikroTik CHR en un servidor VPS vía SSH."
            action="Iniciar Deploy"
            onClick={() => navigate("/chr-deploy")}
          />
          <ActionCard
            icon={Database}
            title="Perfiles"
            description={
              stats && stats.profileCount > 0
                ? `${stats.profileCount} perfil${stats.profileCount !== 1 ? "es" : ""} guardado${stats.profileCount !== 1 ? "s" : ""}.`
                : "Guarda y administra tus configuraciones."
            }
            action="Abrir Perfiles"
            onClick={() => navigate("/profiles")}
            variant="secondary"
          />
        </div>

        {/* Recent profiles */}
        {stats && stats.recentProfiles.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-primary" />
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground">
                Perfiles Recientes
              </span>
            </div>
            <div className="border border-border divide-y divide-border">
              {stats.recentProfiles.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between px-5 py-3 hover:bg-accent/50 transition-colors cursor-pointer"
                  onClick={() => navigate("/profiles")}
                >
                  <div className="flex items-center gap-4">
                    <Shield className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-sm font-medium">{p.name}</span>
                    <span className="text-xs font-mono text-muted-foreground">
                      {p.serverAddress}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground font-mono">
                      {p.clientCount} cliente{p.clientCount !== 1 ? "s" : ""}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Feature status */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-primary" />
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground">
              Estado de Funcionalidades
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-border border border-border">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.label} className="bg-card p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <Icon className="w-4 h-4 text-muted-foreground" />
                    {f.status === "active" ? (
                      <Badge>Activo</Badge>
                    ) : (
                      <Badge variant="secondary">{f.version}</Badge>
                    )}
                  </div>
                  <p className="text-xs font-mono font-semibold uppercase tracking-wider">
                    {f.label}
                  </p>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    {f.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatBlock({ icon: Icon, value, label }: { icon: React.ElementType; value: number; label: string }) {
  return (
    <div className="flex items-center gap-3">
      <Icon className="w-4 h-4 text-muted-foreground" />
      <div>
        <p className="text-2xl font-mono font-bold text-foreground">{value}</p>
        <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

function ActionCard({
  icon: Icon,
  title,
  description,
  action,
  onClick,
  variant = "default",
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  action: string;
  onClick: () => void;
  variant?: "default" | "secondary";
}) {
  return (
    <div
      className="bg-card p-6 space-y-4 cursor-pointer group hover:bg-accent/50 transition-colors"
      onClick={onClick}
    >
      <div className="flex items-center gap-3">
        <Icon className="w-4 h-4 text-primary" />
        <span className="font-mono text-sm font-semibold uppercase tracking-wider">
          {title}
        </span>
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed">
        {description}
      </p>
      <Button variant={variant === "secondary" ? "secondary" : "default"} size="sm">
        {action}
      </Button>
    </div>
  );
}

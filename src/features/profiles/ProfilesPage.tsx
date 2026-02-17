import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FolderOpen,
  Upload,
  Shield,
  ArrowRight,
  Trash2,
  Download,
  Loader2,
  Database,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWizardStore } from "@/stores/wizard-store";
import { useProfileStore } from "@/stores/profile-store";
import { loadProfileFromFile } from "@/lib/profiles";
import { dbGetProfile } from "@/lib/db-commands";
import { save } from "@tauri-apps/plugin-dialog";
import { writeTextFile } from "@tauri-apps/plugin-fs";
import { toast } from "sonner";

export function ProfilesPage() {
  const navigate = useNavigate();
  const { loadFromProfile, setStep } = useWizardStore();
  const { profiles, isLoading, fetchProfiles, deleteProfile } =
    useProfileStore();

  useEffect(() => {
    fetchProfiles();
  }, []);

  const handleImportJson = async () => {
    try {
      const profile = await loadProfileFromFile();
      if (profile) {
        toast.success("Perfil importado desde JSON");
        const { saveProfile } = useProfileStore.getState();
        await saveProfile({
          name: profile.name,
          server: JSON.stringify(profile.server),
          network: JSON.stringify(profile.network),
          serverKeys: JSON.stringify(profile.serverKeys),
          clients: JSON.stringify(profile.clients),
        });
      }
    } catch (e) {
      toast.error(`Error al importar: ${e}`);
    }
  };

  const handleOpenInWizard = async (profileId: string) => {
    try {
      const full = await dbGetProfile(profileId);
      loadFromProfile({
        profileName: full.name,
        server: JSON.parse(full.server),
        network: JSON.parse(full.network),
        serverKeys: JSON.parse(full.serverKeys),
        clients: JSON.parse(full.clients),
      });
      setStep(5);
      navigate("/wireguard");
    } catch (e) {
      toast.error(`Error al abrir perfil: ${e}`);
    }
  };

  const handleExportJson = async (profileId: string, profileName: string) => {
    try {
      const full = await dbGetProfile(profileId);
      const filePath = await save({
        title: "Exportar Perfil WireGuard",
        defaultPath: `${profileName}-perfil.json`,
        filters: [{ name: "JSON", extensions: ["json"] }],
      });
      if (!filePath) return;

      const exportData = {
        name: full.name,
        createdAt: full.createdAt,
        server: JSON.parse(full.server),
        network: JSON.parse(full.network),
        serverKeys: JSON.parse(full.serverKeys),
        clients: JSON.parse(full.clients),
      };

      await writeTextFile(filePath, JSON.stringify(exportData, null, 2));
      toast.success("Perfil exportado como JSON");
    } catch (e) {
      toast.error(`Error al exportar: ${e}`);
    }
  };

  return (
    <div className="min-h-full">
      {/* Page header */}
      <div className="border-b border-border px-8 py-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Database className="w-4 h-4 text-primary" />
            <div>
              <h1 className="text-lg font-semibold uppercase tracking-wider">
                Perfiles Guardados
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5 font-mono">
                {profiles.length} perfil{profiles.length !== 1 ? "es" : ""} en base de datos
              </p>
            </div>
          </div>
          <Button onClick={handleImportJson} variant="outline" size="sm">
            <Upload className="w-3.5 h-3.5 mr-1.5" />
            Importar JSON
          </Button>
        </div>
      </div>

      <div className="px-8 py-6 max-w-4xl mx-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : profiles.length > 0 ? (
          <div className="border border-border divide-y divide-border">
            {profiles.map((p) => (
              <div key={p.id} className="flex items-center justify-between px-5 py-3.5 hover:bg-accent/30 transition-colors">
                <div className="flex items-center gap-4 min-w-0">
                  <Shield className="w-3.5 h-3.5 text-primary shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{p.name}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="font-mono">{p.serverAddress}</span>
                      <span className="font-mono">
                        {p.clientCount} cliente{p.clientCount !== 1 ? "s" : ""}
                      </span>
                      <span className="font-mono">
                        {new Date(p.updatedAt).toLocaleDateString("es-MX")}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleOpenInWizard(p.id)}
                    title="Abrir en Asistente"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleExportJson(p.id, p.name)}
                    title="Exportar JSON"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteProfile(p.id)}
                    title="Eliminar"
                    className="text-primary hover:text-primary"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <FolderOpen className="w-12 h-12 text-muted-foreground/20 mb-4" />
            <h2 className="text-sm font-mono font-medium uppercase tracking-wider text-muted-foreground mb-2">
              No hay perfiles guardados
            </h2>
            <p className="text-xs text-muted-foreground/70 max-w-sm mb-6 leading-relaxed">
              Completa el asistente WireGuard y guarda tu configuración, o importa
              un perfil JSON existente.
            </p>
            <Button variant="outline" size="sm" onClick={handleImportJson}>
              <Upload className="w-3.5 h-3.5 mr-1.5" />
              Importar Perfil JSON
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

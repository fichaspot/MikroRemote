import { useState } from "react";
import { Shield, Upload } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useWizardStore } from "@/stores/wizard-store";
import { open } from "@tauri-apps/plugin-dialog";
import { readTextFile } from "@tauri-apps/plugin-fs";
import { toast } from "sonner";

export function Step1Start() {
  const { profileName, setProfileName, nextStep, loadFromProfile, setStep } =
    useWizardStore();
  const [name, setName] = useState(profileName || "");

  const handleNewProfile = () => {
    if (!name.trim()) {
      toast.error("Ingresa un nombre para el perfil");
      return;
    }
    setProfileName(name.trim());
    nextStep();
  };

  const handleImport = async () => {
    try {
      const filePath = await open({
        title: "Importar Perfil WireGuard",
        filters: [{ name: "JSON", extensions: ["json"] }],
      });
      if (!filePath) return;

      const content = await readTextFile(filePath);
      const data = JSON.parse(content);

      if (!data.server || !data.network || !data.clients) {
        toast.error("Formato de perfil inválido");
        return;
      }

      loadFromProfile({
        profileName: data.name || data.profileName || "Importado",
        server: data.server,
        network: data.network,
        serverKeys: data.serverKeys || { privateKey: "", publicKey: "", imported: false },
        clients: data.clients,
      });

      toast.success("Perfil importado correctamente");
      setStep(5); // Ir al Resumen
    } catch (e) {
      toast.error(`Error al importar: ${e}`);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Configuración WireGuard</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Crea una nueva configuración VPN o importa un perfil existente.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Nuevo Perfil */}
        <Card className="border-2 hover:border-primary/50 transition-colors">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Shield className="w-5 h-5 text-primary" />
              Nuevo Perfil
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="profile-name">Nombre del Perfil</Label>
              <Input
                id="profile-name"
                placeholder="Ej: VPN Oficina, Sitio Cliente A"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleNewProfile()}
              />
            </div>
            <Button onClick={handleNewProfile} className="w-full">
              Iniciar Configuración
            </Button>
          </CardContent>
        </Card>

        {/* Importar Perfil */}
        <Card className="border-2 hover:border-primary/50 transition-colors">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Upload className="w-5 h-5 text-primary" />
              Importar Perfil
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Carga un perfil .json guardado previamente para revisar o
              re-exportar tus configuraciones WireGuard.
            </p>
            <Button variant="secondary" onClick={handleImport} className="w-full">
              Seleccionar Archivo JSON
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

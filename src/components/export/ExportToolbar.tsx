import { Download, Copy, Save, Plus, Check, Send, Database } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useWizardStore } from "@/stores/wizard-store";
import { useProfileStore } from "@/stores/profile-store";
import { downloadConfigsAsZip } from "@/lib/export";
import { toast } from "sonner";
import { save } from "@tauri-apps/plugin-dialog";
import { writeTextFile } from "@tauri-apps/plugin-fs";
import { DeployDialog } from "./DeployDialog";

export function ExportToolbar() {
  const { server, network, serverKeys, clients, generatedConfigs, reset } =
    useWizardStore();
  const [copiedServer, setCopiedServer] = useState(false);
  const [deployOpen, setDeployOpen] = useState(false);

  const handleDownloadZip = async () => {
    if (!generatedConfigs) return;
    try {
      await downloadConfigsAsZip(generatedConfigs, server);
      toast.success("ZIP descargado");
    } catch (e) {
      toast.error(`Error al descargar: ${e}`);
    }
  };

  const handleCopyServerScript = async () => {
    if (!generatedConfigs) return;
    await navigator.clipboard.writeText(generatedConfigs.serverRsc);
    setCopiedServer(true);
    setTimeout(() => setCopiedServer(false), 1500);
    toast.success("Script del servidor copiado al portapapeles");
  };

  const handleSaveProfile = async () => {
    try {
      const filePath = await save({
        title: "Guardar Perfil WireGuard",
        defaultPath: `${server.interfaceName || "wireguard"}-perfil.json`,
        filters: [{ name: "JSON", extensions: ["json"] }],
      });
      if (!filePath) return;

      const profile = {
        name: server.interfaceName,
        createdAt: new Date().toISOString(),
        server,
        network,
        serverKeys,
        clients,
      };

      await writeTextFile(filePath, JSON.stringify(profile, null, 2));
      toast.success("Perfil guardado");
    } catch (e) {
      toast.error(`Error al guardar: ${e}`);
    }
  };

  const handleSaveToDb = async () => {
    const { saveProfile } = useProfileStore.getState();
    await saveProfile({
      name: server.interfaceName || "Sin nombre",
      server: JSON.stringify(server),
      network: JSON.stringify(network),
      serverKeys: JSON.stringify(serverKeys),
      clients: JSON.stringify(clients),
    });
  };

  const handleNewConfig = () => {
    reset();
  };

  return (
    <>
      <div className="flex flex-wrap gap-2">
        <Button onClick={handleDownloadZip} disabled={!generatedConfigs}>
          <Download className="w-4 h-4 mr-1.5" />
          Descargar ZIP
        </Button>
        <Button
          variant="secondary"
          onClick={handleCopyServerScript}
          disabled={!generatedConfigs}
        >
          {copiedServer ? (
            <Check className="w-4 h-4 mr-1.5 text-primary" />
          ) : (
            <Copy className="w-4 h-4 mr-1.5" />
          )}
          Copiar Script Servidor
        </Button>
        <Button
          variant="secondary"
          onClick={() => setDeployOpen(true)}
          disabled={!generatedConfigs}
        >
          <Send className="w-4 h-4 mr-1.5" />
          Enviar al Router
        </Button>
        <Button variant="secondary" onClick={handleSaveProfile}>
          <Save className="w-4 h-4 mr-1.5" />
          Guardar JSON
        </Button>
        <Button variant="secondary" onClick={handleSaveToDb}>
          <Database className="w-4 h-4 mr-1.5" />
          Guardar en BD
        </Button>
        <Button variant="secondary" onClick={handleNewConfig}>
          <Plus className="w-4 h-4 mr-1.5" />
          Nueva Configuración
        </Button>
      </div>
      {generatedConfigs && (
        <DeployDialog
          open={deployOpen}
          onOpenChange={setDeployOpen}
          script={generatedConfigs.serverRsc}
          scriptLabel="Script del servidor WireGuard"
        />
      )}
    </>
  );
}

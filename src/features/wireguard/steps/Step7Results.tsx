import { useState } from "react";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ConfigPreview } from "@/components/config/ConfigPreview";
import { QRCodeCard } from "@/components/export/QRCodeCard";
import { ExportToolbar } from "@/components/export/ExportToolbar";
import { useWizardStore } from "@/stores/wizard-store";

export function Step7Results() {
  const { generatedConfigs, prevStep } = useWizardStore();
  const [selectedClient, setSelectedClient] = useState(0);

  if (!generatedConfigs) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">
          No se generaron configuraciones. Regresa al paso de Resumen.
        </p>
        <Button variant="secondary" onClick={prevStep} className="mt-4">
          Regresar
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Banner de Éxito */}
      <div className="flex items-center gap-3 p-4 rounded-lg bg-primary/10 border border-primary/20">
        <CheckCircle className="w-6 h-6 text-primary shrink-0" />
        <div>
          <p className="font-semibold text-primary">
            Configuraciones Generadas Exitosamente
          </p>
          <p className="text-sm text-muted-foreground">
            {generatedConfigs.clientConfs.length} configs de clientes + scripts
            del servidor listos para exportar.
          </p>
        </div>
      </div>

      {/* Barra de Exportación */}
      <ExportToolbar />

      {/* Pestañas de Configuración */}
      <Tabs defaultValue="server" className="w-full">
        <TabsList>
          <TabsTrigger value="server">Script del Servidor</TabsTrigger>
          <TabsTrigger value="clients">Configs de Clientes</TabsTrigger>
          <TabsTrigger value="qr">Códigos QR</TabsTrigger>
          <TabsTrigger value="mkt">Cliente MikroTik</TabsTrigger>
        </TabsList>

        <TabsContent value="server" className="space-y-4">
          <ConfigPreview
            code={generatedConfigs.serverRsc}
            title="Configuración del Servidor (.rsc)"
          />
          <ConfigPreview
            code={generatedConfigs.peerRsc}
            title="Solo Peers (.rsc)"
          />
        </TabsContent>

        <TabsContent value="clients" className="space-y-4">
          {/* Selector de Cliente */}
          <div className="flex flex-wrap gap-2">
            {generatedConfigs.clientConfs.map((conf, idx) => (
              <Button
                key={conf.name}
                variant={idx === selectedClient ? "default" : "secondary"}
                size="sm"
                onClick={() => setSelectedClient(idx)}
              >
                {conf.name}
              </Button>
            ))}
          </div>
          {generatedConfigs.clientConfs[selectedClient] && (
            <ConfigPreview
              code={generatedConfigs.clientConfs[selectedClient].content}
              title={`${generatedConfigs.clientConfs[selectedClient].name}.conf`}
            />
          )}
        </TabsContent>

        <TabsContent value="qr">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {generatedConfigs.clientConfs.map((conf) => (
              <QRCodeCard
                key={conf.name}
                clientName={conf.name}
                configContent={conf.content}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="mkt">
          <ConfigPreview
            code={generatedConfigs.mikrotikClientRsc}
            title="MikroTik como Cliente WireGuard (.rsc)"
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

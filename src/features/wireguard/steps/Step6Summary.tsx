import { useState } from "react";
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ConfigPreview } from "@/components/config/ConfigPreview";
import { useWizardStore } from "@/stores/wizard-store";
import { generateAllConfigs } from "@/lib/config-generators";
import { toast } from "sonner";

export function Step6Summary() {
  const {
    profileName,
    server,
    network,
    serverKeys,
    clients,
    setGeneratedConfigs,
    nextStep,
    prevStep,
  } = useWizardStore();

  const [generating, setGenerating] = useState(false);
  const [previewConfigs, setPreviewConfigs] = useState<ReturnType<
    typeof generateAllConfigs
  > | null>(null);

  // Verificaciones de validación
  const issues: string[] = [];
  if (!server.address) issues.push("Falta la dirección del servidor");
  if (!server.listenPort) issues.push("Falta el puerto de escucha");
  if (!serverKeys.privateKey || !serverKeys.publicKey)
    issues.push("Las llaves del servidor no están configuradas");
  if (clients.length === 0) issues.push("No hay clientes configurados");

  const handlePreview = () => {
    const configs = generateAllConfigs(server, network, serverKeys, clients);
    setPreviewConfigs(configs);
  };

  const handleGenerate = async () => {
    if (issues.length > 0) {
      toast.error("Corrige los problemas de validación antes de generar");
      return;
    }
    setGenerating(true);
    try {
      const configs = generateAllConfigs(server, network, serverKeys, clients);
      setGeneratedConfigs(configs);
      toast.success("Configuraciones generadas exitosamente");
      nextStep();
    } catch (e) {
      toast.error(`Error al generar: ${e}`);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Resumen de Configuración</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Revisa todos los ajustes antes de generar las configuraciones finales.
        </p>
      </div>

      {/* Validación */}
      {issues.length > 0 && (
        <Card className="border-destructive/50">
          <CardContent className="pt-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-destructive">
                  Problemas encontrados
                </p>
                <ul className="text-xs text-muted-foreground mt-1 space-y-0.5">
                  {issues.map((issue) => (
                    <li key={issue}>- {issue}</li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tarjetas de resumen */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Perfil
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-medium">{profileName || "Sin nombre"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Servidor
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <p className="text-sm font-mono">{server.address}:{server.listenPort}</p>
            <p className="text-xs text-muted-foreground">
              Interfaz: {server.interfaceName}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Red
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <p className="text-sm font-mono">
              {network.subnet}/{network.subnetMask}
            </p>
            <p className="text-xs text-muted-foreground">
              Servidor: {network.serverIp} | Clientes: {clients.length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de clientes */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">
            Clientes ({clients.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {clients.map((c) => (
              <Badge key={c.id} variant="secondary" className="font-mono text-xs">
                {c.name}: {c.ip}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Estado de Llaves del Servidor */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Llaves del Servidor</CardTitle>
        </CardHeader>
        <CardContent>
          {serverKeys.publicKey ? (
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-primary" />
              <span className="text-sm">
                Llave Pública: {serverKeys.publicKey.slice(0, 20)}...
              </span>
              <Badge variant="secondary" className="text-xs">
                {serverKeys.imported ? "Importada" : "Generada"}
              </Badge>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">No configuradas</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Vista Previa de Configs */}
      {!previewConfigs && (
        <Button variant="secondary" onClick={handlePreview} disabled={issues.length > 0}>
          Vista Previa
        </Button>
      )}

      {previewConfigs && (
        <Tabs defaultValue="server" className="w-full">
          <TabsList>
            <TabsTrigger value="server">Servidor .rsc</TabsTrigger>
            <TabsTrigger value="client">Cliente .conf</TabsTrigger>
            <TabsTrigger value="peers">Peers .rsc</TabsTrigger>
            <TabsTrigger value="mkt-client">Cliente MikroTik</TabsTrigger>
          </TabsList>
          <TabsContent value="server">
            <ConfigPreview code={previewConfigs.serverRsc} title="Script del Servidor (.rsc)" />
          </TabsContent>
          <TabsContent value="client">
            {previewConfigs.clientConfs[0] && (
              <ConfigPreview
                code={previewConfigs.clientConfs[0].content}
                title={`${previewConfigs.clientConfs[0].name}.conf`}
              />
            )}
          </TabsContent>
          <TabsContent value="peers">
            <ConfigPreview code={previewConfigs.peerRsc} title="Solo Peers (.rsc)" />
          </TabsContent>
          <TabsContent value="mkt-client">
            <ConfigPreview
              code={previewConfigs.mikrotikClientRsc}
              title="Cliente MikroTik (.rsc)"
            />
          </TabsContent>
        </Tabs>
      )}

      <div className="flex justify-between pt-2">
        <Button variant="secondary" onClick={prevStep}>
          Anterior
        </Button>
        <Button onClick={handleGenerate} disabled={issues.length > 0 || generating}>
          {generating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
              Generando...
            </>
          ) : (
            "Generar Todas las Configs"
          )}
        </Button>
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import { RefreshCw, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { ClientTable } from "@/components/clients/ClientTable";
import { useWizardStore } from "@/stores/wizard-store";
import { useWgKeyGen } from "@/hooks/useWgKeyGen";
import { toast } from "sonner";
import type { WgClientConfig } from "@/types";

function ipBase(ip: string): string {
  return ip.split(".").slice(0, 3).join(".");
}

function parseIpLastOctet(ip: string): number {
  return parseInt(ip.split(".")[3] || "0");
}

export function Step4Clients() {
  const {
    clients,
    setClients,
    updateClient,
    network,
    server,
    nextStep,
    prevStep,
  } = useWizardStore();
  const { generateKeypair, generatePsk } = useWgKeyGen();

  const [defaultDns, setDefaultDns] = useState("1.1.1.1, 8.8.8.8");
  const [defaultAllowedIps, setDefaultAllowedIps] = useState("0.0.0.0/0");
  const [generating, setGenerating] = useState(false);

  // Auto-generar clientes en la primera visita si está vacío
  useEffect(() => {
    if (clients.length === 0 && network.clientCount > 0) {
      generateClients();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const generateClients = async () => {
    setGenerating(true);
    try {
      const base = ipBase(network.clientStartIp);
      const startOctet = parseIpLastOctet(network.clientStartIp);
      const newClients: WgClientConfig[] = [];

      for (let i = 0; i < network.clientCount; i++) {
        const kp = await generateKeypair();
        const psk = await generatePsk();
        if (!kp || !psk) throw new Error("Fallo en la generación de llaves");

        newClients.push({
          id: crypto.randomUUID(),
          name: `Cliente-${i + 1}`,
          ip: `${base}.${startOctet + i}`,
          keys: kp,
          psk,
          dns: defaultDns,
          allowedIps: defaultAllowedIps,
          endpoint: `${server.address}:${server.listenPort}`,
          keepalive: 25,
        });
      }

      setClients(newClients);
      toast.success(`Se generaron ${newClients.length} clientes con llaves`);
    } catch (e) {
      toast.error(`Error al generar clientes: ${e}`);
    } finally {
      setGenerating(false);
    }
  };

  const handleRegenerateAllKeys = async () => {
    setGenerating(true);
    try {
      const updated: WgClientConfig[] = [];
      for (const client of clients) {
        const kp = await generateKeypair();
        const psk = await generatePsk();
        if (!kp || !psk) throw new Error("Fallo en la generación de llaves");
        updated.push({ ...client, keys: kp, psk });
      }
      setClients(updated);
      toast.success("Todas las llaves regeneradas");
    } catch (e) {
      toast.error(`Error: ${e}`);
    } finally {
      setGenerating(false);
    }
  };

  const handleRegenerateSingleKey = async (id: string) => {
    const kp = await generateKeypair();
    const psk = await generatePsk();
    if (kp && psk) {
      updateClient(id, { keys: kp, psk });
      toast.success("Llaves regeneradas");
    }
  };

  const handleRemoveClient = (id: string) => {
    setClients(clients.filter((c) => c.id !== id));
  };

  const handleAddClient = async () => {
    const lastClient = clients[clients.length - 1];
    const lastOctet = lastClient ? parseIpLastOctet(lastClient.ip) + 1 : parseIpLastOctet(network.clientStartIp);
    if (lastOctet > 254) {
      toast.error("No hay más IPs disponibles");
      return;
    }

    const kp = await generateKeypair();
    const psk = await generatePsk();
    if (!kp || !psk) return;

    const base = ipBase(network.clientStartIp);
    const newClient: WgClientConfig = {
      id: crypto.randomUUID(),
      name: `Cliente-${clients.length + 1}`,
      ip: `${base}.${lastOctet}`,
      keys: kp,
      psk,
      dns: defaultDns,
      allowedIps: defaultAllowedIps,
      endpoint: `${server.address}:${server.listenPort}`,
      keepalive: 25,
    };

    setClients([...clients, newClient]);
    toast.success("Cliente agregado");
  };

  const handleApplyDefaults = () => {
    const updated = clients.map((c) => ({
      ...c,
      dns: defaultDns,
      allowedIps: defaultAllowedIps,
      endpoint: `${server.address}:${server.listenPort}`,
    }));
    setClients(updated);
    toast.success("Valores predeterminados aplicados a todos los clientes");
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Configuración de Clientes</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Configura DNS, IPs permitidas y administra los clientes individuales.
        </p>
      </div>

      {/* Valores Predeterminados */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <p className="text-sm font-medium">Configuración Predeterminada</p>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Servidores DNS</Label>
              <Input
                value={defaultDns}
                onChange={(e) => setDefaultDns(e.target.value)}
                placeholder="1.1.1.1, 8.8.8.8"
              />
            </div>
            <div className="space-y-2">
              <Label>IPs Permitidas (CIDR)</Label>
              <Input
                value={defaultAllowedIps}
                onChange={(e) => setDefaultAllowedIps(e.target.value)}
                placeholder="0.0.0.0/0"
              />
            </div>
          </div>
          <Button variant="secondary" size="sm" onClick={handleApplyDefaults}>
            Aplicar a Todos los Clientes
          </Button>
        </CardContent>
      </Card>

      {/* Acciones */}
      <div className="flex items-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={handleRegenerateAllKeys}
          disabled={generating || clients.length === 0}
        >
          <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
          Regenerar Todas las Llaves
        </Button>
        <Button variant="secondary" size="sm" onClick={handleAddClient} disabled={generating}>
          <Plus className="w-3.5 h-3.5 mr-1.5" />
          Agregar Cliente
        </Button>
        {clients.length === 0 && (
          <Button size="sm" onClick={generateClients} disabled={generating}>
            Generar Clientes
          </Button>
        )}
      </div>

      {/* Tabla de Clientes */}
      {generating ? (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="w-5 h-5 animate-spin text-primary mr-2" />
          <span className="text-sm text-muted-foreground">Generando llaves...</span>
        </div>
      ) : clients.length > 0 ? (
        <ClientTable
          clients={clients}
          onUpdateClient={updateClient}
          onRemoveClient={handleRemoveClient}
          onRegenerateKeys={handleRegenerateSingleKey}
        />
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          No hay clientes configurados. Haz clic en "Generar Clientes" para comenzar.
        </div>
      )}

      <div className="flex justify-between pt-2">
        <Button variant="secondary" onClick={prevStep}>
          Anterior
        </Button>
        <Button onClick={nextStep} disabled={clients.length === 0}>
          Siguiente
        </Button>
      </div>
    </div>
  );
}

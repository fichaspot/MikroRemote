import { useState } from "react";
import { Copy, Check, RefreshCw, Pencil, Trash2, Plus, X, Network } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { KeyPairDisplay } from "@/components/crypto/KeyPairDisplay";
import type { WgClientConfig } from "@/types";

interface ClientTableProps {
  clients: WgClientConfig[];
  onUpdateClient: (id: string, data: Partial<WgClientConfig>) => void;
  onRemoveClient: (id: string) => void;
  onRegenerateKeys: (id: string) => void;
}

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <button onClick={handleCopy} className="text-muted-foreground hover:text-foreground">
      {copied ? <Check className="w-3 h-3 text-primary" /> : <Copy className="w-3 h-3" />}
    </button>
  );
}

const CIDR_REGEX = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\/\d{1,2}$/;

function LanSegmentsEditor({
  segments,
  onChange,
}: {
  segments: string[];
  onChange: (segments: string[]) => void;
}) {
  const [input, setInput] = useState("");
  const [error, setError] = useState("");

  const addSegment = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    if (!CIDR_REGEX.test(trimmed)) {
      setError("Formato inválido. Usa notación CIDR (ej: 192.168.1.0/24)");
      return;
    }
    if (segments.includes(trimmed)) {
      setError("Este segmento ya existe");
      return;
    }
    setError("");
    setInput("");
    onChange([...segments, trimmed]);
  };

  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-1.5">
        <Network className="w-3.5 h-3.5" />
        Segmentos LAN
      </Label>
      <p className="text-xs text-muted-foreground">
        Subredes LAN detrás de este cliente (solo para routers MikroTik).
        Escribe la red en notación CIDR y presiona <kbd className="px-1 py-0.5 bg-muted rounded text-[10px] font-mono">Enter</kbd> o
        el botón <kbd className="px-1 py-0.5 bg-muted rounded text-[10px] font-mono">+</kbd> para agregar.
        Haz clic en la <kbd className="px-1 py-0.5 bg-muted rounded text-[10px] font-mono">x</kbd> de cada tag para eliminarlo.
        Se agregarán a <code className="text-primary/80">allowed-address</code> del peer y como rutas estáticas en el servidor.
      </p>
      {segments.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {segments.map((seg) => (
            <span
              key={seg}
              className="inline-flex items-center gap-1 bg-muted text-sm font-mono px-2 py-0.5 rounded"
            >
              {seg}
              <button
                onClick={() => onChange(segments.filter((s) => s !== seg))}
                className="text-muted-foreground hover:text-destructive"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}
      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setError("");
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addSegment();
            }
          }}
          placeholder="192.168.1.0/24"
          className="font-mono text-sm"
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="shrink-0"
          onClick={addSegment}
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

export function ClientTable({
  clients,
  onUpdateClient,
  onRemoveClient,
  onRegenerateKeys,
}: ClientTableProps) {
  const [editClient, setEditClient] = useState<WgClientConfig | null>(null);

  return (
    <>
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/50 border-b">
              <th className="p-3 text-left font-medium text-muted-foreground w-10">#</th>
              <th className="p-3 text-left font-medium text-muted-foreground">Nombre</th>
              <th className="p-3 text-left font-medium text-muted-foreground">Dirección IP</th>
              <th className="p-3 text-left font-medium text-muted-foreground">Llave Pública</th>
              <th className="p-3 text-right font-medium text-muted-foreground w-28">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((client, idx) => (
              <tr key={client.id} className="border-b last:border-0 hover:bg-muted/30">
                <td className="p-3 text-muted-foreground">{idx + 1}</td>
                <td className="p-3">
                  <Input
                    value={client.name}
                    onChange={(e) =>
                      onUpdateClient(client.id, { name: e.target.value })
                    }
                    className="h-7 text-sm bg-transparent border-0 p-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                  />
                </td>
                <td className="p-3 font-mono text-xs">
                  <div className="flex items-center gap-1.5">
                    {client.ip}
                    {client.lanSegments && client.lanSegments.length > 0 && (
                      <span
                        className="inline-flex items-center gap-0.5 text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-sans"
                        title={client.lanSegments.join(", ")}
                      >
                        <Network className="w-3 h-3" />
                        {client.lanSegments.length}
                      </span>
                    )}
                  </div>
                </td>
                <td className="p-3">
                  <div className="flex items-center gap-1.5">
                    <code className="text-xs font-mono text-muted-foreground truncate max-w-[180px]">
                      {client.keys.publicKey}
                    </code>
                    <CopyButton value={client.keys.publicKey} />
                  </div>
                </td>
                <td className="p-3">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => setEditClient(client)}
                      title="Editar"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => onRegenerateKeys(client.id)}
                      title="Regenerar llaves"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive hover:text-destructive"
                      onClick={() => onRemoveClient(client.id)}
                      title="Eliminar"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Diálogo de Edición */}
      <Dialog open={!!editClient} onOpenChange={() => setEditClient(null)}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto" onClose={() => setEditClient(null)}>
          <DialogHeader>
            <DialogTitle>Editar Cliente: {editClient?.name}</DialogTitle>
          </DialogHeader>
          {editClient && (
            <div className="space-y-4 pt-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nombre</Label>
                  <Input
                    value={editClient.name}
                    onChange={(e) => {
                      const updated = { ...editClient, name: e.target.value };
                      setEditClient(updated);
                      onUpdateClient(editClient.id, { name: e.target.value });
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Dirección IP</Label>
                  <Input value={editClient.ip} disabled className="opacity-60" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>DNS</Label>
                  <Input
                    value={editClient.dns}
                    onChange={(e) => {
                      const updated = { ...editClient, dns: e.target.value };
                      setEditClient(updated);
                      onUpdateClient(editClient.id, { dns: e.target.value });
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label>IPs Permitidas</Label>
                  <Input
                    value={editClient.allowedIps}
                    onChange={(e) => {
                      const updated = { ...editClient, allowedIps: e.target.value };
                      setEditClient(updated);
                      onUpdateClient(editClient.id, { allowedIps: e.target.value });
                    }}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Keepalive (segundos)</Label>
                <Input
                  type="number"
                  value={editClient.keepalive}
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 0;
                    const updated = { ...editClient, keepalive: val };
                    setEditClient(updated);
                    onUpdateClient(editClient.id, { keepalive: val });
                  }}
                />
              </div>
              <LanSegmentsEditor
                segments={editClient.lanSegments ?? []}
                onChange={(segments) => {
                  const updated = { ...editClient, lanSegments: segments };
                  setEditClient(updated);
                  onUpdateClient(editClient.id, { lanSegments: segments });
                }}
              />
              <KeyPairDisplay
                label="Llaves"
                privateKey={editClient.keys.privateKey}
                publicKey={editClient.keys.publicKey}
                psk={editClient.psk}
              />
              <DialogFooter>
                <Button variant="secondary" onClick={() => setEditClient(null)}>
                  Cerrar
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

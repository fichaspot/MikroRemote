import { useState } from "react";
import { Copy, Check, RefreshCw, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
                <td className="p-3 font-mono text-xs">{client.ip}</td>
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
        <DialogContent className="max-w-lg">
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
              <KeyPairDisplay
                label="Llaves"
                privateKey={editClient.keys.privateKey}
                publicKey={editClient.keys.publicKey}
                psk={editClient.psk}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

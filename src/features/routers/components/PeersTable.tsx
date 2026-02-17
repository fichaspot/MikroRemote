import { useState } from "react";
import { RefreshCw, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import type { WgPeer } from "@/types";

interface PeersTableProps {
  peers: WgPeer[];
  onRefresh: () => void;
  onRemove: (peerId: string) => void;
  isLoading?: boolean;
}

export function PeersTable({
  peers,
  onRefresh,
  onRemove,
  isLoading,
}: PeersTableProps) {
  const [removingId, setRemovingId] = useState<string | null>(null);

  const handleRemove = async (peerId: string) => {
    setRemovingId(peerId);
    await onRemove(peerId);
    setRemovingId(null);
  };

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle>Peers WireGuard</CardTitle>
          <CardDescription>
            {peers.length} peer{peers.length !== 1 ? "s" : ""} configurado
            {peers.length !== 1 ? "s" : ""} en el router
          </CardDescription>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={isLoading}
        >
          <RefreshCw
            className={`w-4 h-4 mr-1.5 ${isLoading ? "animate-spin" : ""}`}
          />
          Actualizar
        </Button>
      </CardHeader>
      <CardContent>
        {peers.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            No hay peers WireGuard configurados en el router.
          </div>
        ) : (
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50 border-b">
                  <th className="p-3 text-left font-medium text-muted-foreground">
                    Interfaz
                  </th>
                  <th className="p-3 text-left font-medium text-muted-foreground">
                    Llave Pública
                  </th>
                  <th className="p-3 text-left font-medium text-muted-foreground">
                    IP Permitida
                  </th>
                  <th className="p-3 text-left font-medium text-muted-foreground">
                    Endpoint
                  </th>
                  <th className="p-3 text-left font-medium text-muted-foreground">
                    Estado
                  </th>
                  <th className="p-3 text-left font-medium text-muted-foreground">
                    Comentario
                  </th>
                  <th className="p-3 text-right font-medium text-muted-foreground w-20">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {peers.map((peer) => (
                  <tr
                    key={peer.id}
                    className="border-b last:border-0 hover:bg-muted/30"
                  >
                    <td className="p-3 font-mono text-xs">{peer.interface}</td>
                    <td className="p-3">
                      <code className="text-xs font-mono text-muted-foreground truncate max-w-[140px] block">
                        {peer.publicKey.slice(0, 20)}...
                      </code>
                    </td>
                    <td className="p-3 font-mono text-xs">
                      {peer.allowedAddress || "—"}
                    </td>
                    <td className="p-3 font-mono text-xs">
                      {peer.currentEndpointAddress
                        ? `${peer.currentEndpointAddress}:${peer.currentEndpointPort}`
                        : "—"}
                    </td>
                    <td className="p-3">
                      {peer.disabled ? (
                        <Badge
                          variant="secondary"
                          className="text-xs"
                        >
                          Deshabilitado
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="text-xs text-primary border-primary/30"
                        >
                          Activo
                        </Badge>
                      )}
                    </td>
                    <td className="p-3 text-xs text-muted-foreground">
                      {peer.comment || "—"}
                    </td>
                    <td className="p-3">
                      <div className="flex justify-end">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive hover:text-destructive"
                          onClick={() => handleRemove(peer.id)}
                          disabled={removingId === peer.id}
                          title="Eliminar peer"
                        >
                          {removingId === peer.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="w-3.5 h-3.5" />
                          )}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

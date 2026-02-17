import { useEffect, useState } from "react";
import { Server, Save, Trash2, Plug } from "lucide-react";
import { useRouterConnection } from "@/hooks/useRouterConnection";
import { useRouterStore } from "@/stores/router-store";
import { ConnectionForm } from "./components/ConnectionForm";
import { RouterInfoCard } from "./components/RouterInfoCard";
import { PeersTable } from "./components/PeersTable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { SavedRouter } from "@/types";

export function RoutersPage() {
  const {
    isConnected,
    isConnecting,
    info,
    peers,
    error,
    connect,
    disconnect,
    fetchPeers,
    removePeer,
  } = useRouterConnection();

  const {
    savedRouters,
    fetchSavedRouters,
    saveRouter,
    deleteSavedRouter,
    credentials,
  } = useRouterStore();

  const [selectedRouter, setSelectedRouter] = useState<SavedRouter | null>(
    null
  );

  useEffect(() => {
    fetchSavedRouters();
  }, []);

  useEffect(() => {
    if (isConnected) {
      fetchPeers();
    }
  }, [isConnected]);

  const handleSaveCurrentRouter = async () => {
    if (!credentials || !info) return;
    await saveRouter({
      name: info.identity || `${credentials.host}:${credentials.port}`,
      host: credentials.host,
      port: credentials.port,
      username: credentials.username,
      password: credentials.password,
    });
  };

  const handleConnectSaved = (router: SavedRouter) => {
    setSelectedRouter(router);
    connect({
      host: router.host,
      port: router.port,
      username: router.username,
      password: router.password,
      savedRouterId: router.id,
    });
  };

  const defaultValues = selectedRouter
    ? {
        host: selectedRouter.host,
        port: selectedRouter.port,
        username: selectedRouter.username,
        password: selectedRouter.password,
      }
    : undefined;

  return (
    <div className="min-h-full">
      {/* Page header */}
      <div className="border-b border-border px-8 py-6">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <Server className="w-4 h-4 text-primary" />
          <div>
            <h1 className="text-lg font-semibold uppercase tracking-wider">Routers</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Conecta a tu router MikroTik para administrar WireGuard directamente.
            </p>
          </div>
        </div>
      </div>

      <div className="px-8 py-6 max-w-4xl mx-auto space-y-6">
        {!isConnected ? (
          <>
            {/* Saved Routers */}
            {savedRouters.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-primary" />
                  <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground">
                    Routers Guardados
                  </span>
                </div>
                <div className="border border-border divide-y divide-border">
                  {savedRouters.map((r) => (
                    <div key={r.id} className="flex items-center justify-between px-5 py-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <Server className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">
                            {r.name}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span className="font-mono">
                              {r.host}:{r.port}
                            </span>
                            {r.lastIdentity && (
                              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                                {r.lastIdentity}
                              </Badge>
                            )}
                            {r.lastVersion && (
                              <span className="font-mono">v{r.lastVersion}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <Button
                          size="sm"
                          onClick={() => handleConnectSaved(r)}
                          disabled={isConnecting}
                        >
                          <Plug className="w-3.5 h-3.5 mr-1" />
                          Conectar
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteSavedRouter(r.id)}
                          className="text-primary hover:text-primary"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <ConnectionForm
              onConnect={connect}
              isConnecting={isConnecting}
              error={error}
              defaultValues={defaultValues}
            />
          </>
        ) : (
          <>
            {info && (
              <RouterInfoCard info={info} onDisconnect={disconnect} />
            )}
            {credentials && (
              <Button
                variant="secondary"
                size="sm"
                onClick={handleSaveCurrentRouter}
              >
                <Save className="w-4 h-4 mr-1.5" />
                Guardar Router
              </Button>
            )}
            <PeersTable
              peers={peers}
              onRefresh={fetchPeers}
              onRemove={removePeer}
            />
          </>
        )}
      </div>
    </div>
  );
}

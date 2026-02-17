import { useCallback } from "react";
import { toast } from "sonner";
import { useRouterStore } from "@/stores/router-store";
import {
  routerConnect,
  routerDisconnect,
  routerListWgPeers,
  routerRemoveWgPeer,
  routerDeployScript,
} from "@/lib/router-commands";
import { dbUpdateRouterInfo } from "@/lib/db-commands";
import type { RouterCredentials } from "@/types";

export function useRouterConnection() {
  const store = useRouterStore();

  const connect = useCallback(
    async (credentials: RouterCredentials & { savedRouterId?: string }) => {
      store.setConnecting(true);
      store.setError(null);
      try {
        const info = await routerConnect(
          credentials.host,
          credentials.port,
          credentials.username,
          credentials.password
        );
        store.setInfo(info);
        store.setCredentials(credentials);
        store.setConnected(true);
        toast.success(`Conectado a ${info.identity}`);

        // Update saved router info if connecting from a saved router
        if (credentials.savedRouterId) {
          dbUpdateRouterInfo(
            credentials.savedRouterId,
            info.identity,
            info.version
          ).catch(() => {});
        }
      } catch (e) {
        const msg = String(e);
        store.setError(msg);
        toast.error(msg);
      } finally {
        store.setConnecting(false);
      }
    },
    [store]
  );

  const disconnect = useCallback(async () => {
    try {
      await routerDisconnect();
      store.reset();
      toast.success("Desconectado del router");
    } catch (e) {
      toast.error(String(e));
    }
  }, [store]);

  const fetchPeers = useCallback(async () => {
    try {
      const peers = await routerListWgPeers();
      store.setPeers(peers);
    } catch (e) {
      toast.error(String(e));
    }
  }, [store]);

  const removePeer = useCallback(
    async (peerId: string) => {
      try {
        await routerRemoveWgPeer(peerId);
        toast.success("Peer eliminado");
        await fetchPeers();
      } catch (e) {
        toast.error(String(e));
      }
    },
    [fetchPeers, store]
  );

  const deployScript = useCallback(
    async (script: string) => {
      store.setDeploying(true);
      try {
        const result = await routerDeployScript(script);
        if (result.success) {
          toast.success(result.message);
        } else {
          toast.error(result.message);
        }
        return result;
      } catch (e) {
        const msg = String(e);
        toast.error(msg);
        return { success: false, message: msg };
      } finally {
        store.setDeploying(false);
      }
    },
    [store]
  );

  return {
    ...store,
    connect,
    disconnect,
    fetchPeers,
    removePeer,
    deployScript,
  };
}

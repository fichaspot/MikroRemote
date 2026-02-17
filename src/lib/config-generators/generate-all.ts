import type {
  WgServerConfig,
  WgNetworkConfig,
  WgServerKeys,
  WgClientConfig,
  GeneratedConfigs,
} from "@/types";
import { generateServerRsc } from "./server-rsc";
import { generateClientConf } from "./client-conf";
import { generatePeerRsc } from "./peer-rsc";
import { generateMikrotikClientRsc } from "./mikrotik-client-rsc";

export function generateAllConfigs(
  server: WgServerConfig,
  network: WgNetworkConfig,
  serverKeys: WgServerKeys,
  clients: WgClientConfig[]
): GeneratedConfigs {
  const serverRsc = generateServerRsc(server, network, serverKeys, clients);
  const peerRsc = generatePeerRsc(server, clients);

  const clientConfs = clients.map((client) => ({
    name: client.name,
    content: generateClientConf(client, serverKeys, network),
  }));

  // Generate MikroTik client .rsc for the first client as example
  const mikrotikClientRsc =
    clients.length > 0
      ? generateMikrotikClientRsc(clients[0], serverKeys, network)
      : "";

  return {
    serverRsc,
    clientConfs,
    peerRsc,
    mikrotikClientRsc,
  };
}

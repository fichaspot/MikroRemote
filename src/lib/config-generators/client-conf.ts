import type { WgClientConfig, WgServerKeys, WgNetworkConfig } from "@/types";

export function generateClientConf(
  client: WgClientConfig,
  serverKeys: WgServerKeys,
  network: WgNetworkConfig
): string {
  const lines: string[] = [];

  lines.push(`[Interface]`);
  lines.push(`PrivateKey = ${client.keys.privateKey}`);
  lines.push(`Address = ${client.ip}/${network.subnetMask}`);
  lines.push(`DNS = ${client.dns}`);
  lines.push(``);
  lines.push(`[Peer]`);
  lines.push(`PublicKey = ${serverKeys.publicKey}`);
  lines.push(`PresharedKey = ${client.psk}`);
  lines.push(`Endpoint = ${client.endpoint}`);
  lines.push(`AllowedIPs = ${client.allowedIps}`);
  lines.push(`PersistentKeepalive = ${client.keepalive}`);

  return lines.join("\n");
}

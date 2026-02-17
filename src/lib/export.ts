import JSZip from "jszip";
import { saveAs } from "file-saver";
import type { GeneratedConfigs, WgServerConfig } from "@/types";

export async function downloadConfigsAsZip(
  configs: GeneratedConfigs,
  server: WgServerConfig
): Promise<void> {
  const zip = new JSZip();
  const folderName = `wireguard-${server.interfaceName}`;
  const folder = zip.folder(folderName)!;

  folder.file(`${server.interfaceName}-server.rsc`, configs.serverRsc);
  folder.file(`${server.interfaceName}-peers.rsc`, configs.peerRsc);

  if (configs.mikrotikClientRsc) {
    folder.file(
      `${server.interfaceName}-mikrotik-client.rsc`,
      configs.mikrotikClientRsc
    );
  }

  const clientsFolder = folder.folder("clients")!;
  for (const client of configs.clientConfs) {
    clientsFolder.file(`${client.name}.conf`, client.content);
  }

  const blob = await zip.generateAsync({ type: "blob" });
  saveAs(blob, `${folderName}.zip`);
}

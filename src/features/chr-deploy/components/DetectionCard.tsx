import { Cpu, HardDrive, Network, Globe, Server } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { VpsDetection } from "@/types";

interface DetectionCardProps {
  detection: VpsDetection;
}

export function DetectionCard({ detection }: DetectionCardProps) {
  const items = [
    { icon: Cpu, label: "Arquitectura", value: detection.arch },
    { icon: Server, label: "Modo Boot", value: detection.bootMode },
    { icon: HardDrive, label: "Disco", value: `/dev/${detection.storage}` },
    { icon: Network, label: "Interfaz", value: detection.eth },
    { icon: Globe, label: "Dirección IP", value: detection.address },
    { icon: Globe, label: "Gateway", value: detection.gateway },
    { icon: Globe, label: "DNS", value: detection.dns },
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Server className="w-5 h-5 text-primary" />
          Información del VPS
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <Icon className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    {item.label}
                  </span>
                </div>
                <Badge variant="secondary" className="font-mono text-xs">
                  {item.value || "N/A"}
                </Badge>
              </div>
            );
          })}
        </div>
        <div className="mt-3 pt-3 border-t border-border">
          <p className="text-xs text-muted-foreground mb-1">URL de imagen</p>
          <p className="text-xs font-mono text-foreground break-all">
            {detection.imgUrl}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

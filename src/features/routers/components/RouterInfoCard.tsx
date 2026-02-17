import {
  Server,
  Cpu,
  HardDrive,
  Clock,
  Unplug,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import type { RouterInfo } from "@/types";

interface RouterInfoCardProps {
  info: RouterInfo;
  onDisconnect: () => void;
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 py-2">
      <Icon className="w-4 h-4 text-muted-foreground shrink-0" />
      <span className="text-sm text-muted-foreground w-28">{label}</span>
      <span className="text-sm font-medium">{value || "—"}</span>
    </div>
  );
}

function formatBytes(bytes: string): string {
  const n = parseInt(bytes);
  if (isNaN(n)) return bytes;
  if (n < 1024) return `${n} B`;
  if (n < 1048576) return `${(n / 1024).toFixed(1)} KB`;
  if (n < 1073741824) return `${(n / 1048576).toFixed(1)} MB`;
  return `${(n / 1073741824).toFixed(1)} GB`;
}

export function RouterInfoCard({ info, onDisconnect }: RouterInfoCardProps) {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <div className="flex items-center gap-3">
          <Server className="w-5 h-5 text-primary" />
          <div>
            <CardTitle>{info.identity}</CardTitle>
            <p className="text-sm text-muted-foreground mt-0.5">
              {info.boardName} — RouterOS {info.version}
            </p>
          </div>
          <Badge variant="outline" className="text-primary border-primary/30">
            Conectado
          </Badge>
        </div>
        <Button variant="outline" size="sm" onClick={onDisconnect}>
          <Unplug className="w-4 h-4 mr-1.5" />
          Desconectar
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-x-8">
          <InfoRow icon={Server} label="Arquitectura" value={info.architecture} />
          <InfoRow icon={Clock} label="Uptime" value={info.uptime} />
          <InfoRow icon={Cpu} label="CPU" value={`${info.cpuLoad}%`} />
          <InfoRow
            icon={HardDrive}
            label="Memoria"
            value={`${formatBytes(info.freeMemory)} libre / ${formatBytes(info.totalMemory)} total`}
          />
        </div>
      </CardContent>
    </Card>
  );
}

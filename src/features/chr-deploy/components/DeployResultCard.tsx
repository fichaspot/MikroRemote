import { CheckCircle, XCircle, Terminal, Rocket } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import type { ChrDeployResult } from "@/types";

interface DeployResultCardProps {
  result: ChrDeployResult;
}

export function DeployResultCard({ result }: DeployResultCardProps) {
  return (
    <Card
      className={
        result.success ? "border-green-500/50" : "border-destructive/30"
      }
    >
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          {result.success ? (
            <>
              <Rocket className="w-5 h-5 text-green-500" />
              CHR Implementado
            </>
          ) : (
            <>
              <XCircle className="w-5 h-5 text-destructive" />
              Error en la Instalación
            </>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {result.success && (
          <div className="rounded-md bg-green-500/10 border border-green-500/20 p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-sm font-semibold text-green-400">
                CHR Implementado
              </span>
            </div>
            <p className="text-sm text-green-400">
              Conéctate por WinBox/SSH al router en la IP{" "}
              <span className="font-mono font-semibold">
                {result.detection.address.split("/")[0]}
              </span>
            </p>
          </div>
        )}

        <div className="space-y-2">
          <div className="flex items-center gap-1.5">
            <Terminal className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">Output</span>
          </div>
          <pre className="rounded-md bg-black/50 border border-border p-3 text-xs text-muted-foreground font-mono overflow-auto max-h-64 whitespace-pre-wrap">
            {result.output}
          </pre>
        </div>
      </CardContent>
    </Card>
  );
}

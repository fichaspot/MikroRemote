import { useState } from "react";
import { Loader2, Send, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useRouterConnection } from "@/hooks/useRouterConnection";

interface DeployDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  script: string;
  scriptLabel?: string;
}

export function DeployDialog({
  open,
  onOpenChange,
  script,
  scriptLabel = "Script del servidor",
}: DeployDialogProps) {
  const { isConnected, isDeploying, info, deployScript } =
    useRouterConnection();
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const handleDeploy = async () => {
    setResult(null);
    const res = await deployScript(script);
    setResult(res);
  };

  const handleClose = () => {
    setResult(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent onClose={handleClose}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="w-5 h-5 text-primary" />
            Enviar al Router
          </DialogTitle>
          <DialogDescription>
            {isConnected
              ? `Se enviará "${scriptLabel}" al router ${info?.identity ?? ""}.`
              : "Debes conectarte a un router primero desde la sección Routers."}
          </DialogDescription>
        </DialogHeader>

        {!isConnected ? (
          <div className="rounded-md bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
            No hay conexión activa. Ve a la sección Routers para conectarte.
          </div>
        ) : (
          <>
            <div className="rounded-md bg-muted/50 border p-3 text-xs font-mono max-h-48 overflow-auto whitespace-pre">
              {script.slice(0, 500)}
              {script.length > 500 && "\n..."}
            </div>

            {result && (
              <div
                className={`rounded-md border p-3 text-sm flex items-center gap-2 ${
                  result.success
                    ? "bg-primary/10 border-primary/20 text-primary"
                    : "bg-destructive/10 border-destructive/20 text-destructive"
                }`}
              >
                {result.success ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                ) : (
                  <XCircle className="w-4 h-4 shrink-0" />
                )}
                {result.message}
              </div>
            )}
          </>
        )}

        <DialogFooter>
          <Button variant="secondary" onClick={handleClose}>
            {result ? "Cerrar" : "Cancelar"}
          </Button>
          {isConnected && !result && (
            <Button onClick={handleDeploy} disabled={isDeploying}>
              {isDeploying ? (
                <>
                  <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                  Desplegando...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-1.5" />
                  Desplegar
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

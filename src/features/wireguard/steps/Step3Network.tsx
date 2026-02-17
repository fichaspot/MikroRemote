import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useWizardStore } from "@/stores/wizard-store";
import { networkConfigSchema } from "@/lib/validation";
import type { WgNetworkConfig } from "@/types";

function parseIpLastOctet(ip: string): number {
  const parts = ip.split(".");
  return parseInt(parts[3] || "0");
}

function ipBase(ip: string): string {
  const parts = ip.split(".");
  return parts.slice(0, 3).join(".");
}

export function Step3Network() {
  const { network, setNetwork, nextStep, prevStep } = useWizardStore();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(networkConfigSchema),
    defaultValues: network,
  });

  const watchedSubnet = watch("subnet") as string;
  const watchedStartIp = watch("clientStartIp") as string;
  const watchedCount = watch("clientCount") as number;
  const watchedMask = watch("subnetMask") as number;

  // Calcular vista previa
  const base = ipBase(watchedSubnet || "10.0.0.0");
  const startOctet = parseIpLastOctet(watchedStartIp || "10.0.0.2");
  const count = Number(watchedCount) || 1;
  const endOctet = startOctet + count - 1;
  const overflow = endOctet > 254;

  // Auto-calcular IP del servidor e IP inicio de clientes al cambiar subred
  const handleSubnetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    register("subnet").onChange(e);
    const b = ipBase(val);
    setValue("serverIp", `${b}.1`);
    const oldStart = parseIpLastOctet(watchedStartIp);
    setValue("clientStartIp", `${b}.${oldStart || 2}`);
  };

  const onSubmit = (data: Record<string, unknown>) => {
    if (overflow) return;
    setNetwork(data as unknown as WgNetworkConfig);
    nextStep();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Red VPN</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Define la subred VPN y el rango de asignación de IPs para clientes.
        </p>
      </div>

      <Card>
        <CardContent className="pt-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="subnet">Subred VPN</Label>
              <Input
                id="subnet"
                placeholder="10.0.0.0"
                {...register("subnet")}
                onChange={handleSubnetChange}
              />
              {errors.subnet && (
                <p className="text-xs text-destructive">{errors.subnet.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="subnetMask">Máscara de Subred</Label>
              <Input
                id="subnetMask"
                type="number"
                placeholder="24"
                {...register("subnetMask", { valueAsNumber: true })}
              />
              {errors.subnetMask && (
                <p className="text-xs text-destructive">{errors.subnetMask.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="serverIp">IP del Servidor</Label>
            <Input
              id="serverIp"
              placeholder="10.0.0.1"
              {...register("serverIp")}
            />
            {errors.serverIp && (
              <p className="text-xs text-destructive">{errors.serverIp.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="clientStartIp">IP Inicial de Clientes</Label>
              <Input
                id="clientStartIp"
                placeholder="10.0.0.2"
                {...register("clientStartIp")}
              />
              {errors.clientStartIp && (
                <p className="text-xs text-destructive">
                  {errors.clientStartIp.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="clientCount">Cantidad de Clientes</Label>
              <Input
                id="clientCount"
                type="number"
                placeholder="5"
                {...register("clientCount", { valueAsNumber: true })}
              />
              {errors.clientCount && (
                <p className="text-xs text-destructive">
                  {errors.clientCount.message}
                </p>
              )}
            </div>
          </div>

          {/* Vista Previa del Rango IP */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <p className="text-xs font-medium text-muted-foreground">
              Vista Previa del Rango IP
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="font-mono text-xs">
                Servidor: {base}.1/{String(watchedMask)}
              </Badge>
              <Badge
                variant={overflow ? "destructive" : "secondary"}
                className="font-mono text-xs"
              >
                Clientes: {base}.{startOctet} - {base}.{Math.min(endOctet, 254)}
              </Badge>
              <Badge variant="secondary" className="font-mono text-xs">
                Total: {count} clientes
              </Badge>
            </div>
            {overflow && (
              <p className="text-xs text-destructive mt-1">
                El rango de clientes excede .254 — reduce la cantidad o aumenta la IP inicial.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between pt-2">
        <Button type="button" variant="secondary" onClick={prevStep}>
          Anterior
        </Button>
        <Button type="submit" disabled={overflow}>
          Siguiente
        </Button>
      </div>
    </form>
  );
}

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useWizardStore } from "@/stores/wizard-store";
import { serverConfigSchema } from "@/lib/validation";
import type { WgServerConfig } from "@/types";

export function Step2Server() {
  const { server, setServer, nextStep, prevStep } = useWizardStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(serverConfigSchema),
    defaultValues: server,
  });

  const onSubmit = (data: Record<string, unknown>) => {
    setServer(data as unknown as WgServerConfig);
    nextStep();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Configuración del Servidor</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Configura el endpoint del servidor WireGuard al que se conectarán los clientes.
        </p>
      </div>

      <Card>
        <CardContent className="pt-6 space-y-5">
          <div className="space-y-2">
            <Label htmlFor="address">Dirección del Servidor (IP o Dominio)</Label>
            <Input
              id="address"
              placeholder="Ej: vpn.ejemplo.com o 203.0.113.1"
              {...register("address")}
            />
            {errors.address && (
              <p className="text-xs text-destructive">{errors.address.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="listenPort">Puerto de Escucha</Label>
              <Input
                id="listenPort"
                type="number"
                placeholder="51820"
                {...register("listenPort", { valueAsNumber: true })}
              />
              {errors.listenPort && (
                <p className="text-xs text-destructive">
                  {errors.listenPort.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="interfaceName">Nombre de Interfaz</Label>
              <Input
                id="interfaceName"
                placeholder="wireguard1"
                {...register("interfaceName")}
              />
              {errors.interfaceName && (
                <p className="text-xs text-destructive">
                  {errors.interfaceName.message}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between pt-2">
        <Button type="button" variant="secondary" onClick={prevStep}>
          Anterior
        </Button>
        <Button type="submit">Siguiente</Button>
      </div>
    </form>
  );
}

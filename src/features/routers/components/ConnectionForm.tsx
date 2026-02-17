import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plug } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

const connectionSchema = z.object({
  host: z.string().min(1, "Requerido"),
  port: z.coerce.number().int().min(1).max(65535),
  username: z.string().min(1, "Requerido"),
  password: z.string(),
});

type ConnectionFormData = {
  host: string;
  port: number;
  username: string;
  password: string;
};

interface ConnectionFormProps {
  onConnect: (data: ConnectionFormData) => void;
  isConnecting: boolean;
  error: string | null;
  defaultValues?: Partial<ConnectionFormData>;
}

export function ConnectionForm({
  onConnect,
  isConnecting,
  error,
  defaultValues: propDefaults,
}: ConnectionFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(connectionSchema),
    defaultValues: {
      host: propDefaults?.host ?? "",
      port: propDefaults?.port ?? 8728,
      username: propDefaults?.username ?? "admin",
      password: propDefaults?.password ?? "",
    },
  });

  // Reset form when defaultValues change (e.g., selecting a saved router)
  useEffect(() => {
    if (propDefaults) {
      reset({
        host: propDefaults.host ?? "",
        port: propDefaults.port ?? 8728,
        username: propDefaults.username ?? "admin",
        password: propDefaults.password ?? "",
      });
    }
  }, [propDefaults, reset]);

  const onSubmit = (data: Record<string, unknown>) => {
    onConnect(data as unknown as ConnectionFormData);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plug className="w-5 h-5 text-primary" />
          Conectar al Router
        </CardTitle>
        <CardDescription>
          Ingresa las credenciales de acceso API (puerto 8728) de tu router
          MikroTik.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="host">Host / IP</Label>
              <Input
                id="host"
                placeholder="192.168.88.1"
                {...register("host")}
              />
              {errors.host && (
                <p className="text-xs text-destructive">
                  {errors.host.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="port">Puerto API</Label>
              <Input
                id="port"
                type="number"
                {...register("port")}
              />
              {errors.port && (
                <p className="text-xs text-destructive">
                  {errors.port.message}
                </p>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="username">Usuario</Label>
              <Input
                id="username"
                placeholder="admin"
                {...register("username")}
              />
              {errors.username && (
                <p className="text-xs text-destructive">
                  {errors.username.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                {...register("password")}
              />
            </div>
          </div>
          {error && (
            <div className="rounded-md bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
              {error}
            </div>
          )}
          <Button type="submit" disabled={isConnecting} className="w-full">
            {isConnecting ? (
              <>
                <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                Conectando...
              </>
            ) : (
              <>
                <Plug className="w-4 h-4 mr-1.5" />
                Conectar
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

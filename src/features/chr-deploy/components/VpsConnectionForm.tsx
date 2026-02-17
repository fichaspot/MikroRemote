import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Search, FolderOpen } from "lucide-react";
import { open } from "@tauri-apps/plugin-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

const vpsSchema = z.object({
  host: z.string().min(1, "Requerido"),
  port: z.coerce.number().int().min(1).max(65535),
  username: z.string().min(1, "Requerido"),
  authType: z.enum(["password", "key"]),
  password: z.string(),
  keyPath: z.string(),
});

export type VpsFormData = {
  host: string;
  port: number;
  username: string;
  authType: "password" | "key";
  password: string;
  keyPath: string;
};

interface VpsConnectionFormProps {
  onDetect: (data: VpsFormData) => void;
  isDetecting: boolean;
  error: string | null;
  defaultValues?: Partial<VpsFormData>;
}

export function VpsConnectionForm({
  onDetect,
  isDetecting,
  error,
  defaultValues: propDefaults,
}: VpsConnectionFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
  } = useForm({
    resolver: zodResolver(vpsSchema),
    defaultValues: {
      host: propDefaults?.host ?? "",
      port: propDefaults?.port ?? 22,
      username: propDefaults?.username ?? "root",
      authType: propDefaults?.authType ?? "password",
      password: propDefaults?.password ?? "",
      keyPath: propDefaults?.keyPath ?? "",
    },
  });

  const authType = watch("authType");

  useEffect(() => {
    if (propDefaults) {
      reset({
        host: propDefaults.host ?? "",
        port: propDefaults.port ?? 22,
        username: propDefaults.username ?? "root",
        authType: propDefaults.authType ?? "password",
        password: propDefaults.password ?? "",
        keyPath: propDefaults.keyPath ?? "",
      });
    }
  }, [propDefaults, reset]);

  const handleBrowseKey = async () => {
    const selected = await open({
      multiple: false,
      filters: [{ name: "Llaves SSH", extensions: ["pem", "key", "pub", "*"] }],
    });
    if (selected) {
      setValue("keyPath", selected as string);
    }
  };

  const onSubmit = (data: Record<string, unknown>) => {
    onDetect(data as unknown as VpsFormData);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="w-5 h-5 text-primary" />
          Conexión al VPS
        </CardTitle>
        <CardDescription>
          Ingresa las credenciales SSH del servidor VPS donde se instalará CHR.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="vps-host">Host / IP</Label>
              <Input
                id="vps-host"
                placeholder="203.0.113.10"
                {...register("host")}
              />
              {errors.host && (
                <p className="text-xs text-destructive">
                  {errors.host.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="vps-port">Puerto SSH</Label>
              <Input
                id="vps-port"
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
              <Label htmlFor="vps-username">Usuario</Label>
              <Input
                id="vps-username"
                placeholder="root"
                {...register("username")}
              />
              {errors.username && (
                <p className="text-xs text-destructive">
                  {errors.username.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="vps-auth">Autenticación</Label>
              <Select id="vps-auth" {...register("authType")}>
                <option value="password">Contraseña</option>
                <option value="key">Llave privada</option>
              </Select>
            </div>
          </div>

          {authType === "password" ? (
            <div className="space-y-2">
              <Label htmlFor="vps-password">Contraseña</Label>
              <Input
                id="vps-password"
                type="password"
                placeholder="••••••••"
                {...register("password")}
              />
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="vps-keypath">Ruta de llave privada</Label>
              <div className="flex gap-2">
                <Input
                  id="vps-keypath"
                  placeholder="/home/user/.ssh/id_rsa"
                  {...register("keyPath")}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={handleBrowseKey}
                  className="shrink-0"
                >
                  <FolderOpen className="w-4 h-4" />
                </Button>
              </div>
              <div className="space-y-2">
                <Label htmlFor="vps-key-pass">Passphrase (opcional)</Label>
                <Input
                  id="vps-key-pass"
                  type="password"
                  placeholder="••••••••"
                  {...register("password")}
                />
              </div>
            </div>
          )}

          {error && (
            <div className="rounded-md bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <Button type="submit" disabled={isDetecting} className="w-full">
            {isDetecting ? (
              <>
                <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                Detectando VPS...
              </>
            ) : (
              <>
                <Search className="w-4 h-4 mr-1.5" />
                Detectar VPS
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

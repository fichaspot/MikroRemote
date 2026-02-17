import { useEffect, useState } from "react";
import {
  Cloud,
  Trash2,
  Plug,
  AlertTriangle,
  Loader2,
  Rocket,
  ArrowLeft,
  Save,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useVpsStore } from "@/stores/vps-store";
import { chrDetectVps, chrDeploy } from "@/lib/chr-commands";
import {
  VpsConnectionForm,
  type VpsFormData,
} from "./components/VpsConnectionForm";
import { DetectionCard } from "./components/DetectionCard";
import { DeployResultCard } from "./components/DeployResultCard";
import type { VpsDetection, SavedVps } from "@/types";

type Step = "connect" | "review" | "result";

export function ChrDeployPage() {
  const {
    savedVps,
    fetchSavedVps,
    saveVps,
    deleteVps,
    detection,
    setDetection,
    deployResult,
    setDeployResult,
    reset: resetStore,
  } = useVpsStore();

  const [step, setStep] = useState<Step>("connect");
  const [isDetecting, setIsDetecting] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<VpsFormData | null>(null);
  const [chrVersion, setChrVersion] = useState("7.20.8");
  const [selectedVps, setSelectedVps] = useState<SavedVps | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    fetchSavedVps();
  }, []);

  const handleDetect = async (data: VpsFormData) => {
    setError(null);
    setIsDetecting(true);
    setFormData(data);
    try {
      const det = await chrDetectVps({
        host: data.host,
        port: data.port,
        username: data.username,
        authType: data.authType,
        password: data.password || undefined,
        keyPath: data.keyPath || undefined,
      });
      setDetection(det);
      setStep("review");
      toast.success("VPS detectado correctamente");
    } catch (e) {
      setError(String(e));
      toast.error(`Error al detectar VPS: ${e}`);
    } finally {
      setIsDetecting(false);
    }
  };

  const handleDeploy = async () => {
    if (!formData || !detection) return;

    const updatedDetection: VpsDetection = {
      ...detection,
      imgUrl: computeImgUrl(detection.arch, detection.bootMode, chrVersion),
    };

    setIsDeploying(true);
    try {
      const result = await chrDeploy({
        host: formData.host,
        port: formData.port,
        username: formData.username,
        authType: formData.authType,
        password: formData.password || undefined,
        keyPath: formData.keyPath || undefined,
        version: chrVersion,
        detectionJson: JSON.stringify({
          arch: updatedDetection.arch,
          boot_mode: updatedDetection.bootMode,
          storage: updatedDetection.storage,
          eth: updatedDetection.eth,
          address: updatedDetection.address,
          gateway: updatedDetection.gateway,
          dns: updatedDetection.dns,
          img_url: updatedDetection.imgUrl,
        }),
      });
      setDeployResult(result);
      setStep("result");
      if (result.success) {
        toast.success("CHR instalado exitosamente");
      } else {
        toast.error("Error en la instalación de CHR");
      }
    } catch (e) {
      setDeployResult({
        success: false,
        output: String(e),
        detection: updatedDetection,
      });
      setStep("result");
      toast.error(`Error: ${e}`);
    } finally {
      setIsDeploying(false);
    }
  };

  const handleSaveVps = async () => {
    if (!formData) return;
    await saveVps({
      name: `${formData.host}`,
      host: formData.host,
      port: formData.port,
      username: formData.username,
      authType: formData.authType,
      password: formData.password,
      keyPath: formData.keyPath,
    });
    setIsSaved(true);
  };

  const handleSelectSaved = (vps: SavedVps) => {
    setSelectedVps(vps);
  };

  const handleBack = () => {
    if (step === "review") {
      setDetection(null);
      setStep("connect");
    } else if (step === "result") {
      resetStore();
      setStep("connect");
      setFormData(null);
      setIsSaved(false);
      setSelectedVps(null);
    }
  };

  const defaultFormValues = selectedVps
    ? {
        host: selectedVps.host,
        port: selectedVps.port,
        username: selectedVps.username,
        authType: selectedVps.authType,
        password: selectedVps.password,
        keyPath: selectedVps.keyPath,
      }
    : undefined;

  return (
    <div className="min-h-full">
      {/* Page header */}
      <div className="border-b border-border px-8 py-6">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <Cloud className="w-4 h-4 text-primary" />
          <div>
            <h1 className="text-lg font-semibold uppercase tracking-wider">CHR Deploy</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Instala MikroTik Cloud Hosted Router en un servidor VPS vía SSH.
            </p>
          </div>
        </div>
      </div>

      <div className="px-8 py-6 max-w-4xl mx-auto space-y-6">
        {/* Step: Connect */}
        {step === "connect" && (
          <>
            {savedVps.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-primary" />
                  <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground">
                    VPS Guardados
                  </span>
                </div>
                <div className="border border-border divide-y divide-border">
                  {savedVps.map((v) => (
                    <div key={v.id} className="flex items-center justify-between px-5 py-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <Cloud className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">
                            {v.name}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span className="font-mono">
                              {v.host}:{v.port}
                            </span>
                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                              {v.authType === "key" ? "Llave" : "Password"}
                            </Badge>
                            {v.lastArch && (
                              <span className="font-mono">{v.lastArch}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <Button
                          size="sm"
                          onClick={() => handleSelectSaved(v)}
                        >
                          <Plug className="w-3.5 h-3.5 mr-1" />
                          Usar
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteVps(v.id)}
                          className="text-primary hover:text-primary"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <VpsConnectionForm
              onDetect={handleDetect}
              isDetecting={isDetecting}
              error={error}
              defaultValues={defaultFormValues}
            />
          </>
        )}

        {/* Step: Review */}
        {step === "review" && detection && (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver
            </Button>

            <DetectionCard detection={detection} />

            <Card>
              <CardContent className="py-4 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="chr-version">Versión CHR</Label>
                  <Input
                    id="chr-version"
                    value={chrVersion}
                    onChange={(e) => setChrVersion(e.target.value)}
                    placeholder="7.20.2"
                  />
                  <p className="text-xs text-muted-foreground font-mono">
                    URL:{" "}
                    {computeImgUrl(
                      detection.arch,
                      detection.bootMode,
                      chrVersion
                    )}
                  </p>
                </div>

                <div className="border border-warning/30 bg-warning/5 p-3 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-warning shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-mono font-semibold text-xs uppercase tracking-wider text-warning">Advertencia</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Todos los datos en{" "}
                      <span className="font-mono font-semibold text-foreground">
                        /dev/{detection.storage}
                      </span>{" "}
                      se perderán. El servidor se reiniciará con MikroTik CHR.
                    </p>
                  </div>
                </div>

                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={handleDeploy}
                  disabled={isDeploying}
                >
                  {isDeploying ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                      Instalando CHR...
                    </>
                  ) : (
                    <>
                      <Rocket className="w-4 h-4 mr-1.5" />
                      Instalar CHR
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </>
        )}

        {/* Step: Result */}
        {step === "result" && deployResult && (
          <>
            <DeployResultCard result={deployResult} />

            <div className="flex items-center gap-2">
              {!isSaved && (
                <Button variant="secondary" onClick={handleSaveVps}>
                  <Save className="w-4 h-4 mr-1.5" />
                  Guardar VPS
                </Button>
              )}
              <Button variant="ghost" onClick={handleBack}>
                <ArrowLeft className="w-4 h-4 mr-1.5" />
                Nueva Instalación
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function computeImgUrl(arch: string, bootMode: string, version: string): string {
  if (arch === "aarch64") {
    return `https://github.com/elseif/MikroTikPatch/releases/download/${version}-arm64/chr-${version}-arm64.img.zip`;
  }
  if (bootMode === "UEFI") {
    return `https://github.com/elseif/MikroTikPatch/releases/download/${version}/chr-${version}.img.zip`;
  }
  return `https://github.com/elseif/MikroTikPatch/releases/download/${version}/chr-${version}-legacy-bios.img.zip`;
}

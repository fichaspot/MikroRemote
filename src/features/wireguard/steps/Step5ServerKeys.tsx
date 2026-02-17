import { useState } from "react";
import { Key, Upload, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { KeyPairDisplay } from "@/components/crypto/KeyPairDisplay";
import { useWizardStore } from "@/stores/wizard-store";
import { useWgKeyGen } from "@/hooks/useWgKeyGen";
import { toast } from "sonner";

export function Step5ServerKeys() {
  const { serverKeys, setServerKeys, nextStep, prevStep } = useWizardStore();
  const { generateKeypair, derivePublicKey, loading } = useWgKeyGen();

  const [mode, setMode] = useState<"auto" | "import">(
    serverKeys.imported ? "import" : "auto"
  );
  const [importKey, setImportKey] = useState(
    serverKeys.imported ? serverKeys.privateKey : ""
  );

  const handleAutoGenerate = async () => {
    const kp = await generateKeypair();
    if (kp) {
      setServerKeys({
        privateKey: kp.privateKey,
        publicKey: kp.publicKey,
        imported: false,
      });
      toast.success("Llaves del servidor generadas");
    }
  };

  const handleDerive = async () => {
    if (!importKey || importKey.length !== 44) {
      toast.error("La llave privada debe tener 44 caracteres (Base64)");
      return;
    }
    const pubKey = await derivePublicKey(importKey);
    if (pubKey) {
      setServerKeys({
        privateKey: importKey,
        publicKey: pubKey,
        imported: true,
      });
      toast.success("Llave pública derivada");
    }
  };

  const hasKeys = serverKeys.privateKey && serverKeys.publicKey;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Llaves del Servidor</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Genera un nuevo par de llaves para el servidor WireGuard o importa una
          llave privada existente.
        </p>
      </div>

      {/* Selección de Modo */}
      <div className="flex gap-3">
        <Card
          className={`flex-1 cursor-pointer border-2 transition-colors ${
            mode === "auto" ? "border-primary" : "border-border hover:border-primary/30"
          }`}
          onClick={() => setMode("auto")}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Key className="w-4 h-4 text-primary" />
              Auto-Generar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Genera un nuevo par de llaves Curve25519 de forma segura.
            </p>
          </CardContent>
        </Card>

        <Card
          className={`flex-1 cursor-pointer border-2 transition-colors ${
            mode === "import" ? "border-primary" : "border-border hover:border-primary/30"
          }`}
          onClick={() => setMode("import")}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Upload className="w-4 h-4 text-primary" />
              Importar Llave
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Usa una llave privada existente y deriva la llave pública.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Auto-Generar */}
      {mode === "auto" && (
        <Card>
          <CardContent className="pt-6 space-y-4">
            <Button onClick={handleAutoGenerate} disabled={loading}>
              {loading ? (
                <RefreshCw className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Key className="w-4 h-4 mr-2" />
              )}
              {hasKeys && !serverKeys.imported
                ? "Regenerar Llaves"
                : "Generar Par de Llaves"}
            </Button>
            {hasKeys && !serverKeys.imported && (
              <KeyPairDisplay
                label="Par de Llaves del Servidor"
                privateKey={serverKeys.privateKey}
                publicKey={serverKeys.publicKey}
              />
            )}
          </CardContent>
        </Card>
      )}

      {/* Importar */}
      {mode === "import" && (
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="space-y-2">
              <Label>Llave Privada (Base64, 44 caracteres)</Label>
              <div className="flex gap-2">
                <Input
                  value={importKey}
                  onChange={(e) => setImportKey(e.target.value)}
                  placeholder="Pega tu llave privada WireGuard..."
                  className="font-mono text-sm"
                />
                <Button onClick={handleDerive} disabled={loading}>
                  Derivar
                </Button>
              </div>
            </div>
            {hasKeys && serverKeys.imported && (
              <KeyPairDisplay
                label="Par de Llaves Importado"
                privateKey={serverKeys.privateKey}
                publicKey={serverKeys.publicKey}
              />
            )}
          </CardContent>
        </Card>
      )}

      <div className="flex justify-between pt-2">
        <Button variant="secondary" onClick={prevStep}>
          Anterior
        </Button>
        <Button onClick={nextStep} disabled={!hasKeys}>
          Siguiente
        </Button>
      </div>
    </div>
  );
}

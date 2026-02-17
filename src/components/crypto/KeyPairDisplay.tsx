import { useState } from "react";
import { Eye, EyeOff, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface KeyPairDisplayProps {
  label: string;
  privateKey: string;
  publicKey: string;
  psk?: string;
  className?: string;
}

function CopyableKey({
  label,
  value,
  secret,
}: {
  label: string;
  value: string;
  secret?: boolean;
  }) {
  const [hidden, setHidden] = useState(secret ?? false);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const displayValue = hidden ? "•".repeat(44) : value;

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">
          {label}
        </span>
        <div className="flex gap-1">
          {secret && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => setHidden(!hidden)}
            >
              {hidden ? (
                <Eye className="w-3 h-3" />
              ) : (
                <EyeOff className="w-3 h-3" />
              )}
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={handleCopy}
          >
            {copied ? (
              <Check className="w-3 h-3 text-primary" />
            ) : (
              <Copy className="w-3 h-3" />
            )}
          </Button>
        </div>
      </div>
      <code className="block text-xs font-mono bg-background p-2 rounded border break-all">
        {displayValue}
      </code>
    </div>
  );
}

export function KeyPairDisplay({
  label,
  privateKey,
  publicKey,
  psk,
  className,
}: KeyPairDisplayProps) {
  return (
    <div className={cn("space-y-3", className)}>
      {label && (
        <h4 className="text-sm font-semibold text-foreground">{label}</h4>
      )}
      <CopyableKey label="Llave Privada" value={privateKey} secret />
      <CopyableKey label="Llave Pública" value={publicKey} />
      {psk && <CopyableKey label="Llave Precompartida (PSK)" value={psk} secret />}
    </div>
  );
}

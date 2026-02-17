import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ConfigPreviewProps {
  code: string;
  language?: string;
  title?: string;
  className?: string;
}

export function ConfigPreview({ code, title, className }: ConfigPreviewProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className={cn("relative group", className)}>
      {title && (
        <div className="flex items-center justify-between px-4 py-2 bg-muted/50 border border-b-0 rounded-t-lg">
          <span className="text-xs font-medium text-muted-foreground">
            {title}
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={handleCopy}
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 mr-1 text-primary" /> Copiado
              </>
            ) : (
              <>
                <Copy className="w-3 h-3 mr-1" /> Copiar
              </>
            )}
          </Button>
        </div>
      )}
      <div
        className={cn(
          "bg-card border p-4 overflow-x-auto max-h-[400px] overflow-y-auto",
          title ? "rounded-b-lg" : "rounded-lg"
        )}
      >
        <pre className="text-xs font-mono text-foreground whitespace-pre leading-relaxed">
          {code}
        </pre>
      </div>
      {!title && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={handleCopy}
        >
          {copied ? (
            <Check className="w-3.5 h-3.5 text-primary" />
          ) : (
            <Copy className="w-3.5 h-3.5" />
          )}
        </Button>
      )}
    </div>
  );
}

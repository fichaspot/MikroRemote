import { Minus, Plus, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppStore, ZOOM_LEVELS } from "@/stores/app-store";

export function SettingsPage() {
  const { zoom, setZoom } = useAppStore();

  const currentIndex = ZOOM_LEVELS.indexOf(
    zoom as (typeof ZOOM_LEVELS)[number]
  );
  const canZoomOut = currentIndex > 0;
  const canZoomIn = currentIndex < ZOOM_LEVELS.length - 1;

  return (
    <div className="min-h-full">
      {/* Header */}
      <div className="relative border-b border-border overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

        <div className="relative px-8 py-12 max-w-5xl mx-auto">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-primary" />
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground">
                Configuración
              </span>
            </div>
            <h1 className="text-3xl font-bold uppercase tracking-wide text-foreground">
              Ajustes
            </h1>
            <p className="text-sm text-muted-foreground max-w-lg leading-relaxed">
              Personaliza la apariencia y el comportamiento de la aplicación
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-8 py-8 max-w-5xl mx-auto space-y-8">
        {/* Apariencia section */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-1.5 bg-primary" />
            <h2 className="text-xs font-mono uppercase tracking-[0.15em] text-muted-foreground">
              Apariencia
            </h2>
          </div>

          <div className="border border-border rounded-md p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground">
                  Nivel de zoom
                </p>
                <p className="text-xs text-muted-foreground">
                  Ajusta el tamaño de toda la interfaz
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => canZoomOut && setZoom(ZOOM_LEVELS[currentIndex - 1])}
                  disabled={!canZoomOut}
                  aria-label="Reducir zoom"
                >
                  <Minus className="w-3.5 h-3.5" />
                </Button>

                <span className="w-16 text-center text-sm font-mono font-medium text-foreground tabular-nums">
                  {Math.round(zoom * 100)}%
                </span>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => canZoomIn && setZoom(ZOOM_LEVELS[currentIndex + 1])}
                  disabled={!canZoomIn}
                  aria-label="Aumentar zoom"
                >
                  <Plus className="w-3.5 h-3.5" />
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setZoom(1.0)}
                  disabled={zoom === 1.0}
                  aria-label="Restablecer zoom"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

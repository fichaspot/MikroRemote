import { useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface QRCodeCardProps {
  clientName: string;
  configContent: string;
}

export function QRCodeCard({ clientName, configContent }: QRCodeCardProps) {
  const svgRef = useRef<HTMLDivElement>(null);

  const handleDownload = () => {
    if (!svgRef.current) return;
    const svg = svgRef.current.querySelector("svg");
    if (!svg) return;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const img = new Image();
    const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);

      const link = document.createElement("a");
      link.download = `${clientName}-qr.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    };
    img.src = url;
  };

  return (
    <Card className="w-fit">
      <CardContent className="pt-4 flex flex-col items-center gap-3">
        <p className="text-sm font-medium">{clientName}</p>
        <div ref={svgRef} className="bg-white p-2 rounded">
          <QRCodeSVG value={configContent} size={180} level="M" />
        </div>
        <Button variant="secondary" size="sm" onClick={handleDownload}>
          <Download className="w-3.5 h-3.5 mr-1.5" />
          Descargar PNG
        </Button>
      </CardContent>
    </Card>
  );
}

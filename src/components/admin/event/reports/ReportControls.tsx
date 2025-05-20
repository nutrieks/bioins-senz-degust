
import { Button } from "@/components/ui/button";
import { FileDown, Printer } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ReportControlsProps {
  onPrint: () => void;
  onExport: () => void;
  disabled: boolean;
}

export function ReportControls({
  onPrint,
  onExport,
  disabled
}: ReportControlsProps) {
  const { toast } = useToast();

  const handleExport = () => {
    toast({
      title: "Obavijest",
      description: "Izvoz izvještaja će biti dostupan u budućoj verziji.",
    });
    onExport();
  };

  return (
    <div className="flex space-x-2">
      <Button
        variant="outline"
        size="sm"
        onClick={onPrint}
        className="flex items-center"
        disabled={disabled}
      >
        <Printer className="mr-2 h-4 w-4" />
        Ispiši
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={handleExport}
        className="flex items-center"
        disabled={disabled}
      >
        <FileDown className="mr-2 h-4 w-4" />
        Preuzmi PDF
      </Button>
    </div>
  );
}

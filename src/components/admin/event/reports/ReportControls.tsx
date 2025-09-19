
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { FileDown, Printer, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ReportControlsProps {
  onPrint: () => void;
  onExport: () => void;
  disabled: boolean;
  editMode?: boolean;
  onEditModeChange?: (enabled: boolean) => void;
  showEditMode?: boolean;
}

export function ReportControls({
  onPrint,
  onExport,
  disabled,
  editMode = false,
  onEditModeChange,
  showEditMode = false
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
    <div className="flex items-center space-x-4">
      {showEditMode && (
        <div className="flex items-center space-x-2">
          <Switch
            id="edit-mode"
            checked={editMode}
            onCheckedChange={onEditModeChange}
          />
          <Label htmlFor="edit-mode" className="flex items-center">
            <Settings className="mr-1 h-4 w-4" />
            Način uređivanja
          </Label>
        </div>
      )}
      
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
    </div>
  );
}

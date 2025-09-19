import { useState, useEffect } from "react";
import { TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Save, X } from "lucide-react";
import { updateEvaluation, EvaluationUpdate } from "@/services/supabase/evaluationManagement";
import { useToast } from "@/hooks/use-toast";
import { ProductType } from "@/types";

interface Evaluation {
  id: string;
  hedonic_appearance: number;
  hedonic_odor: number;
  hedonic_texture: number;
  hedonic_flavor: number;
  hedonic_overall_liking: number;
  jar_ratings: any;
}

interface EvaluationEditorProps {
  evaluation: Evaluation;
  productType?: ProductType;
  onSave: () => void;
  onCancel: () => void;
}

export function EvaluationEditor({ 
  evaluation, 
  productType, 
  onSave, 
  onCancel 
}: EvaluationEditorProps) {
  const { toast } = useToast();
  const [values, setValues] = useState<EvaluationUpdate>({
    hedonic_appearance: evaluation.hedonic_appearance,
    hedonic_odor: evaluation.hedonic_odor,
    hedonic_texture: evaluation.hedonic_texture,
    hedonic_flavor: evaluation.hedonic_flavor,
    hedonic_overall_liking: evaluation.hedonic_overall_liking,
    jar_ratings: evaluation.jar_ratings,
  });
  const [isSaving, setIsSaving] = useState(false);

  const validateHedonicValue = (value: number): boolean => {
    return value >= 1 && value <= 9;
  };

  const validateJARValue = (value: number): boolean => {
    return value >= 1 && value <= 5;
  };

  const handleHedonicChange = (field: keyof EvaluationUpdate, value: string) => {
    const numValue = parseInt(value);
    if (!isNaN(numValue) && validateHedonicValue(numValue)) {
      setValues(prev => ({ ...prev, [field]: numValue }));
    }
  };

  const handleJARChange = (attributeId: string, value: string) => {
    const numValue = parseInt(value);
    if (!isNaN(numValue) && validateJARValue(numValue)) {
      setValues(prev => ({
        ...prev,
        jar_ratings: {
          ...prev.jar_ratings,
          [attributeId]: numValue
        }
      }));
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      // Validate all values
      const hedonicFields = [
        values.hedonic_appearance!,
        values.hedonic_odor!,
        values.hedonic_texture!,
        values.hedonic_flavor!,
        values.hedonic_overall_liking!
      ];

      const invalidHedonic = hedonicFields.some(val => !validateHedonicValue(val));
      if (invalidHedonic) {
        toast({
          title: "Greška",
          description: "Hedonističke ocjene moraju biti između 1 i 9.",
          variant: "destructive",
        });
        return;
      }

      // Validate JAR ratings
      const jarValues = Object.values(values.jar_ratings || {});
      const invalidJAR = jarValues.some(val => !validateJARValue(val));
      if (invalidJAR) {
        toast({
          title: "Greška",
          description: "JAR ocjene moraju biti između 1 i 5.",
          variant: "destructive",
        });
        return;
      }

      await updateEvaluation(evaluation.id, values, "Admin edit");
      
      toast({
        title: "Uspjeh",
        description: "Ocjena je uspješno ažurirana.",
      });
      
      onSave();
    } catch (error) {
      console.error("Error saving evaluation:", error);
      toast({
        title: "Greška",
        description: "Dogodila se greška prilikom spremanja ocjene.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <TableCell>
        <Input
          type="number"
          min="1"
          max="9"
          value={values.hedonic_appearance}
          onChange={(e) => handleHedonicChange('hedonic_appearance', e.target.value)}
          className="w-16"
        />
      </TableCell>
      <TableCell>
        <Input
          type="number"
          min="1"
          max="9"
          value={values.hedonic_odor}
          onChange={(e) => handleHedonicChange('hedonic_odor', e.target.value)}
          className="w-16"
        />
      </TableCell>
      <TableCell>
        <Input
          type="number"
          min="1"
          max="9"
          value={values.hedonic_texture}
          onChange={(e) => handleHedonicChange('hedonic_texture', e.target.value)}
          className="w-16"
        />
      </TableCell>
      <TableCell>
        <Input
          type="number"
          min="1"
          max="9"
          value={values.hedonic_flavor}
          onChange={(e) => handleHedonicChange('hedonic_flavor', e.target.value)}
          className="w-16"
        />
      </TableCell>
      <TableCell>
        <Input
          type="number"
          min="1"
          max="9"
          value={values.hedonic_overall_liking}
          onChange={(e) => handleHedonicChange('hedonic_overall_liking', e.target.value)}
          className="w-16"
        />
      </TableCell>
      <TableCell>
        <Badge variant="secondary">Uređuje se</Badge>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSave}
            disabled={isSaving}
          >
            <Save className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onCancel}
            disabled={isSaving}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </>
  );
}
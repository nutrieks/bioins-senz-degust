import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Save, X, RotateCcw } from "lucide-react";
import { EvaluationEditor } from "./EvaluationEditor";
import { ProductType } from "@/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Evaluation {
  id: string;
  user_id: string;
  sample_id: string;
  hedonic_appearance: number;
  hedonic_odor: number;
  hedonic_texture: number;
  hedonic_flavor: number;
  hedonic_overall_liking: number;
  jar_ratings: any;
  timestamp: string;
  users: { username: string };
  samples: { brand: string; retailer_code: string; blind_code: string | null };
}

interface Sample {
  id: string;
  brand: string;
  retailer_code: string;
  blind_code: string | null;
  hidden_from_reports: boolean;
}

interface EvaluationsListProps {
  evaluations: Evaluation[];
  samples: Sample[];
  productType?: ProductType;
  onEvaluationUpdated: () => void;
}

export function EvaluationsList({ 
  evaluations, 
  samples, 
  productType, 
  onEvaluationUpdated 
}: EvaluationsListProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filterEvaluator, setFilterEvaluator] = useState<string>("all");
  const [filterSample, setFilterSample] = useState<string>("all");

  // Get unique evaluators and samples for filters
  const uniqueEvaluators = Array.from(
    new Set(evaluations.map(e => e.users.username))
  ).sort();

  const uniqueSamples = Array.from(
    new Set(evaluations.map(e => `${e.samples.retailer_code} - ${e.samples.brand}`))
  ).sort();

  // Filter evaluations
  const filteredEvaluations = evaluations.filter(evaluation => {
    const evaluatorMatch = filterEvaluator === "all" || 
      evaluation.users.username === filterEvaluator;
    
    const sampleMatch = filterSample === "all" || 
      `${evaluation.samples.retailer_code} - ${evaluation.samples.brand}` === filterSample;
    
    return evaluatorMatch && sampleMatch;
  });

  const handleEdit = (evaluationId: string) => {
    setEditingId(evaluationId);
  };

  const handleCancel = () => {
    setEditingId(null);
  };

  const handleSave = () => {
    setEditingId(null);
    onEvaluationUpdated();
  };

  if (evaluations.length === 0) {
    return (
      <div className="text-center p-6 text-muted-foreground">
        Nema dostupnih ocjena za odabrani tip proizvoda.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Select value={filterEvaluator} onValueChange={setFilterEvaluator}>
            <SelectTrigger>
              <SelectValue placeholder="Filtriraj po ocjenitelju" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Svi ocjenjitelji</SelectItem>
              {uniqueEvaluators.map(evaluator => (
                <SelectItem key={evaluator} value={evaluator}>
                  {evaluator}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1">
          <Select value={filterSample} onValueChange={setFilterSample}>
            <SelectTrigger>
              <SelectValue placeholder="Filtriraj po uzorku" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Svi uzorci</SelectItem>
              {uniqueSamples.map(sample => (
                <SelectItem key={sample} value={sample}>
                  {sample}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Evaluations Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ocjenjitelj</TableHead>
              <TableHead>Uzorak</TableHead>
              <TableHead>Izgled</TableHead>
              <TableHead>Miris</TableHead>
              <TableHead>Tekstura</TableHead>
              <TableHead>Okus</TableHead>
              <TableHead>Ukupno</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Akcije</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEvaluations.map((evaluation) => {
              const isEditing = editingId === evaluation.id;
              const sampleInfo = samples.find(s => s.id === evaluation.sample_id);
              
              return (
                <TableRow key={evaluation.id}>
                  <TableCell className="font-medium">
                    {evaluation.users.username}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span>{evaluation.samples.retailer_code} - {evaluation.samples.brand}</span>
                      {sampleInfo?.hidden_from_reports && (
                        <Badge variant="secondary" className="text-xs">
                          Skriveno
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  {isEditing ? (
                    <EvaluationEditor
                      evaluation={evaluation}
                      productType={productType}
                      onSave={handleSave}
                      onCancel={handleCancel}
                    />
                  ) : (
                    <>
                      <TableCell>{evaluation.hedonic_appearance}</TableCell>
                      <TableCell>{evaluation.hedonic_odor}</TableCell>
                      <TableCell>{evaluation.hedonic_texture}</TableCell>
                      <TableCell>{evaluation.hedonic_flavor}</TableCell>
                      <TableCell>{evaluation.hedonic_overall_liking}</TableCell>
                      <TableCell>
                        <Badge variant="outline">Završeno</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(evaluation.id)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </>
                  )}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {filteredEvaluations.length === 0 && (
        <div className="text-center p-6 text-muted-foreground">
          Nema ocjena koji odgovaraju odabranim filterima.
        </div>
      )}
    </div>
  );
}
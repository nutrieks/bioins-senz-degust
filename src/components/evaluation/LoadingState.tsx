
import { EvaluatorLayout } from "@/components/layout/EvaluatorLayout";

export function LoadingState() {
  return (
    <EvaluatorLayout>
      <div className="flex justify-center items-center min-h-[60vh]">
        <p>Učitavanje...</p>
      </div>
    </EvaluatorLayout>
  );
}

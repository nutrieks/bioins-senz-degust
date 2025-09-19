-- Add hidden_from_reports column to samples table
ALTER TABLE public.samples 
ADD COLUMN hidden_from_reports BOOLEAN NOT NULL DEFAULT false;

-- Create evaluation_history table for backup system
CREATE TABLE public.evaluation_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  original_evaluation_id UUID NOT NULL,
  original_values JSONB NOT NULL,
  modified_values JSONB NOT NULL,
  modified_by UUID NOT NULL,
  modified_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reason TEXT,
  FOREIGN KEY (original_evaluation_id) REFERENCES public.evaluations(id) ON DELETE CASCADE
);

-- Enable RLS on evaluation_history table
ALTER TABLE public.evaluation_history ENABLE ROW LEVEL SECURITY;

-- Create policies for evaluation_history
CREATE POLICY "Admins can manage evaluation history" 
ON public.evaluation_history 
FOR ALL 
USING (is_admin()) 
WITH CHECK (is_admin());

-- Create index for better performance
CREATE INDEX idx_evaluation_history_original_id ON public.evaluation_history(original_evaluation_id);
CREATE INDEX idx_samples_hidden_from_reports ON public.samples(hidden_from_reports);
-- Add unique constraint to prevent duplicate evaluations
-- This will prevent the same user from evaluating the same sample multiple times
ALTER TABLE public.evaluations 
ADD CONSTRAINT unique_user_sample_evaluation 
UNIQUE (user_id, sample_id, event_id);

-- Add index for better performance on duplicate checks
CREATE INDEX IF NOT EXISTS idx_evaluations_user_sample_event 
ON public.evaluations (user_id, sample_id, event_id);
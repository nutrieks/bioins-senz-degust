-- First, create a temporary table with the duplicate record IDs to keep (latest timestamp)
WITH ranked_evaluations AS (
  SELECT 
    id,
    user_id,
    sample_id,
    event_id,
    timestamp,
    ROW_NUMBER() OVER (
      PARTITION BY user_id, sample_id, event_id 
      ORDER BY timestamp DESC
    ) as rn
  FROM public.evaluations
),
duplicates_to_delete AS (
  SELECT id 
  FROM ranked_evaluations 
  WHERE rn > 1
)
-- Delete all duplicate records except the most recent one
DELETE FROM public.evaluations 
WHERE id IN (SELECT id FROM duplicates_to_delete);

-- Now add the unique constraint to prevent future duplicates
ALTER TABLE public.evaluations 
ADD CONSTRAINT unique_user_sample_evaluation 
UNIQUE (user_id, sample_id, event_id);

-- Add index for better performance on duplicate checks
CREATE INDEX IF NOT EXISTS idx_evaluations_user_sample_event 
ON public.evaluations (user_id, sample_id, event_id);
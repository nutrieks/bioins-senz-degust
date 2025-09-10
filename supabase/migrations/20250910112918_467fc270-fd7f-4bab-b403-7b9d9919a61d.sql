-- Update evaluator usernames to use proper formatting (Evaluator-1, Evaluator-2, etc.)
UPDATE public.users 
SET username = 'Evaluator-' || SUBSTRING(username FROM 'evaluator(\d+)')
WHERE username ~ '^evaluator\d+$' 
AND SUBSTRING(username FROM 'evaluator(\d+)')::integer BETWEEN 1 AND 12;
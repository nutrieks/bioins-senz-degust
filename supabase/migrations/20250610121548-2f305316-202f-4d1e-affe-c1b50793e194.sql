
-- Update hasRandomization flag for product types that have randomizations
UPDATE product_types 
SET has_randomization = true 
WHERE id IN (
  SELECT DISTINCT product_type_id 
  FROM randomizations
);

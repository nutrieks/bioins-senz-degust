
-- Drop the existing constraint first
ALTER TABLE jar_attributes DROP CONSTRAINT IF EXISTS jar_attributes_type_check;

-- Allow NULL values in product_type_id column to support JAR attributes for base product types
ALTER TABLE jar_attributes ALTER COLUMN product_type_id DROP NOT NULL;

-- Add the check constraint to ensure at least one of the type IDs is present
ALTER TABLE jar_attributes ADD CONSTRAINT jar_attributes_type_check 
CHECK (product_type_id IS NOT NULL OR base_product_type_id IS NOT NULL);

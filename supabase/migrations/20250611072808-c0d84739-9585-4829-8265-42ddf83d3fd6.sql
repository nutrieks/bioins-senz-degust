
-- Add CASCADE deletion to foreign key constraints
-- This will ensure that when an event is deleted, all related data is automatically removed

-- Drop existing foreign key constraints and recreate with CASCADE
ALTER TABLE product_types DROP CONSTRAINT IF EXISTS product_types_event_id_fkey;
ALTER TABLE product_types ADD CONSTRAINT product_types_event_id_fkey 
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE;

ALTER TABLE samples DROP CONSTRAINT IF EXISTS samples_product_type_id_fkey;
ALTER TABLE samples ADD CONSTRAINT samples_product_type_id_fkey 
  FOREIGN KEY (product_type_id) REFERENCES product_types(id) ON DELETE CASCADE;

ALTER TABLE jar_attributes DROP CONSTRAINT IF EXISTS jar_attributes_product_type_id_fkey;
ALTER TABLE jar_attributes ADD CONSTRAINT jar_attributes_product_type_id_fkey 
  FOREIGN KEY (product_type_id) REFERENCES product_types(id) ON DELETE CASCADE;

ALTER TABLE randomizations DROP CONSTRAINT IF EXISTS randomizations_product_type_id_fkey;
ALTER TABLE randomizations ADD CONSTRAINT randomizations_product_type_id_fkey 
  FOREIGN KEY (product_type_id) REFERENCES product_types(id) ON DELETE CASCADE;

ALTER TABLE evaluations DROP CONSTRAINT IF EXISTS evaluations_event_id_fkey;
ALTER TABLE evaluations ADD CONSTRAINT evaluations_event_id_fkey 
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE;

ALTER TABLE evaluations DROP CONSTRAINT IF EXISTS evaluations_product_type_id_fkey;
ALTER TABLE evaluations ADD CONSTRAINT evaluations_product_type_id_fkey 
  FOREIGN KEY (product_type_id) REFERENCES product_types(id) ON DELETE CASCADE;

ALTER TABLE evaluations DROP CONSTRAINT IF EXISTS evaluations_sample_id_fkey;
ALTER TABLE evaluations ADD CONSTRAINT evaluations_sample_id_fkey 
  FOREIGN KEY (sample_id) REFERENCES samples(id) ON DELETE CASCADE;

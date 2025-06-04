
-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL,
  evaluator_position INTEGER,
  is_active BOOLEAN DEFAULT true,
  password TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create events table
CREATE TABLE IF NOT EXISTS events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL,
  status TEXT DEFAULT 'preparation',
  randomization_complete BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create base_product_types table
CREATE TABLE IF NOT EXISTS base_product_types (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create product_types table
CREATE TABLE IF NOT EXISTS product_types (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  customer_code TEXT NOT NULL,
  product_name TEXT NOT NULL,
  base_code TEXT NOT NULL,
  display_order INTEGER NOT NULL,
  base_product_type_id UUID REFERENCES base_product_types(id),
  has_randomization BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create samples table
CREATE TABLE IF NOT EXISTS samples (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_type_id UUID REFERENCES product_types(id) ON DELETE CASCADE,
  brand TEXT NOT NULL,
  retailer_code TEXT NOT NULL,
  blind_code TEXT,
  images_prepared TEXT,
  images_packaging TEXT,
  images_details TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create jar_attributes table
CREATE TABLE IF NOT EXISTS jar_attributes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_type_id UUID NOT NULL,
  name_hr TEXT NOT NULL,
  name_en TEXT NOT NULL,
  scale_hr TEXT[] NOT NULL,
  scale_en TEXT[] NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create randomizations table
CREATE TABLE IF NOT EXISTS randomizations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_type_id UUID REFERENCES product_types(id) ON DELETE CASCADE,
  randomization_table JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create evaluations table
CREATE TABLE IF NOT EXISTS evaluations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  sample_id UUID REFERENCES samples(id),
  product_type_id UUID REFERENCES product_types(id),
  event_id UUID REFERENCES events(id),
  hedonic_appearance INTEGER NOT NULL,
  hedonic_odor INTEGER NOT NULL,
  hedonic_texture INTEGER NOT NULL,
  hedonic_flavor INTEGER NOT NULL,
  hedonic_overall_liking INTEGER NOT NULL,
  jar_ratings JSONB NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default users
INSERT INTO users (username, role, evaluator_position, is_active, password) VALUES
('admin', 'admin', NULL, true, 'BioinsADMIN'),
('evaluator1', 'evaluator', 1, true, 'Bioins1'),
('evaluator2', 'evaluator', 2, true, 'Bioins2'),
('evaluator3', 'evaluator', 3, true, 'Bioins3'),
('evaluator4', 'evaluator', 4, true, 'Bioins4'),
('evaluator5', 'evaluator', 5, true, 'Bioins5'),
('evaluator6', 'evaluator', 6, true, 'Bioins6'),
('evaluator7', 'evaluator', 7, true, 'Bioins7'),
('evaluator8', 'evaluator', 8, true, 'Bioins8'),
('evaluator9', 'evaluator', 9, true, 'Bioins9'),
('evaluator10', 'evaluator', 10, true, 'Bioins10'),
('evaluator11', 'evaluator', 11, true, 'Bioins11'),
('evaluator12', 'evaluator', 12, true, 'Bioins12')
ON CONFLICT (username) DO NOTHING;

-- Insert test data for development
INSERT INTO events (id, date, status, randomization_complete) VALUES 
('123e4567-e89b-12d3-a456-426614174000', '2025-06-05', 'completed', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO base_product_types (id, product_name) VALUES 
('base_test_keksi', 'Test Keksi')
ON CONFLICT (id) DO NOTHING;

INSERT INTO product_types (id, event_id, customer_code, product_name, base_code, display_order, base_product_type_id, has_randomization) VALUES 
('product_test', '123e4567-e89b-12d3-a456-426614174000', '5001', 'Test Keksi', 'K', 1, 'base_test_keksi', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO samples (id, product_type_id, brand, retailer_code, blind_code) VALUES 
('sample_test1', 'product_test', 'Plazma', 'PL', '101'),
('sample_test2', 'product_test', 'Petit', 'LI', '102'),
('sample_test3', 'product_test', 'Oreo', 'KO', '103')
ON CONFLICT (id) DO NOTHING;

INSERT INTO jar_attributes (id, product_type_id, name_hr, name_en, scale_hr, scale_en) VALUES 
('attr_test1', 'product_test', 'Slatkoća', 'Sweetness', '{"Premalo slatko","Malo premalo slatko","Baš pravo","Malo preslatko","Preslatko"}', '{"Much too weak","Too weak","Just about right","Too strong","Much too strong"}'),
('attr_test2', 'product_test', 'Hrskavost', 'Crunchiness', '{"Premeko","Malo premeko","Baš pravo","Malo prehrskavo","Prehrskavo"}', '{"Much too soft","Too soft","Just about right","Too crunchy","Much too crunchy"}'),
('attr_test3', 'product_test', 'Okus čokolade', 'Chocolate flavor', '{"Premalo","Malo premalo","Baš pravo","Malo previše","Previše"}', '{"Much too weak","Too weak","Just about right","Too strong","Much too strong"}')
ON CONFLICT (id) DO NOTHING;

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE base_product_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE samples ENABLE ROW LEVEL SECURITY;
ALTER TABLE jar_attributes ENABLE ROW LEVEL SECURITY;
ALTER TABLE randomizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluations ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (since we handle auth manually)
CREATE POLICY "Enable all access for users table" ON users FOR ALL USING (true);
CREATE POLICY "Enable all access for events table" ON events FOR ALL USING (true);
CREATE POLICY "Enable all access for base_product_types table" ON base_product_types FOR ALL USING (true);
CREATE POLICY "Enable all access for product_types table" ON product_types FOR ALL USING (true);
CREATE POLICY "Enable all access for samples table" ON samples FOR ALL USING (true);
CREATE POLICY "Enable all access for jar_attributes table" ON jar_attributes FOR ALL USING (true);
CREATE POLICY "Enable all access for randomizations table" ON randomizations FOR ALL USING (true);
CREATE POLICY "Enable all access for evaluations table" ON evaluations FOR ALL USING (true);

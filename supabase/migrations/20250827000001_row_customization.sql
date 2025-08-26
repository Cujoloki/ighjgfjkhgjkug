/*
  # Row Customization and Enhanced Categorization

  1. New Tables
    - `row_field_definitions` - Defines custom fields that can be added to rows
      - `id` (uuid, primary key)
      - `name` (text, field name)
      - `field_type` (text, type of field: text, number, date, dropdown, checkbox)
      - `options` (jsonb, options for dropdown fields)
      - `is_required` (boolean, whether field is required)
      - `display_order` (integer, order to display fields)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `row_field_values` - Stores values for custom fields
      - `id` (uuid, primary key)
      - `row_id` (uuid, reference to rows table)
      - `field_id` (uuid, reference to row_field_definitions table)
      - `value` (jsonb, value of the field)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `row_categories` - Categories that rows can belong to
      - `id` (uuid, primary key)
      - `name` (text, unique category name)
      - `description` (text, optional description)
      - `color` (text, hex color for UI)
      - `created_at` (timestamp)

    - `row_category_assignments` - Many-to-many relationship between rows and categories
      - `id` (uuid, primary key)
      - `row_id` (uuid, reference to rows table)
      - `category_id` (uuid, reference to row_categories table)

  2. Table Updates
    - Add `position` to `rows` table to track order within a plot
    - Add `status` to `rows` table to track planting status (planned, planted, harvested, etc.)
*/

-- Create row_field_definitions table
CREATE TABLE IF NOT EXISTS row_field_definitions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  field_type text NOT NULL CHECK (field_type IN ('text', 'number', 'date', 'dropdown', 'checkbox')),
  options jsonb DEFAULT '[]'::jsonb,
  is_required boolean DEFAULT false,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create row_field_values table
CREATE TABLE IF NOT EXISTS row_field_values (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  row_id uuid REFERENCES rows(id) ON DELETE CASCADE,
  field_id uuid REFERENCES row_field_definitions(id) ON DELETE CASCADE,
  value jsonb DEFAULT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (row_id, field_id)
);

-- Create row_categories table
CREATE TABLE IF NOT EXISTS row_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text DEFAULT '',
  color text DEFAULT '#3B82F6',
  created_at timestamptz DEFAULT now()
);

-- Create row_category_assignments table
CREATE TABLE IF NOT EXISTS row_category_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  row_id uuid REFERENCES rows(id) ON DELETE CASCADE,
  category_id uuid REFERENCES row_categories(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE (row_id, category_id)
);

-- Add position and status to rows table
ALTER TABLE rows ADD COLUMN IF NOT EXISTS position integer DEFAULT 0;
ALTER TABLE rows ADD COLUMN IF NOT EXISTS status text DEFAULT 'planned' CHECK (status IN ('planned', 'planted', 'growing', 'harvested', 'removed'));

-- Enable RLS on new tables
ALTER TABLE row_field_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE row_field_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE row_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE row_category_assignments ENABLE ROW LEVEL SECURITY;

-- Policies for row_field_definitions
CREATE POLICY "Users can read all field definitions"
  ON row_field_definitions
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create field definitions"
  ON row_field_definitions
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update field definitions"
  ON row_field_definitions
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Users can delete field definitions"
  ON row_field_definitions
  FOR DELETE
  TO authenticated
  USING (true);

-- Policies for row_field_values
CREATE POLICY "Users can read all field values"
  ON row_field_values
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create field values"
  ON row_field_values
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update field values"
  ON row_field_values
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Users can delete field values"
  ON row_field_values
  FOR DELETE
  TO authenticated
  USING (true);

-- Policies for row_categories
CREATE POLICY "Users can read all row categories"
  ON row_categories
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create row categories"
  ON row_categories
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update row categories"
  ON row_categories
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Users can delete row categories"
  ON row_categories
  FOR DELETE
  TO authenticated
  USING (true);

-- Policies for row_category_assignments
CREATE POLICY "Users can read all row category assignments"
  ON row_category_assignments
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create row category assignments"
  ON row_category_assignments
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update row category assignments"
  ON row_category_assignments
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Users can delete row category assignments"
  ON row_category_assignments
  FOR DELETE
  TO authenticated
  USING (true);

-- Insert some default row categories
INSERT INTO row_categories (name, description, color) VALUES
  ('Seeded', 'Rows that have been seeded', '#10B981'),
  ('Transplanted', 'Rows with transplanted seedlings', '#F59E0B'),
  ('Perennial', 'Perennial crops', '#8B5CF6'),
  ('High Priority', 'Rows that need attention', '#EF4444'),
  ('Experimental', 'Experimental plantings', '#6366F1')
ON CONFLICT (name) DO NOTHING;

-- Insert some default field definitions
INSERT INTO row_field_definitions (name, field_type, is_required, display_order) VALUES
  ('Seed Source', 'text', false, 1),
  ('Germination Rate', 'number', false, 2),
  ('Spacing (inches)', 'number', false, 3),
  ('Fertilizer Used', 'text', false, 4),
  ('Watering Schedule', 'dropdown', false, 5),
  ('Organic', 'checkbox', false, 6)
ON CONFLICT DO NOTHING;

-- Set options for dropdown fields
UPDATE row_field_definitions 
SET options = '["Daily", "Every other day", "Weekly", "As needed"]'::jsonb 
WHERE name = 'Watering Schedule';
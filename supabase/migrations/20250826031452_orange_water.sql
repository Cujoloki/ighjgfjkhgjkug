/*
  # Add Plot Categorization System

  1. New Tables
    - `plot_categories` - Categories that plots can belong to
      - `id` (uuid, primary key)
      - `name` (text, unique category name)
      - `description` (text, optional description)
      - `color` (text, hex color for UI)
      - `created_at` (timestamp)

  2. Table Updates
    - Add `category_id` to `plots` table to link plots to categories
    - Add `plot_id` to `rows` table if not exists to link rows to plots

  3. Security
    - Enable RLS on `plot_categories` table
    - Add policies for authenticated users to manage categories
    - Update existing policies to handle categorization
*/

-- Create plot_categories table
CREATE TABLE IF NOT EXISTS plot_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text DEFAULT '',
  color text DEFAULT '#3B82F6',
  created_at timestamptz DEFAULT now()
);

-- Add category_id to plots table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'plots' AND column_name = 'category_id'
  ) THEN
    ALTER TABLE plots ADD COLUMN category_id uuid REFERENCES plot_categories(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Ensure plot_id exists in rows table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'rows' AND column_name = 'plot_id'
  ) THEN
    ALTER TABLE rows ADD COLUMN plot_id uuid REFERENCES plots(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Enable RLS on plot_categories
ALTER TABLE plot_categories ENABLE ROW LEVEL SECURITY;

-- Policies for plot_categories
CREATE POLICY "Users can read all categories"
  ON plot_categories
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create categories"
  ON plot_categories
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update categories"
  ON plot_categories
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Users can delete categories"
  ON plot_categories
  FOR DELETE
  TO authenticated
  USING (true);

-- Insert some default categories
INSERT INTO plot_categories (name, description, color) VALUES
  ('Vegetables', 'Vegetable crops and produce', '#10B981'),
  ('Fruits', 'Fruit trees and berry bushes', '#F59E0B'),
  ('Herbs', 'Culinary and medicinal herbs', '#8B5CF6'),
  ('Grains', 'Cereal crops and grains', '#D97706'),
  ('Flowers', 'Ornamental and cut flowers', '#EC4899')
ON CONFLICT (name) DO NOTHING;
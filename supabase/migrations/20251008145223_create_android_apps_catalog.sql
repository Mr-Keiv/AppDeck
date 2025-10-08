/*
  # Create Android Apps Catalog Schema

  ## Summary
  Creates a comprehensive catalog system for Android applications with all necessary metadata
  for display and launching.

  ## New Tables
  
  ### `android_apps`
  Stores information about Android applications in the catalog
  - `id` (uuid, primary key) - Unique identifier for each app
  - `titulo` (text) - App title/name
  - `descripcion_corta` (text) - Short description for card display
  - `descripcion_larga` (text) - Full description for detail view
  - `package_name` (text, unique) - Android package name for launching
  - `icono_url` (text) - URL to app icon image
  - `orden` (integer) - Display order in catalog
  - `activo` (boolean) - Whether app is active in catalog
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ## Security
  
  ### Row Level Security (RLS)
  - Enable RLS on `android_apps` table
  - Allow public read access (catalog is public)
  - Restrict write operations to authenticated users only

  ## Notes
  
  1. Package names must be unique to prevent duplicate entries
  2. The `orden` field allows manual sorting of apps in the catalog
  3. The `activo` field enables soft deletion without losing data
  4. Public read access allows unauthenticated users to browse the catalog
*/

CREATE TABLE IF NOT EXISTS android_apps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo text NOT NULL,
  descripcion_corta text NOT NULL,
  descripcion_larga text NOT NULL,
  package_name text UNIQUE NOT NULL,
  icono_url text NOT NULL,
  orden integer DEFAULT 0,
  activo boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE android_apps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active apps"
  ON android_apps
  FOR SELECT
  USING (activo = true);

CREATE POLICY "Authenticated users can insert apps"
  ON android_apps
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update apps"
  ON android_apps
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete apps"
  ON android_apps
  FOR DELETE
  TO authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS idx_android_apps_orden ON android_apps(orden);
CREATE INDEX IF NOT EXISTS idx_android_apps_activo ON android_apps(activo);
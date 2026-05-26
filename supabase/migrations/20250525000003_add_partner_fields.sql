-- Add missing columns to partners table
ALTER TABLE partners ADD COLUMN IF NOT EXISTS english_name TEXT;
ALTER TABLE partners ADD COLUMN IF NOT EXISTS website TEXT;
ALTER TABLE partners ADD COLUMN IF NOT EXISTS application_date DATE;

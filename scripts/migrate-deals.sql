-- Migration: Add new Deal columns to Supabase
-- Run this in the Supabase SQL Editor:
-- https://supabase.com/dashboard/project/ezkbjufluczpxdixplxu/sql/new

-- Add new columns (with safe IF NOT EXISTS via DO block)
DO $$
BEGIN
  -- Customer fields
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='deals' AND column_name='customer_id') THEN
    ALTER TABLE deals ADD COLUMN customer_id TEXT DEFAULT '';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='deals' AND column_name='customer_name') THEN
    ALTER TABLE deals ADD COLUMN customer_name TEXT DEFAULT '';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='deals' AND column_name='customer_industry') THEN
    ALTER TABLE deals ADD COLUMN customer_industry TEXT DEFAULT '';
  END IF;

  -- Lifecycle stage
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='deals' AND column_name='stage') THEN
    ALTER TABLE deals ADD COLUMN stage TEXT DEFAULT 'Registered';
  END IF;

  -- Date fields
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='deals' AND column_name='last_activity_date') THEN
    ALTER TABLE deals ADD COLUMN last_activity_date TEXT DEFAULT '';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='deals' AND column_name='expected_close_date') THEN
    ALTER TABLE deals ADD COLUMN expected_close_date TEXT DEFAULT '';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='deals' AND column_name='actual_close_date') THEN
    ALTER TABLE deals ADD COLUMN actual_close_date TEXT DEFAULT '';
  END IF;

  -- Location fields
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='deals' AND column_name='province') THEN
    ALTER TABLE deals ADD COLUMN province TEXT DEFAULT '';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='deals' AND column_name='city') THEN
    ALTER TABLE deals ADD COLUMN city TEXT DEFAULT '';
  END IF;

  -- Lifecycle JSON
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='deals' AND column_name='lifecycle') THEN
    ALTER TABLE deals ADD COLUMN lifecycle JSONB DEFAULT '[]'::jsonb;
  END IF;

  -- Conflict tracking
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='deals' AND column_name='conflict_id') THEN
    ALTER TABLE deals ADD COLUMN conflict_id TEXT;
  END IF;

  -- Notes & next action
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='deals' AND column_name='notes') THEN
    ALTER TABLE deals ADD COLUMN notes TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='deals' AND column_name='next_action') THEN
    ALTER TABLE deals ADD COLUMN next_action TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='deals' AND column_name='next_action_date') THEN
    ALTER TABLE deals ADD COLUMN next_action_date TEXT;
  END IF;
END $$;

-- Migrate existing data: copy old customer → customer_name
UPDATE deals SET customer_name = customer WHERE customer_name = '' AND customer IS NOT NULL AND customer != '';

-- Migrate existing data: copy old end_date → expected_close_date
UPDATE deals SET expected_close_date = end_date WHERE expected_close_date = '' AND end_date IS NOT NULL AND end_date != '';

-- Migrate existing data: set last_activity_date from updated_at
UPDATE deals SET last_activity_date = updated_at::date::text WHERE last_activity_date = '' AND updated_at IS NOT NULL;

-- Set default stage for existing deals based on status
UPDATE deals SET stage = 'Registered' WHERE stage = 'Registered' AND status = 'Pending';
UPDATE deals SET stage = 'Approved' WHERE stage = 'Registered' AND status = 'Approved';
UPDATE deals SET stage = 'ClosedWon' WHERE stage = 'Registered' AND (status = 'Converted' OR status = 'Closed Won');
UPDATE deals SET stage = 'ClosedLost' WHERE stage = 'Registered' AND status = 'Closed Lost';

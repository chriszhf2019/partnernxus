-- PartnerNexus Initial Schema
-- Core tables for partner management platform

-- ─── Partners ────────────────────────────────────────
CREATE TABLE partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  logo TEXT,
  tier TEXT NOT NULL DEFAULT 'Registered',
  status TEXT NOT NULL DEFAULT 'Prospective',
  type TEXT NOT NULL DEFAULT 'Reseller',
  manager TEXT,
  location TEXT,
  region TEXT,
  province TEXT,
  city TEXT,
  district TEXT,
  start_date DATE,
  years INT DEFAULT 0,
  prev_tier TEXT,
  tags TEXT[] DEFAULT '{}',
  win_rate INT DEFAULT 0,
  unified_social_credit_code TEXT,
  industry TEXT,
  registered_address TEXT,
  cooperation_scope TEXT,
  is_core_partner BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Partner Contacts ────────────────────────────────
CREATE TABLE partner_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID REFERENCES partners(id) ON DELETE CASCADE,
  salutation TEXT,
  first_name TEXT NOT NULL DEFAULT '',
  last_name TEXT NOT NULL DEFAULT '',
  title TEXT,
  department TEXT,
  phone TEXT,
  mobile TEXT,
  email TEXT,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Deals ───────────────────────────────────────────
CREATE TABLE deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  customer TEXT NOT NULL,
  value DECIMAL(12,2) DEFAULT 0,
  partner_id UUID REFERENCES partners(id),
  partner_name TEXT,
  partner_type TEXT,
  status TEXT NOT NULL DEFAULT 'Pending',
  region TEXT,
  sales_name TEXT,
  sales_team TEXT,
  product_type TEXT,
  created_date DATE DEFAULT CURRENT_DATE,
  end_date DATE,
  is_priority BOOLEAN DEFAULT false,
  has_conflict BOOLEAN DEFAULT false,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Deal Lifecycle Events ───────────────────────────
CREATE TABLE deal_lifecycle_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID REFERENCES deals(id) ON DELETE CASCADE,
  stage TEXT NOT NULL,
  event_date DATE DEFAULT CURRENT_DATE,
  description TEXT,
  actor TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── MDF Allocations ─────────────────────────────────
CREATE TABLE mdf_allocations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID REFERENCES partners(id),
  partner_name TEXT,
  quarter TEXT NOT NULL,
  amount DECIMAL(12,2) DEFAULT 0,
  status TEXT DEFAULT 'available',
  applications INT DEFAULT 0,
  approved_apps INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── PMDF Applications ───────────────────────────────
CREATE TABLE pmdf_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID REFERENCES partners(id),
  event_name TEXT NOT NULL,
  event_date DATE,
  location TEXT,
  budget_requested DECIMAL(12,2),
  budget_approved DECIMAL(12,2),
  status TEXT DEFAULT 'draft',
  cost_breakdown JSONB DEFAULT '[]',
  invited_customers JSONB DEFAULT '[]',
  agenda JSONB DEFAULT '[]',
  mini_program_id TEXT,
  attendance INT DEFAULT 0,
  leads INT DEFAULT 0,
  submitted_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Marketing Activities ────────────────────────────
CREATE TABLE marketing_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT,
  event_date DATE,
  status TEXT DEFAULT 'Planning',
  budget DECIMAL(12,2),
  actual_spend DECIMAL(12,2),
  leads_generated INT DEFAULT 0,
  progress INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Incentive Programs ──────────────────────────────
CREATE TABLE incentive_programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  trigger_type TEXT,
  status TEXT DEFAULT 'Active',
  payout_type TEXT,
  total_budget DECIMAL(12,2),
  claimed_amount DECIMAL(12,2),
  participants_count INT DEFAULT 0,
  description TEXT,
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Mini Program Events ─────────────────────────────
CREATE TABLE mp_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pmdf_application_id UUID REFERENCES pmdf_applications(id),
  title TEXT NOT NULL,
  event_date DATE,
  location TEXT,
  status TEXT DEFAULT 'upcoming',
  qr_code_data TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Mini Program Users ──────────────────────────────
CREATE TABLE mp_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  open_id TEXT UNIQUE,
  nick_name TEXT,
  avatar_url TEXT,
  company_id UUID REFERENCES partners(id),
  company_name TEXT,
  total_score INT DEFAULT 0,
  score_level TEXT DEFAULT 'bronze',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Mini Program Scores ─────────────────────────────
CREATE TABLE mp_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES mp_users(id),
  event_id UUID REFERENCES mp_events(id),
  action TEXT NOT NULL,
  points INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Mini Program Gifts ──────────────────────────────
CREATE TABLE mp_gifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  cost INT DEFAULT 0,
  stock INT DEFAULT 0,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Mini Program Orders ─────────────────────────────
CREATE TABLE mp_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES mp_users(id),
  gift_id UUID REFERENCES mp_gifts(id),
  cost INT DEFAULT 0,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Global Settings ─────────────────────────────────
CREATE TABLE settings (
  id TEXT PRIMARY KEY DEFAULT 'global',
  data JSONB DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Indexes ─────────────────────────────────────────
CREATE INDEX idx_partners_tier ON partners(tier);
CREATE INDEX idx_partners_status ON partners(status);
CREATE INDEX idx_partners_type ON partners(type);
CREATE INDEX idx_partners_region ON partners(region);
CREATE INDEX idx_deals_partner ON deals(partner_id);
CREATE INDEX idx_deals_status ON deals(status);
CREATE INDEX idx_pmdf_app_partner ON pmdf_applications(partner_id);
CREATE INDEX idx_mp_scores_user ON mp_scores(user_id);

-- ─── Row Level Security ──────────────────────────────
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE mdf_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE pmdf_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE mp_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE mp_orders ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read all partners
CREATE POLICY "Allow read partners" ON partners FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow insert partners" ON partners FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow update partners" ON partners FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow read deals" ON deals FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow insert deals" ON deals FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow update deals" ON deals FOR UPDATE USING (auth.role() = 'authenticated');

-- Allow public read for mini program (uses API key auth)
CREATE POLICY "Allow public read mp" ON mp_events FOR SELECT USING (true);

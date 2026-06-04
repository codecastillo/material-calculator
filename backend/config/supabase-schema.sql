-- EstiCount Database Schema for Supabase
-- Run this in Supabase Dashboard → SQL Editor

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Onboarding / company profile columns (added in v4 onboarding)
ALTER TABLE users ADD COLUMN IF NOT EXISTS company_name TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS company_address TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS company_phone TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS company_email TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS contractor_license TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;

-- Stripe billing columns (added in v5 subscription lifecycle)
-- stripe_customer_id links the user to their Stripe Customer object so we can
-- look them up on subscription events (canceled, past_due, etc.) and open a
-- billing portal session.
ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;
-- Values mirror Stripe subscription statuses: active, past_due, canceled, etc.
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_status TEXT;
-- Subscription webhooks look the user up by Stripe customer id on every event.
CREATE INDEX IF NOT EXISTS idx_users_stripe_customer ON users (stripe_customer_id);

CREATE TABLE IF NOT EXISTS suppliers (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS materials (
    id SERIAL PRIMARY KEY,
    supplier_id INTEGER REFERENCES suppliers(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    sku TEXT DEFAULT '',
    unit TEXT DEFAULT 'each',
    price_per_unit DECIMAL(10,2) DEFAULT 0,
    category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    coverage_per_unit DECIMAL(10,2) DEFAULT 100,
    calc_type TEXT DEFAULT 'sqft',
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Optional package size so the engineering model can convert net material need
-- (gallons, screws, linear ft) into the product's real container. Null falls
-- back to parsing the size from the product name.
ALTER TABLE materials ADD COLUMN IF NOT EXISTS package_value NUMERIC;
ALTER TABLE materials ADD COLUMN IF NOT EXISTS package_unit TEXT;

CREATE TABLE IF NOT EXISTS jobs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    project_name TEXT DEFAULT '',
    project_address TEXT DEFAULT '',
    supplier_id INTEGER REFERENCES suppliers(id) ON DELETE SET NULL,
    sqft DECIMAL(10,2) DEFAULT 0,
    linear_ft DECIMAL(10,2) DEFAULT 0,
    waste_pct DECIMAL(5,2) DEFAULT 10,
    profit_pct DECIMAL(5,2) DEFAULT 20,
    tax_pct DECIMAL(5,2) DEFAULT 0,
    labor_rate DECIMAL(10,2) DEFAULT 0,
    selected_phases TEXT DEFAULT '[]',
    material_total DECIMAL(10,2) DEFAULT 0,
    selling_price DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS supplier_categories (
    supplier_id INTEGER REFERENCES suppliers(id) ON DELETE CASCADE,
    category_id INTEGER REFERENCES categories(id) ON DELETE CASCADE,
    PRIMARY KEY (supplier_id, category_id)
);

-- Onboarding magic-link tokens for Stripe purchases.
-- A token is created when a Stripe checkout completes; the buyer clicks
-- the magic link in their email to finish creating their account.
CREATE TABLE IF NOT EXISTS onboarding_tokens (
    id SERIAL PRIMARY KEY,
    token TEXT UNIQUE NOT NULL,
    email TEXT NOT NULL,
    license_key TEXT NOT NULL,
    stripe_session_id TEXT UNIQUE,
    expires_at TIMESTAMPTZ NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Stripe columns on onboarding_tokens: carried over to the user row on redeem
-- so subscription lifecycle events (cancel, update) can find the user by
-- stripe_customer_id.
ALTER TABLE onboarding_tokens ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
ALTER TABLE onboarding_tokens ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;

CREATE INDEX IF NOT EXISTS idx_onboarding_tokens_token ON onboarding_tokens(token);
CREATE INDEX IF NOT EXISTS idx_onboarding_tokens_session ON onboarding_tokens(stripe_session_id);

-- Per-code attempt cap (anti-bruteforce). A wrong guess increments attempts; once
-- it reaches the cap the code is deleted, so a distributed attacker can't outrun the
-- per-IP rate limit to brute-force the 6-digit code before it expires. verification_codes
-- is created outside this file, hence IF EXISTS.
ALTER TABLE IF EXISTS verification_codes ADD COLUMN IF NOT EXISTS attempts INTEGER NOT NULL DEFAULT 0;

-- Row Level Security as defense in depth.
-- The backend connects with the Supabase secret (service) key, which bypasses
-- RLS, so enabling it does not change how the API reads or writes data. With RLS
-- on and no permissive policies, the public/anon key gets no access to any table,
-- so an exposed anon key cannot read user data. No policies are added because the
-- app does not use Supabase Auth or the anon key. IF EXISTS guards the tables that
-- are created outside this file so re-running the script never errors.
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS license_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS verification_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS price_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS invoices ENABLE ROW LEVEL SECURITY;

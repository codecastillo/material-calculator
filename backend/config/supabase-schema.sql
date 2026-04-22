-- EstiCount Database Schema for Supabase
-- Run this in Supabase Dashboard → SQL Editor

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

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

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_categories ENABLE ROW LEVEL SECURITY;

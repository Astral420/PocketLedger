-- 001_init.sql
-- PostgreSQL schema for your Budget Tracker (no wallets tab)
-- Safe to run on a fresh database.

BEGIN;

-- Extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto"; -- for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "citext";   -- for case-insensitive email (optional but nice)

-- =========================
-- USERS + AUTH
-- =========================

CREATE TABLE IF NOT EXISTS users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name     TEXT NULL,
  email         CITEXT NOT NULL UNIQUE,
  password_hash TEXT NULL, -- nullable if Google-only accounts exist
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- OAuth identities (Google)
CREATE TABLE IF NOT EXISTS oauth_accounts (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider         TEXT NOT NULL CHECK (provider IN ('google')),
  provider_user_id TEXT NOT NULL,
  email            CITEXT NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (provider, provider_user_id)
);

-- Refresh tokens (store hash, not raw token)
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash  TEXT NOT NULL,
  expires_at  TIMESTAMPTZ NOT NULL,
  revoked_at  TIMESTAMPTZ NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  user_agent  TEXT NULL,
  ip_address  TEXT NULL
);

CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user ON refresh_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_expires ON refresh_tokens(expires_at);

-- =========================
-- CATEGORIES + QUICK ADD
-- =========================

CREATE TABLE IF NOT EXISTS categories (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  description TEXT NULL,
  icon_key    TEXT NULL,
  color       TEXT NULL,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, name)
);

-- "Quick Add Expenses" pins
CREATE TABLE IF NOT EXISTS category_quick_add (
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  sort_order  INT  NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, category_id)
);

CREATE INDEX IF NOT EXISTS idx_quick_add_user_sort ON category_quick_add(user_id, sort_order);

-- =========================
-- TRANSACTIONS
-- =========================

CREATE TABLE IF NOT EXISTS transactions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id UUID NULL REFERENCES categories(id) ON DELETE SET NULL,

  type        TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  amount      NUMERIC(12,2) NOT NULL CHECK (amount > 0),

  occurred_at TIMESTAMPTZ NOT NULL,
  note        TEXT NULL,
  source      TEXT NULL, -- e.g. 'manual', 'quick_add', 'transpo'

  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_transactions_user_time
  ON transactions(user_id, occurred_at DESC);

CREATE INDEX IF NOT EXISTS idx_transactions_user_category_time
  ON transactions(user_id, category_id, occurred_at DESC);

-- =========================
-- BUDGETS
-- =========================

CREATE TABLE IF NOT EXISTS budgets (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  period_type       TEXT NOT NULL CHECK (period_type IN ('weekly', 'monthly')),
  period_start      DATE NOT NULL,
  period_end        DATE NOT NULL,
  allowance_amount  NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (allowance_amount >= 0),

  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CHECK (period_start <= period_end),
  UNIQUE (user_id, period_type, period_start, period_end)
);

CREATE INDEX IF NOT EXISTS idx_budgets_user_period
  ON budgets(user_id, period_type, period_start DESC);

CREATE TABLE IF NOT EXISTS budget_items (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  budget_id   UUID NOT NULL REFERENCES budgets(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  amount      NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (amount >= 0),

  UNIQUE (budget_id, category_id)
);

CREATE INDEX IF NOT EXISTS idx_budget_items_budget ON budget_items(budget_id);

-- =========================
-- TRANSPORT (Biyahe Logger)
-- =========================

CREATE TABLE IF NOT EXISTS transit_lines (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code      TEXT NOT NULL UNIQUE,  -- e.g. 'LRT-1'
  name      TEXT NOT NULL,         -- e.g. 'LRT Line 1'
  color     TEXT NULL,             -- hex
  is_active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS transit_stations (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  line_id    UUID NOT NULL REFERENCES transit_lines(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  sort_order INT  NOT NULL DEFAULT 0,
  is_active  BOOLEAN NOT NULL DEFAULT TRUE,
  UNIQUE (line_id, name)
);

CREATE INDEX IF NOT EXISTS idx_transit_stations_line_sort
  ON transit_stations(line_id, sort_order);

CREATE TABLE IF NOT EXISTS transit_routes (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type                   TEXT NOT NULL CHECK (type IN ('lrt_mrt', 'p2p_bus')),

  -- Optional for LRT/MRT
  line_id                UUID NULL REFERENCES transit_lines(id) ON DELETE SET NULL,
  origin_station_id      UUID NULL REFERENCES transit_stations(id) ON DELETE SET NULL,
  destination_station_id UUID NULL REFERENCES transit_stations(id) ON DELETE SET NULL,

  display_name           TEXT NOT NULL,     -- e.g. 'Glorietta 3 → Alabang Town Center'
  provider_name          TEXT NULL,         -- e.g. 'RRCG Transport'
  default_fare           NUMERIC(12,2) NOT NULL CHECK (default_fare >= 0),
  is_active              BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE INDEX IF NOT EXISTS idx_transit_routes_type_active
  ON transit_routes(type, is_active);

-- Transport metadata for a transaction (only present for transpo logs)
CREATE TABLE IF NOT EXISTS transaction_transport (
  transaction_id         UUID PRIMARY KEY REFERENCES transactions(id) ON DELETE CASCADE,
  line_id                UUID NULL REFERENCES transit_lines(id) ON DELETE SET NULL,
  route_id               UUID NULL REFERENCES transit_routes(id) ON DELETE SET NULL,
  origin_station_id      UUID NULL REFERENCES transit_stations(id) ON DELETE SET NULL,
  destination_station_id UUID NULL REFERENCES transit_stations(id) ON DELETE SET NULL
);

-- =========================
-- OPTIONAL: updated_at helper trigger (nice-to-have)
-- =========================

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to tables that have updated_at
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_users_updated_at') THEN
    CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_categories_updated_at') THEN
    CREATE TRIGGER trg_categories_updated_at
    BEFORE UPDATE ON categories
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_transactions_updated_at') THEN
    CREATE TRIGGER trg_transactions_updated_at
    BEFORE UPDATE ON transactions
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_budgets_updated_at') THEN
    CREATE TRIGGER trg_budgets_updated_at
    BEFORE UPDATE ON budgets
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
  END IF;
END $$;

COMMIT;


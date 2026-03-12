-- 005_email_verification_codes.sql
BEGIN;

CREATE TABLE IF NOT EXISTS email_verification_codes (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  code_hash  TEXT        NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_email_verification_codes_user
  ON email_verification_codes(user_id);

CREATE INDEX IF NOT EXISTS idx_email_verification_codes_expires
  ON email_verification_codes(expires_at);

COMMIT;
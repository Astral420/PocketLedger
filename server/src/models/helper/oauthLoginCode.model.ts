import crypto from "crypto";
import pool from "../../config/DB";

const DEFAULT_OAUTH_CODE_TTL_SECONDS = 60;

const hashCode = (code: string) =>
  crypto.createHash("sha256").update(code).digest("hex");

export const createOAuthLoginCode = async (
  userId: string,
  ttlSeconds = DEFAULT_OAUTH_CODE_TTL_SECONDS
) => {
  const code = crypto.randomBytes(32).toString("hex");
  const codeHash = hashCode(code);
  const expiresAt = new Date(Date.now() + ttlSeconds * 1000);

  const query = `
    INSERT INTO oauth_login_codes (user_id, code_hash, expires_at)
    VALUES ($1, $2, $3)
  `;

  await pool.query(query, [userId, codeHash, expiresAt]);
  return code;
};

export const consumeOAuthLoginCode = async (code: string) => {
  const codeHash = hashCode(code);

  const query = `
    DELETE FROM oauth_login_codes
    WHERE code_hash = $1
      AND expires_at > NOW()
    RETURNING user_id
  `;

  const { rows } = await pool.query<{ user_id: string }>(query, [codeHash]);
  return rows[0]?.user_id ?? null;
};

import bcrypt from "bcrypt";
import pool from "../../config/DB";

const DEFAULT_REFRESH_TTL_DAYS = 30;

export interface RefreshTokenRow {
  id: string;
  user_id: string;
  token_hash: string;
  expires_at: Date;
  revoked_at: Date | null;
  created_at: Date;
  user_agent: string | null;
  ip_address: string | null;
}

type StoreRefreshTokenOptions = {
  ttlDays?: number;
  userAgent?: string | null;
  ipAddress?: string | null;
};

export const storeRefreshToken = async (
  userId: string,
  refreshToken: string,
  options: StoreRefreshTokenOptions = {}
) => {
  const tokenHash = await bcrypt.hash(refreshToken, 10);
  const ttlDays = options.ttlDays ?? DEFAULT_REFRESH_TTL_DAYS;
  const expiresAt = new Date(Date.now() + ttlDays * 24 * 60 * 60 * 1000);

  const query = `
    INSERT INTO refresh_tokens (user_id, token_hash, expires_at, user_agent, ip_address)
    VALUES ($1, $2, $3, $4, $5)
  `;
  const values = [userId, tokenHash, expiresAt, options.userAgent ?? null, options.ipAddress ?? null];

  await pool.query(query, values);
};

export const findRefreshToken = async (userId: string): Promise<RefreshTokenRow[]> => {
  const query = `
    SELECT id, user_id, token_hash, expires_at, revoked_at, created_at, user_agent, ip_address
    FROM refresh_tokens
    WHERE user_id = $1
      AND revoked_at IS NULL
      AND expires_at > NOW()
    ORDER BY created_at DESC
  `;
  const { rows } = await pool.query<RefreshTokenRow>(query, [userId]);
  return rows;
};

export const deleteRefreshToken = async (userId: string, tokenHash: string) => {
  const query = `
    DELETE FROM refresh_tokens
    WHERE user_id = $1 AND token_hash = $2
  `;
  await pool.query(query, [userId, tokenHash]);
};

export const deleteAllUserRefreshTokens = async (userId: string) => {
  const query = `
    DELETE FROM refresh_tokens
    WHERE user_id = $1
  `;
  await pool.query(query, [userId]);
};

export const revokeRefreshToken = async (userId: string, tokenHash: string) => {
  const query = `
    UPDATE refresh_tokens SET revoked_at = NOW()
    WHERE user_id = $1 AND token_hash = $2
    AND revoked_at IS NULL
  `;
  await pool.query(query, [userId, tokenHash]);
}

export const revokeAllUserRefreshTokens = async (userId: string) => {
  const query = `
   UPDATE refresh_tokens SET revoked_at NOW()
   WHERE user_id = $1 AND revoked_at IS NULL
  `;
  await pool.query(query, [userId]);
}

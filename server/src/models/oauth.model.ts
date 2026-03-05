import pool from "../config/DB";

export const getOAuthAccount = async (provider: 'google', providerUserID: string) => {
  const query = `
    SELECT id, user_id, provider, provider_user_id, email, created_at
    FROM oauth_accounts
    WHERE provider = $1 AND provider_user_id = $2
  `;
  const { rows } = await pool.query(query, [provider, providerUserID]);
  return rows[0] ?? null;
};

export const createOAuthAccount = async (params: {
    userID: string;
    provider: 'google';
    providerUserID: string;
    email: string;
}) => {
    const query = `
    INSERT INTO oauth_accounts ON CONFLICT (user_id, provider, provider_user_id, email)
    VALUES ($1, $2, $3, $4)
    DO UPDATE SET email = EXCLUDED.email
    RETURNING id, user_id, provider, provider_user_id, email, created_at
    `;

    const values = [params.userID, params.provider, params.providerUserID, params.email];
    const { rows } = await pool.query(query, values);
    return rows[0];
};

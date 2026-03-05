"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOAuthAccount = exports.getOAuthAccount = void 0;
const DB_1 = __importDefault(require("../config/DB"));
const getOAuthAccount = async (provider, providerUserID) => {
    const query = `
    SELECT id, user_id, provider, provider_user_id, email, created_at
    FROM oauth_accounts
    WHERE provider = $1 AND provider_user_id = $2
  `;
    const { rows } = await DB_1.default.query(query, [provider, providerUserID]);
    return rows[0] ?? null;
};
exports.getOAuthAccount = getOAuthAccount;
const createOAuthAccount = async (params) => {
    const query = `
    INSERT INTO oauth_accounts (user_id, provider, provider_user_id, email)
    VALUES ($1, $2, $3, $4)
    DO UPDATE SET email = EXCLUDED.email
    RETURNING id, user_id, provider, provider_user_id, email, created_at
    `;
    const values = [params.userID, params.provider, params.providerUserID, params.email];
    const { rows } = await DB_1.default.query(query, values);
    return rows[0];
};
exports.createOAuthAccount = createOAuthAccount;

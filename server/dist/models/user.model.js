"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.markUserEmailVerified = exports.getUserById = exports.updateUser = exports.updateUserImage = exports.deleteUser = exports.getAllUsers = exports.getUserByEmail = exports.createOAuthUser = exports.createUser = void 0;
const DB_1 = __importDefault(require("../config/DB"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const createUser = async (full_name, email, password) => {
    const hashedPassword = await bcrypt_1.default.hash(password, 10);
    const query = `INSERT INTO users (full_name, email, password_hash) 
                   VALUES ($1, $2, $3) RETURNING id, full_name, email, role ,created_at`;
    const values = [full_name, email, hashedPassword];
    const { rows } = await DB_1.default.query(query, values);
    return rows[0];
};
exports.createUser = createUser;
const createOAuthUser = async (full_name, email, profileImage) => {
    const query = `
       INSERT INTO users (full_name, email , password_hash , profile_image, email_verified)
       VALUES ($1, $2, NULL, $3, TRUE)
       RETURNING id, full_name, email, profile_image, email_verified, created_at
    
    `;
    const values = [full_name, email, profileImage];
    const { rows } = await DB_1.default.query(query, values);
    return rows[0];
};
exports.createOAuthUser = createOAuthUser;
const getUserByEmail = async (email) => {
    const query = "SELECT * FROM users WHERE email = $1";
    const values = [email];
    const { rows } = await DB_1.default.query(query, values);
    return rows[0] ?? null;
};
exports.getUserByEmail = getUserByEmail;
const getAllUsers = async () => {
    const query = "SELECT id, full_name, email, created_at FROM users";
    const { rows } = await DB_1.default.query(query);
    return rows;
};
exports.getAllUsers = getAllUsers;
const deleteUser = async (id) => {
    const query = "DELETE FROM users WHERE id = $1 RETURNING *";
    const values = [id];
    const { rows } = await DB_1.default.query(query, values);
    return rows[0];
};
exports.deleteUser = deleteUser;
const updateUserImage = async (id, profile_image) => {
    const query = `UPDATE users SET profile_image = $2, updated_at = NOW() 
                   WHERE id = $1 RETURNING id, full_name, email, role, profile_image, updated_at`;
    const values = [id, profile_image];
    const { rows } = await DB_1.default.query(query, values);
    return rows[0] ?? null;
};
exports.updateUserImage = updateUserImage;
const updateUser = async (id, full_name, email, password) => {
    const hashedPassword = password ? await bcrypt_1.default.hash(password, 10) : null;
    const query = `
    UPDATE users
    SET full_name = $2,
        password_hash = COALESCE($3, password_hash),
        email = $4, 
        updated_at = NOW()
    WHERE id = $1
    RETURNING id, full_name, email, profile_image, updated_at
    `;
    const values = [id, full_name, hashedPassword, email];
    const { rows } = await DB_1.default.query(query, values);
    return rows[0] ?? null;
};
exports.updateUser = updateUser;
const getUserById = async (id) => {
    const query = `
    SELECT id, full_name, email, role, profile_image, email_verified
    FROM users
    WHERE id = $1
    LIMIT 1
  `;
    const { rows } = await DB_1.default.query(query, [id]);
    return rows[0] ?? null;
};
exports.getUserById = getUserById;
// helper
const markUserEmailVerified = async (id) => {
    const query = `
    UPDATE users
    SET email_verified = TRUE, updated_at = NOW()
    WHERE id = $1
    RETURNING id, email_verified, updated_at
  `;
    const { rows } = await DB_1.default.query(query, [id]);
    return rows[0] ?? null;
};
exports.markUserEmailVerified = markUserEmailVerified;

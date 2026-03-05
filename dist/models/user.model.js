"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserImage = exports.deleteUser = exports.getAllUsers = exports.getUserByEmail = exports.createUser = void 0;
const DB_1 = __importDefault(require("../config/DB"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const createUser = async (full_name, email, password) => {
    const hashedPassword = await bcrypt_1.default.hash(password, 10);
    const query = `INSERT INTO users (full_name, email, password_hash) 
                   VALUES ($1, $2, $3) RETURNING id, full_name, email, created_at`;
    const values = [full_name, email, hashedPassword];
    const { rows } = await DB_1.default.query(query, values);
    return rows[0];
};
exports.createUser = createUser;
const getUserByEmail = async (email) => {
    const query = "SELECT * FROM users WHERE email = $1";
    const values = [email];
    const { rows } = await DB_1.default.query(query, values);
    return rows[0];
};
exports.getUserByEmail = getUserByEmail;
const getAllUsers = async () => {
    const query = "SELECT id, full_name, email, created_at FROM users";
    const { rows } = await DB_1.default.query(query);
    return rows;
};
exports.getAllUsers = getAllUsers;
0;
const deleteUser = async (id) => {
    const query = "DELETE FROM users WHERE id = $1 RETURNING *";
    const values = [id];
    const { rows } = await DB_1.default.query(query, values);
    return rows[0];
};
exports.deleteUser = deleteUser;
const updateUserImage = async (id, profile_image) => {
    const query = `UPDATE users SET profile_image = $2, updated_at = NOW() 
                   WHERE id = $1 RETURNING id, profile_image, updated_at`;
    const values = [id, profile_image];
    const { rows } = await DB_1.default.query(query, values);
    return rows[0];
};
exports.updateUserImage = updateUserImage;

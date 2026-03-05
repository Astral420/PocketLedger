"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = exports.register = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_model_1 = require("../models/user.model");
const bcrypt_1 = __importDefault(require("bcrypt"));
const register = async (req, res) => {
    try {
        const { full_name, email, password } = req.body;
        const user = await (0, user_model_1.getUserByEmail)(email);
        if (user.rows.length > 0)
            return res.status(409).json({ error: 'User already exists' });
        const newUser = await (0, user_model_1.createUser)(full_name, email, password);
        res.status(201).json({ message: 'User created successfully', userId: newUser.id });
    }
    catch (err) {
        return res.status(500).json({ error: 'Internal server error', message: err });
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await (0, user_model_1.getUserByEmail)(email);
        if (!user)
            return res.status(401).json({ error: 'Invalid credentials' });
        const isPasswordValid = await bcrypt_1.default.compare(password, user.password_hash);
        if (!isPasswordValid)
            return res.status(401).json({ error: 'Invalid credentials' });
        const accessToken = jsonwebtoken_1.default.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '15m' });
        const refreshToken = jsonwebtoken_1.default.sign({ userId: user.id }, process.env.JWT_SECRET_REFRESH, { expiresIn: '30d' });
    }
    catch (err) {
    }
};
exports.login = login;

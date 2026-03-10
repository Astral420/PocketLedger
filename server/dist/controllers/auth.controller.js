"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OAuthFailure = exports.googleOAuthExchange = exports.googleOAuthCallback = exports.refresh = exports.logout = exports.login = exports.register = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const user_model_1 = require("../models/user.model");
const refreshToken_model_1 = require("../models/helper/refreshToken.model");
const oauthLoginCode_model_1 = require("../models/helper/oauthLoginCode.model");
const signAccessToken = (userId) => jsonwebtoken_1.default.sign({ sub: userId }, process.env.JWT_SECRET, { expiresIn: "15m" });
const signRefreshToken = (userId) => jsonwebtoken_1.default.sign({ sub: userId }, process.env.JWT_SECRET_REFRESH, { expiresIn: "30d" });
const register = async (req, res) => {
    try {
        const { full_name, email, password } = req.body;
        const existingUser = await (0, user_model_1.getUserByEmail)(email);
        if (existingUser)
            return res.status(409).json({ error: "User already exists" });
        const newUser = await (0, user_model_1.createUser)(full_name, email, password);
        res.status(201).json({ message: "User created successfully", userId: newUser.id });
    }
    catch (err) {
        return res.status(500).json({ error: "Internal server error", message: err });
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }
        const user = await (0, user_model_1.getUserByEmail)(email);
        if (!user)
            return res.status(401).json({ error: "Invalid credentials" });
        if (!user.password_hash) {
            return res.status(401).json({ error: "Invalid credentials" });
        }
        const isPasswordValid = await bcrypt_1.default.compare(password, user.password_hash);
        if (!isPasswordValid)
            return res.status(401).json({ error: "Invalid credentials" });
        const accessToken = signAccessToken(user.id);
        const refreshToken = signRefreshToken(user.id);
        await (0, refreshToken_model_1.storeRefreshToken)(user.id, refreshToken, {
            userAgent: req.get("user-agent") ?? null,
            ipAddress: req.ip ?? null,
        });
        return res.status(200).json({
            accessToken,
            refreshToken,
            user: {
                id: user.id,
                email: user.email,
                full_name: user.full_name
            },
        });
    }
    catch (err) {
        return res.status(500).json({ error: "Internal server error", message: err });
    }
};
exports.login = login;
const logout = async (req, res) => {
    const bodyToken = req.body?.refreshToken ?? req.body?.refresh_token;
    const headerToken = req.get("x-refresh-token");
    const refreshToken = typeof bodyToken === "string"
        ? bodyToken
        : typeof headerToken === "string"
            ? headerToken
            : null;
    try {
        if (!refreshToken) {
            return res.status(400).json({ error: "refreshToken is required" });
        }
        let payload;
        try {
            payload = jsonwebtoken_1.default.verify(refreshToken, process.env.JWT_SECRET_REFRESH);
        }
        catch {
            return res.status(200).json({ message: "Logged out." });
        }
        if (typeof payload === "string" || !payload.sub) {
            return res.status(200).json({ message: "Logged out." });
        }
        const userId = String(payload.sub);
        const activeTokens = await (0, refreshToken_model_1.findRefreshToken)(userId);
        for (const tokenRow of activeTokens) {
            const matchedToken = await bcrypt_1.default.compare(refreshToken, tokenRow.token_hash);
            if (matchedToken) {
                await (0, refreshToken_model_1.revokeRefreshToken)(userId, tokenRow.token_hash);
                break;
            }
        }
        return res.status(200).json({
            message: "Log out is successful!",
        });
    }
    catch (err) {
        return res.status(500).json({
            error: "Internal server error",
            message: err,
        });
    }
};
exports.logout = logout;
const refresh = async (req, res) => {
    try {
        const { refreshToken } = req.body ?? {};
        if (!refreshToken || typeof refreshToken !== "string") {
            return res.status(400).json({ error: "refreshToken is required" });
        }
        let payload;
        try {
            payload = jsonwebtoken_1.default.verify(refreshToken, process.env.JWT_SECRET_REFRESH);
        }
        catch {
            return res.status(401).json({ error: "Invalid refresh token" });
        }
        if (typeof payload === "string" || !payload.sub) {
            return res.status(401).json({ error: "Invalid refresh token payload" });
        }
        const userId = String(payload.sub);
        const activeTokens = await (0, refreshToken_model_1.findRefreshToken)(userId);
        if (activeTokens.length === 0) {
            return res.status(401).json({ error: "No active refresh token found" });
        }
        let matchedTokenHash = null;
        for (const tokenRow of activeTokens) {
            const isMatch = await bcrypt_1.default.compare(refreshToken, tokenRow.token_hash);
            if (isMatch) {
                matchedTokenHash = tokenRow.token_hash;
                break;
            }
        }
        if (!matchedTokenHash) {
            return res.status(401).json({ error: "Refresh token not recognized" });
        }
        await (0, refreshToken_model_1.deleteRefreshToken)(userId, matchedTokenHash);
        const newAccessToken = signAccessToken(userId);
        const newRefreshToken = signRefreshToken(userId);
        await (0, refreshToken_model_1.storeRefreshToken)(userId, newRefreshToken, {
            userAgent: req.get("user-agent") ?? null,
            ipAddress: req.ip ?? null,
        });
        return res.status(200).json({
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
        });
    }
    catch (err) {
        return res.status(500).json({ error: "Internal server error", message: err });
    }
};
exports.refresh = refresh;
const googleOAuthCallback = async (req, res) => {
    try {
        const user = req.user;
        if (!user?.userId) {
            return res.status(401).json({
                error: "Google OAuth failed",
                message: "Authenticated user payload is missing",
            });
        }
        const code = await (0, oauthLoginCode_model_1.createOAuthLoginCode)(user.userId);
        const redirectUrl = `${process.env.OAUTH_SUCCESS_REDIRECT}?code=${encodeURIComponent(code)}`;
        return res.redirect(redirectUrl);
    }
    catch (error) {
        return res.status(500).json({
            error: "Internal server error",
            message: error
        });
    }
};
exports.googleOAuthCallback = googleOAuthCallback;
const googleOAuthExchange = async (req, res) => {
    try {
        const { code } = req.body ?? {};
        if (!code || typeof code !== "string") {
            return res.status(400).json({ error: "code is required" });
        }
        const userId = await (0, oauthLoginCode_model_1.consumeOAuthLoginCode)(code);
        if (!userId) {
            return res.status(401).json({ error: "Invalid or expired OAuth code" });
        }
        const user = await (0, user_model_1.getUserById)(userId);
        if (!user) {
            return res.status(401).json({ error: "User not found" });
        }
        const accessToken = signAccessToken(user.id);
        const refreshToken = signRefreshToken(user.id);
        await (0, refreshToken_model_1.storeRefreshToken)(user.id, refreshToken, {
            userAgent: req.get("user-agent") ?? null,
            ipAddress: req.ip ?? null,
        });
        return res.status(200).json({
            accessToken,
            refreshToken,
            user: {
                id: user.id,
                email: user.email,
                full_name: user.full_name,
            },
        });
    }
    catch (error) {
        return res.status(500).json({
            error: "Internal server error",
            message: error,
        });
    }
};
exports.googleOAuthExchange = googleOAuthExchange;
const OAuthFailure = async (req, res) => {
    return res.status(401).json({
        error: "Google OAuth failed",
        message: "Google OAuth failed",
    });
};
exports.OAuthFailure = OAuthFailure;

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_model_1 = require("../models/user.model");
const requireAuth = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith("Bearer ")
        ? authHeader.slice(7)
        : null;
    if (!token) {
        res.status(401).json({ error: "Authentication required" });
        return;
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        const user = await (0, user_model_1.getUserById)(decoded.sub);
        if (!user) {
            res.status(401).json({ error: "User not found" });
            return;
        }
        req.user = {
            id: user.id,
            role: user.role,
            email: user.email,
            full_name: user.full_name,
        };
        next();
    }
    catch {
        res.status(401).json({ error: "Invalid or expired token" });
        return;
    }
};
exports.requireAuth = requireAuth;

import { Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import bcrypt from "bcrypt";
import { createUser, getUserByEmail } from "../models/user.model";
import {
  deleteRefreshToken,
  findRefreshToken,
  storeRefreshToken,
} from "../models/helper/refreshToken.model";

const signAccessToken = (userId: string) =>
  jwt.sign({ sub: userId }, process.env.JWT_SECRET!, { expiresIn: "15m" });

const signRefreshToken = (userId: string) =>
  jwt.sign({ sub: userId }, process.env.JWT_SECRET_REFRESH!, { expiresIn: "30d" });

export const register = async (req: Request, res: Response) => {
  try {
    const { full_name, email, password } = req.body;

    const existingUser = await getUserByEmail(email);
    if (existingUser) return res.status(409).json({ error: "User already exists" });

    const newUser = await createUser(full_name, email, password);
    res.status(201).json({ message: "User created successfully", userId: newUser.id });
  } catch (err) {
    return res.status(500).json({ error: "Internal server error", message: err });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await getUserByEmail(email);
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) return res.status(401).json({ error: "Invalid credentials" });

    const accessToken = signAccessToken(user.id);
    const refreshToken = signRefreshToken(user.id);

    await storeRefreshToken(user.id, refreshToken, {
      userAgent: req.get("user-agent") ?? null,
      ipAddress: req.ip ?? null,
    });

    return res.status(200).json({
      accessToken,
      refreshToken,
      user: { id: user.id, email: user.email, full_name: user.full_name },
    });
  } catch (err) {
    return res.status(500).json({ error: "Internal server error", message: err });
  }
};

export const refresh = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body ?? {};
    if (!refreshToken || typeof refreshToken !== "string") {
      return res.status(400).json({ error: "refreshToken is required" });
    }

    let payload: string | JwtPayload;
    try {
      payload = jwt.verify(refreshToken, process.env.JWT_SECRET_REFRESH!);
    } catch {
      return res.status(401).json({ error: "Invalid refresh token" });
    }

    if (typeof payload === "string" || !payload.sub) {
      return res.status(401).json({ error: "Invalid refresh token payload" });
    }

    const userId = String(payload.sub);
    const activeTokens = await findRefreshToken(userId);
    if (activeTokens.length === 0) {
      return res.status(401).json({ error: "No active refresh token found" });
    }

    let matchedTokenHash: string | null = null;
    for (const tokenRow of activeTokens) {
      const isMatch = await bcrypt.compare(refreshToken, tokenRow.token_hash);
      if (isMatch) {
        matchedTokenHash = tokenRow.token_hash;
        break;
      }
    }

    if (!matchedTokenHash) {
      return res.status(401).json({ error: "Refresh token not recognized" });
    }

    await deleteRefreshToken(userId, matchedTokenHash);

    const newAccessToken = signAccessToken(userId);
    const newRefreshToken = signRefreshToken(userId);

    await storeRefreshToken(userId, newRefreshToken, {
      userAgent: req.get("user-agent") ?? null,
      ipAddress: req.ip ?? null,
    });

    return res.status(200).json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (err) {
    return res.status(500).json({ error: "Internal server error", message: err });
  }
};

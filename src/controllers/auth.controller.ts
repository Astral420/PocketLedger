import { Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import bcrypt from "bcrypt";
import { createUser, getUserAuthById, getUserByEmail } from "../models/user.model";
import {
  deleteRefreshToken,
  findRefreshToken,
  revokeRefreshToken,
  storeRefreshToken,
} from "../models/helper/refreshToken.model";
import {
  consumeOAuthLoginCode,
  createOAuthLoginCode,
} from "../models/helper/oauthLoginCode.model";

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

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await getUserByEmail(email);
    if (!user) return res.status(401).json({ error: "Invalid credentials" });
    if (!user.password_hash) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

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
      user: { 
              id: user.id, 
              email: user.email, 
              full_name: user.full_name 
            },
    });
  } catch (err) {
    return res.status(500).json({ error: "Internal server error", message: err });
  }
};

export const logout = async (req: Request, res: Response) => {
  const bodyToken = req.body?.refreshToken ?? req.body?.refresh_token;
  const headerToken = req.get("x-refresh-token");
  const refreshToken =
    typeof bodyToken === "string"
      ? bodyToken
      : typeof headerToken === "string"
      ? headerToken
      : null;

  try {
    if (!refreshToken) {
      return res.status(400).json({ error: "refreshToken is required" });
    }

    let payload: string | JwtPayload;

    try {
      payload = jwt.verify(refreshToken, process.env.JWT_SECRET_REFRESH!);
    } catch {
      return res.status(200).json({ message: "Logged out." });
    }

    if (typeof payload === "string" || !payload.sub) {
      return res.status(200).json({ message: "Logged out." });
    }

    const userId = String(payload.sub);
    const activeTokens = await findRefreshToken(userId);

    for (const tokenRow of activeTokens) {
      const matchedToken = await bcrypt.compare(refreshToken, tokenRow.token_hash);
      if (matchedToken) {
        await revokeRefreshToken(userId, tokenRow.token_hash);
        break;
      }
    }

    return res.status(200).json({
      message: "Log out is successful!",
    });
  } catch (err) {
    return res.status(500).json({
        error: "Internal server error",
        message: err,
      });
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

export const googleOAuthCallback = async (req: Request, res: Response) => {
  try {
    const user = req.user as { userId?: string } | undefined;
    if (!user?.userId) {
      return res.status(401).json({
        error: "Google OAuth failed",
        message: "Authenticated user payload is missing",
      });
    }

    const code = await createOAuthLoginCode(user.userId);
    const redirectUrl = `${process.env.OAUTH_SUCCESS_REDIRECT}?code=${encodeURIComponent(code)}`;
    return res.redirect(redirectUrl);
    
    
  } catch (error) {
    return res.status(500).json({
       error: "Internal server error", 
       message: error 
      });
  }

};

export const googleOAuthExchange = async (req: Request, res: Response) => {
  try {
    const { code } = req.body ?? {};
    if (!code || typeof code !== "string") {
      return res.status(400).json({ error: "code is required" });
    }

    const userId = await consumeOAuthLoginCode(code);
    if (!userId) {
      return res.status(401).json({ error: "Invalid or expired OAuth code" });
    }

    const user = await getUserAuthById(userId);
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    const accessToken = signAccessToken(user.id);
    const refreshToken = signRefreshToken(user.id);

    await storeRefreshToken(user.id, refreshToken, {
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
  } catch (error) {
    return res.status(500).json({
      error: "Internal server error",
      message: error,
    });
  }
};

export const OAuthFailure = async (req: Request, res: Response) => {
  return res.status(401).json({
    error: "Google OAuth failed",
    message: "Google OAuth failed",
  });
};

// auth.middleware.ts
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { getUserAuthById } from "../models/user.model";

export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: string;
    email: string;
    full_name: string | null;
  };
}

export const requireAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.slice(7)
    : null;

  if (!token) {
    return res.status(401).json({ error: "Authentication required" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { sub: string };

    const user = await getUserAuthById(decoded.sub);
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    req.user = {
      id: user.id,
      role: user.role,
      email: user.email,
      full_name: user.full_name,
    };

    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};
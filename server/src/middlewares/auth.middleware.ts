// auth.middleware.ts
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { getUserById } from "../models/user.model";

export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: string;
    email: string;
    full_name: string | null;
  };
}

export const requireAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.slice(7)
    : null;

  if (!token) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { sub: string };

    const user = await getUserById(decoded.sub);
    if (!user) {
      res.status(401).json({ error: "User not found" });
      return;
    }

    (req as AuthRequest).user = {
      id: user.id,
      role: user.role,
      email: user.email,
      full_name: user.full_name,
    };

    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
    return;
  }
};
import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { isTokenRevoked } from "../revokedTokens";

export type JwtPayload = { sub: string; email: string; role: "teacher" | "student" };

export function signToken(payload: JwtPayload) {
  return jwt.sign(payload, process.env.JWT_SECRET || "titkos-kulcs", { expiresIn: "24h" });
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  if (isTokenRevoked(token)) return res.status(401).json({ error: "Unauthorized" });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || "titkos-kulcs") as JwtPayload;
    // JAVÍTÁS: req.auth helyett req.user használata
    (req as any).user = payload; 
    (req as any).token = token;
    next();
  } catch {
    return res.status(401).json({ error: "Unauthorized" });
  }
}

export function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return next();

  if (isTokenRevoked(token)) return next();

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || "titkos-kulcs") as JwtPayload;
    (req as any).user = payload;
    (req as any).token = token;
  } catch {
    // ignore invalid token for optional auth
  }
  next();
}

// JAVÍTÁS: Hiányzó requireRole függvény hozzáadása
export function requireRole(role: "teacher" | "student") {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user as JwtPayload | undefined;
    if (!user) return res.status(401).json({ error: "Unauthorized" });
    if (user.role !== role) return res.status(403).json({ error: "Forbidden" });
    next();
  };
}

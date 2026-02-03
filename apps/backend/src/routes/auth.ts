import { Router } from "express";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { pool } from "../db";
import { signToken, requireAuth } from "../middleware/auth";
import { revokeToken } from "../revokedTokens";

export const authRouter = Router();

// --- REGISTER ---
const RegisterBody = z.object({
  email: z.string().email(),
  password: z.string().min(6).max(72),
  role: z.enum(["teacher", "student"]),
});

authRouter.post("/register", async (req, res) => {
  try {
    const { email, password, role } = RegisterBody.parse(req.body);
    const password_hash = await bcrypt.hash(password, 12);

    const r = await pool.query(
      "insert into users(email,password_hash,role) values($1,$2,$3) returning id,email,role",
      [email.toLowerCase(), password_hash, role]
    );

    const user = r.rows[0];
    const token = signToken({ sub: user.id, email: user.email, role: user.role });
    res.status(201).json({ token, user });
  } catch (err: any) {
    console.error("Register error:", err);
    res.status(400).json({ error: err.message || "Registration failed" });
  }
});

// --- LOGIN ---
const LoginBody = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

authRouter.post("/login", async (req, res) => {
  try {
    const { email, password } = LoginBody.parse(req.body);

    const r = await pool.query(
      "select id,email,role,password_hash from users where email=$1",
      [email.toLowerCase()]
    );
    
    if (r.rowCount === 0) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const u = r.rows[0];
    const ok = await bcrypt.compare(password, u.password_hash);
    
    if (!ok) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = signToken({ sub: u.id, email: u.email, role: u.role });
    res.json({ token, user: { id: u.id, email: u.email, role: u.role } });
  } catch (err: any) {
    console.error("Login error:", err);
    res.status(400).json({ error: err.message || "Login failed" });
  }
});

// --- ME (User info) ---
// ✅ JAVÍTVA: req.user használata req.auth helyett
authRouter.get("/me", requireAuth, async (req, res) => {
  try {
    const user = (req as any).user; // ← Ez a javítás!
    
    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Opcionálisan: friss adat DB-ből
    const r = await pool.query(
      "select id, email, role, xp from users where id=$1",
      [user.sub]
    );

    if (r.rowCount === 0) {
      return res.status(401).json({ error: "User not found" });
    }

    const u = r.rows[0];
    res.json({ 
      user: { 
        id: u.id, 
        email: u.email, 
        role: u.role,
        xp: u.xp || 0
      } 
    });
  } catch (err: any) {
    console.error("Me endpoint error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// --- LOGOUT ---
authRouter.post("/logout", requireAuth, async (req, res) => {
  try {
    const token = (req as any).token as string;
    revokeToken(token);
    return res.status(204).send();
  } catch (err: any) {
    console.error("Logout error:", err);
    res.status(500).json({ error: "Logout failed" });
  }
});

export default authRouter;

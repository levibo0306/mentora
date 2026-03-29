import { Router } from "express";
import { z } from "zod";
import { pool } from "../db";
import { requireAuth } from "../middleware/auth";

export const flashcardsRouter = Router();

const CardSchema = z.object({
  front: z.string().min(1).max(500),
  back: z.string().min(1).max(2000),
  topic_id: z.string().uuid().optional(),
});

flashcardsRouter.get("/", requireAuth, async (req: any, res) => {
  const userId = req.user?.sub;
  const role = req.user?.role;
  const topicId = typeof req.query.topic_id === "string" ? req.query.topic_id : null;
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  try {
    if (topicId) {
      if (role === "teacher") {
        const r = await pool.query(
          `SELECT id, front, back, created_at, topic_id
           FROM flashcards
           WHERE owner_id=$1 AND topic_id=$2
           ORDER BY created_at DESC`,
          [userId, topicId]
        );
        return res.json(r.rows);
      }

      const allowed = await pool.query(
        "select 1 from topic_shares where topic_id=$1 and recipient_id=$2",
        [topicId, userId]
      );
      if (allowed.rowCount === 0) return res.status(403).json({ error: "Not allowed" });

      const r = await pool.query(
        `SELECT id, front, back, created_at, topic_id
         FROM flashcards
         WHERE topic_id=$1
         ORDER BY created_at DESC`,
        [topicId]
      );
      return res.json(r.rows);
    }

    const r = await pool.query(
      `SELECT id, front, back, created_at, topic_id
       FROM flashcards
       WHERE owner_id=$1
       ORDER BY created_at DESC`,
      [userId]
    );
    res.json(r.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

flashcardsRouter.post("/", requireAuth, async (req: any, res) => {
  const userId = req.user?.sub;
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const body = CardSchema.parse(req.body);
  try {
    const r = await pool.query(
      `INSERT INTO flashcards(owner_id, front, back, topic_id)
       VALUES($1,$2,$3,$4)
       RETURNING id, front, back, created_at, topic_id`,
      [userId, body.front.trim(), body.back.trim(), body.topic_id ?? null]
    );
    res.status(201).json(r.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

flashcardsRouter.delete("/:id", requireAuth, async (req: any, res) => {
  const userId = req.user?.sub;
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const { id } = z.object({ id: z.string().uuid() }).parse(req.params);
  try {
    const r = await pool.query(
      "DELETE FROM flashcards WHERE id=$1 AND owner_id=$2",
      [id, userId]
    );
    if (r.rowCount === 0) return res.status(404).json({ error: "Not found" });
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

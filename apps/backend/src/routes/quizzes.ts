import { Router } from "express";
import { z } from "zod";
import { pool } from "../db";
import { requireAuth } from "../middleware/auth"; // requireRole ha kell

export const quizzesRouter = Router();

// --- KVÍZ CRUD MŰVELETEK (Ez valószínűleg jó volt eddig is) ---

quizzesRouter.get("/", requireAuth, async (req: any, res) => {
  const userId = req.user.sub;
  const r = await pool.query(
    `select id, title, description, created_at, updated_at
     from quizzes
     where owner_id = $1 or owner_id is null
     order by created_at desc`,
    [userId]
  );
  res.json(r.rows);
});

quizzesRouter.get("/:id", requireAuth, async (req: any, res) => {
  const { id } = req.params;
  const userId = req.user.sub;
  const r = await pool.query(
    `select id, title, description, created_at, updated_at
     from quizzes
     where id=$1`,
    [id]
  );
  if (r.rowCount === 0) return res.status(404).json({ error: "Not found" });
  res.json(r.rows[0]);
});

const CreateQuiz = z.object({
  title: z.string().min(1).max(120),
  description: z.string().max(500).optional(),
});

quizzesRouter.post("/", requireAuth, async (req: any, res) => {
  const { title, description } = CreateQuiz.parse(req.body);
  const userId = req.user.sub;
  const r = await pool.query(
    `insert into quizzes(owner_id, title, description)
     values($1,$2,$3)
     returning id, title, description, created_at, updated_at`,
    [userId, title.trim(), description ?? null]
  );
  res.status(201).json(r.rows[0]);
});

quizzesRouter.put("/:id", requireAuth, async (req: any, res) => {
  const { id } = req.params;
  const userId = req.user.sub;
  const body = CreateQuiz.partial().parse(req.body);
  
  const r = await pool.query(
    `update quizzes set title=coalesce($1,title), description=coalesce($2,description)
     where id=$3 and owner_id=$4 returning *`,
    [body.title, body.description, id, userId]
  );
  res.json(r.rows[0]);
});

quizzesRouter.delete("/:id", requireAuth, async (req: any, res) => {
  const { id } = req.params;
  const userId = req.user.sub;
  await pool.query("delete from quizzes where id=$1 and owner_id=$2", [id, userId]);
  res.json({ ok: true });
});

// --- !!! EZT A RÉSZT FRISSÍTSD !!! ---
// KÉRDÉSEK KEZELÉSE (Fontos: prompt és options mezők!)

const QuestionSchema = z.object({
  prompt: z.string().min(1),             // ITT: prompt (nem question_text)
  options: z.array(z.string()).min(2),   // ITT: options (nem answers)
  correct_index: z.number().int().min(0),
  explanation: z.string().optional(),
});

quizzesRouter.post("/:id/questions", requireAuth, async (req: any, res) => {
  const { id } = req.params;
  const userId = req.user.sub;
  
  try {
    // Validálás: Ha itt elhasal, akkor a frontend 400-at kap
    const body = QuestionSchema.parse(req.body);

    const own = await pool.query("select 1 from quizzes where id=$1 and owner_id=$2", [id, userId]);
    if (own.rowCount === 0) return res.status(404).json({ error: "Quiz not found or not yours" });

    // Adatbázisba írás (figyelj a JSON.stringify-ra!)
    const r = await pool.query(
      `insert into questions (quiz_id, prompt, options, correct_index, explanation)
       values ($1, $2, $3, $4, $5)
       returning *`,
      [id, body.prompt, JSON.stringify(body.options), body.correct_index, body.explanation ?? null]
    );

    res.status(201).json(r.rows[0]);
  } catch (err: any) {
    console.error("Backend Error:", err); // Lássuk a szerver logban, ha baj van
    res.status(400).json({ error: err.message });
  }
});

quizzesRouter.get("/:id/questions", requireAuth, async (req: any, res) => {
  const { id } = req.params;
  const r = await pool.query("select * from questions where quiz_id=$1 order by id", [id]);
  res.json(r.rows);
});

// --- KITÖLTÉS (Submit) ---
quizzesRouter.post("/:id/attempt", requireAuth, async (req: any, res) => {
  const { id } = req.params;
  const userId = req.user.sub;
  const { answers } = z.object({ answers: z.record(z.string(), z.number()) }).parse(req.body);

  const qRes = await pool.query("select id, correct_index from questions where quiz_id=$1", [id]);
  const questions = qRes.rows;
  
  let correct = 0;
  questions.forEach(q => {
    if (answers[q.id] === q.correct_index) correct++;
  });

  const score = questions.length > 0 ? Math.round((correct / questions.length) * 100) : 0;

  const att = await pool.query(
    `insert into attempts (quiz_id, user_id, answers, score) values ($1, $2, $3, $4) returning id`,
    [id, userId, JSON.stringify(answers), score]
  );
  
  res.json({ score, total: questions.length, correct, id: att.rows[0].id });
});
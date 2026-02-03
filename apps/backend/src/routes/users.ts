import { Router } from "express";
import { pool } from "../db";
import { requireAuth } from "../middleware/auth";
import { computeLevel, computeRank, ensureDailyMissions, getCurrentStreak } from "../services/gamification";

export const usersRouter = Router();

usersRouter.get("/me/overview", requireAuth, async (req: any, res) => {
  const userId = req.user?.sub;
  const role = req.user?.role;
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  try {
    if (role === "teacher") {
      const r = await pool.query(
        `SELECT
           COUNT(DISTINCT q.id)::int as active_quizzes,
           COUNT(DISTINCT a.user_id)::int as total_students,
           COUNT(a.id)::int as total_attempts,
           COALESCE(ROUND(AVG(a.score))::int, 0) as avg_score
         FROM quizzes q
         LEFT JOIN attempts a ON a.quiz_id = q.id
         WHERE q.owner_id = $1`,
        [userId]
      );

      return res.json({
        role,
        stats: r.rows[0],
        badges: [],
        xp: 0,
        level: 0,
        rank: "Tanár",
        daily_missions: [],
      });
    }

    const statsRes = await pool.query(
      `SELECT
         COUNT(DISTINCT quiz_id)::int as quizzes_completed,
         COUNT(*)::int as total_attempts,
         COALESCE(ROUND(AVG(score))::int, 0) as avg_score,
         SUM(CASE WHEN score = 100 THEN 1 ELSE 0 END)::int as perfect_count
       FROM attempts
       WHERE user_id = $1`,
      [userId]
    );

    const stats = statsRes.rows[0] as {
      quizzes_completed: number;
      total_attempts: number;
      avg_score: number;
      perfect_count: number;
    };

    const badges = [
      {
        id: "first_quiz",
        icon: "🏆",
        name: "Első kvíz",
        requirement: "Tölts ki 1 kvízt",
        earned: stats.quizzes_completed >= 1,
      },
      {
        id: "perfect_score",
        icon: "🎯",
        name: "Hibátlan",
        requirement: "100% egy kvízben",
        earned: stats.perfect_count >= 1,
      },
      {
        id: "five_quizzes",
        icon: "🔥",
        name: "5 kvíz",
        requirement: "Tölts ki 5 kvízt",
        earned: stats.quizzes_completed >= 5,
      },
      {
        id: "ten_quizzes",
        icon: "⭐",
        name: "10 kvíz",
        requirement: "Tölts ki 10 kvízt",
        earned: stats.quizzes_completed >= 10,
      },
    ];

    const badgesEarned = badges.filter((b) => b.earned).length;

    const xpRes = await pool.query("select xp from users where id=$1", [userId]);
    const xp = xpRes.rows[0]?.xp ?? 0;
    const level = computeLevel(xp);
    const rank = computeRank(level);
    const nextLevelXp = level * 100;

    const tzOffset = Number(req.headers["x-timezone-offset"] ?? 0);
    const daily = await ensureDailyMissions(userId, Number.isFinite(tzOffset) ? tzOffset : 0);
    const streak = await getCurrentStreak(userId);

    return res.json({
      role,
      stats: {
        quizzes_completed: stats.quizzes_completed,
        total_attempts: stats.total_attempts,
        avg_score: stats.avg_score,
        badges_earned: badgesEarned,
      },
      badges,
      xp,
      level,
      rank,
      next_level_xp: nextLevelXp,
      daily_missions: daily,
      streak_days: streak,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

usersRouter.get("/me/missions", requireAuth, async (req: any, res) => {
  const userId = req.user?.sub;
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const limit = Number(req.query.limit ?? 14);
  const safeLimit = Number.isFinite(limit) ? Math.min(60, Math.max(1, limit)) : 14;

  try {
    const r = await pool.query(
      `select *
       from daily_missions
       where user_id=$1
       order by date desc, created_at asc
       limit $2`,
      [userId, safeLimit]
    );
    res.json(r.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

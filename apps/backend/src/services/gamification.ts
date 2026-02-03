import { pool } from "../db";

export type MissionType = "complete_quizzes" | "score_at_least" | "streak_days";

type MissionTemplate = {
  id: string;
  title: string;
  description: string;
  type: MissionType;
  target: number;
  threshold?: number;
  difficulty: "easy" | "medium" | "hard";
  xp_reward: number;
};

const missionPool: Record<"easy" | "medium" | "hard", MissionTemplate[]> = {
  easy: [
    {
      id: "complete_1",
      title: "Kezdő lendület",
      description: "Tölts ki 1 kvízt ma",
      type: "complete_quizzes",
      target: 1,
      difficulty: "easy",
      xp_reward: 20,
    },
    {
      id: "score_70",
      title: "Biztos kéz",
      description: "Érj el 70%+ eredményt egy kvízben",
      type: "score_at_least",
      target: 1,
      threshold: 70,
      difficulty: "easy",
      xp_reward: 25,
    },
  ],
  medium: [
    {
      id: "complete_2",
      title: "Fokozatváltás",
      description: "Tölts ki 2 kvízt ma",
      type: "complete_quizzes",
      target: 2,
      difficulty: "medium",
      xp_reward: 40,
    },
    {
      id: "score_85",
      title: "Precízió",
      description: "Érj el 85%+ eredményt egy kvízben",
      type: "score_at_least",
      target: 1,
      threshold: 85,
      difficulty: "medium",
      xp_reward: 45,
    },
    {
      id: "streak_3",
      title: "Rutin",
      description: "Tanulj 3 napig egymás után",
      type: "streak_days",
      target: 3,
      difficulty: "medium",
      xp_reward: 50,
    },
  ],
  hard: [
    {
      id: "complete_3",
      title: "Maraton",
      description: "Tölts ki 3 kvízt ma",
      type: "complete_quizzes",
      target: 3,
      difficulty: "hard",
      xp_reward: 70,
    },
    {
      id: "score_100",
      title: "Hibátlan",
      description: "Érj el 100% eredményt egy kvízben",
      type: "score_at_least",
      target: 1,
      threshold: 100,
      difficulty: "hard",
      xp_reward: 80,
    },
    {
      id: "streak_5",
      title: "Széria",
      description: "Tanulj 5 napig egymás után",
      type: "streak_days",
      target: 5,
      difficulty: "hard",
      xp_reward: 90,
    },
  ],
};

export function computeLevel(xp: number) {
  return Math.floor(xp / 100) + 1;
}

export function computeRank(level: number) {
  if (level >= 11) return "Legenda";
  if (level >= 9) return "Mester";
  if (level >= 7) return "Haladó";
  if (level >= 5) return "Felfedező";
  if (level >= 3) return "Tanuló";
  return "Újonc";
}

function todayKey(offsetMinutes = 0) {
  const adjusted = new Date(Date.now() - offsetMinutes * 60 * 1000);
  return adjusted.toISOString().slice(0, 10);
}

function yesterdayKey(offsetMinutes = 0) {
  const adjusted = new Date(Date.now() - offsetMinutes * 60 * 1000);
  adjusted.setUTCDate(adjusted.getUTCDate() - 1);
  return adjusted.toISOString().slice(0, 10);
}

async function getUserXp(userId: string) {
  const r = await pool.query("select xp from users where id=$1", [userId]);
  return (r.rows[0]?.xp ?? 0) as number;
}

export async function addXp(userId: string, amount: number) {
  const r = await pool.query(
    "update users set xp = xp + $1 where id=$2 returning xp",
    [amount, userId]
  );
  const xp = r.rows[0]?.xp ?? 0;
  const level = computeLevel(xp);
  await pool.query("update users set level=$1 where id=$2", [level, userId]);
  return { xp, level };
}

function pickDifficulty(level: number): "easy" | "medium" | "hard" {
  if (level <= 3) return "easy";
  if (level <= 7) return "medium";
  return "hard";
}

function pickRandomMissions(level: number, count: number) {
  const difficulty = pickDifficulty(level);
  const pool = missionPool[difficulty];
  const picks: MissionTemplate[] = [];
  const used = new Set<string>();
  while (picks.length < Math.min(count, pool.length)) {
    const m = pool[Math.floor(Math.random() * pool.length)];
    if (used.has(m.id)) continue;
    used.add(m.id);
    picks.push(m);
  }
  return picks;
}

export async function ensureDailyMissions(userId: string, offsetMinutes = 0) {
  const date = todayKey(offsetMinutes);
  const existing = await pool.query(
    "select * from daily_missions where user_id=$1 and date=$2 order by created_at asc",
    [userId, date]
  );
  if (existing.rowCount && existing.rowCount > 0) return existing.rows;

  const xp = await getUserXp(userId);
  const level = computeLevel(xp);
  const picks = pickRandomMissions(level, 2);

  for (const m of picks) {
    await pool.query(
      `insert into daily_missions
       (user_id, date, mission_id, title, description, type, target, threshold, difficulty, xp_reward, progress)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
      [
        userId,
        date,
        m.id,
        m.title,
        m.description,
        m.type,
        m.target,
        m.threshold ?? null,
        m.difficulty,
        m.xp_reward,
        0,
      ]
    );
  }

  const r = await pool.query(
    "select * from daily_missions where user_id=$1 and date=$2 order by created_at asc",
    [userId, date]
  );
  return r.rows;
}

export async function updateStreakOnAttempt(userId: string, offsetMinutes = 0) {
  const date = todayKey(offsetMinutes);
  const prevDate = yesterdayKey(offsetMinutes);
  const r = await pool.query(
    "select * from user_streaks where user_id=$1",
    [userId]
  );
  if (!r.rowCount || r.rowCount === 0) {
    await pool.query(
      "insert into user_streaks(user_id, current_streak, last_active_date) values($1,$2,$3)",
      [userId, 1, date]
    );
    return 1;
  }

  const row = r.rows[0];
  if (row.last_active_date === date) {
    return row.current_streak ?? 1;
  }

  const nextStreak = row.last_active_date === prevDate ? (row.current_streak ?? 0) + 1 : 1;
  await pool.query(
    "update user_streaks set current_streak=$1, last_active_date=$2 where user_id=$3",
    [nextStreak, date, userId]
  );
  return nextStreak;
}

export async function getCurrentStreak(userId: string) {
  const r = await pool.query("select current_streak from user_streaks where user_id=$1", [userId]);
  return r.rows[0]?.current_streak ?? 0;
}

export async function updateDailyMissionsOnAttempt(
  userId: string,
  scorePercent: number,
  offsetMinutes = 0
) {
  const date = todayKey(offsetMinutes);
  const missionsRes = await pool.query(
    "select * from daily_missions where user_id=$1 and date=$2 order by created_at asc",
    [userId, date]
  );
  if (!missionsRes.rowCount || missionsRes.rowCount === 0) {
    await ensureDailyMissions(userId, offsetMinutes);
  }

  const r = await pool.query(
    "select * from daily_missions where user_id=$1 and date=$2 order by created_at asc",
    [userId, date]
  );

  const streak = await updateStreakOnAttempt(userId, offsetMinutes);

  for (const m of r.rows) {
    if (m.completed_at) continue;
    let newProgress = m.progress ?? 0;
    if (m.type === "complete_quizzes") {
      newProgress += 1;
    }
    if (m.type === "score_at_least" && scorePercent >= (m.threshold ?? 0)) {
      newProgress = m.target;
    }
    if (m.type === "streak_days") {
      newProgress = Math.min(m.target ?? streak, streak);
    }

    if (newProgress !== m.progress) {
      const completed = newProgress >= m.target;
      await pool.query(
        "update daily_missions set progress=$1, completed_at=$2 where id=$3",
        [newProgress, completed ? new Date().toISOString() : null, m.id]
      );

      if (completed) {
        await addXp(userId, m.xp_reward ?? 0);
      }
    }
  }
}

import { useEffect, useState } from "react";
import { getUserOverview, UserOverview } from "../api/users";
import { useAuth } from "../context/AuthContext";

export const DashboardOverview = () => {
  const { user } = useAuth();
  const [data, setData] = useState<UserOverview | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await getUserOverview();
        setData(res);
      } catch (err) {
        console.error("Nem sikerült betölteni az összefoglalót", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading && !data) {
    return (
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-number">...</div>
          <div className="stat-label">Betöltés</div>
        </div>
      </div>
    );
  }

  if (!data || !user) return null;

  if (user.role === "teacher") {
    const stats = data.stats as {
      active_quizzes: number;
      total_students: number;
      total_attempts: number;
      avg_score: number;
    };
    return (
      <>
        <div className="xp-panel">
          <div>
            <div className="xp-title">Tanári áttekintés</div>
            <div className="xp-sub">Összesített statisztikák a kvízeidről</div>
          </div>
          <div className="xp-rank">👨‍🏫 Tanár</div>
        </div>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-number">{stats.active_quizzes ?? 0}</div>
            <div className="stat-label">Aktív kvízek</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats.total_students ?? 0}</div>
            <div className="stat-label">Diákok száma</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats.total_attempts ?? 0}</div>
            <div className="stat-label">Összes kitöltés</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats.avg_score ?? 0}%</div>
            <div className="stat-label">Átlag pontszám</div>
          </div>
        </div>
      </>
    );
  }

  const stats = data.stats as {
    quizzes_completed: number;
    total_attempts: number;
    avg_score: number;
    badges_earned: number;
  };

  const nextLevel = data.next_level_xp ?? ((data.level ?? 1) * 100);
  const xpPercent =
    nextLevel > 0 ? Math.min(100, Math.round(((data.xp ?? 0) / nextLevel) * 100)) : 0;

  return (
    <>
      <div className="xp-panel">
        <div>
          <div className="xp-title">Szint {data.level ?? 1}</div>
          <div className="xp-sub">
            {data.xp ?? 0} / {nextLevel} XP · 🔥 {data.streak_days ?? 0} napos streak
          </div>
          <div className="xp-bar">
            <div className="xp-bar-fill" style={{ width: `${xpPercent}%` }} />
          </div>
        </div>
        <div className="xp-rank">🏅 {data.rank}</div>
      </div>

      <div className="mission-grid">
        {(data.daily_missions ?? []).map((m) => {
          const progress = Math.min(100, Math.round((m.progress / m.target) * 100));
          const done = !!m.completed_at || m.progress >= m.target;
          return (
            <div key={m.id} className={`mission-card ${done ? "completed" : ""}`}>
              <div className="mission-title">{m.title}</div>
              <div className="mission-desc">{m.description}</div>
              <div className="mission-progress">
                <div className="mission-bar">
                  <div className="mission-bar-fill" style={{ width: `${progress}%` }} />
                </div>
                <div className="mission-meta">
                  {m.progress}/{m.target} · +{m.xp_reward} XP
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-number">{stats.quizzes_completed ?? 0}</div>
          <div className="stat-label">Kvízek kitöltve</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.avg_score ?? 0}%</div>
          <div className="stat-label">Átlag pontszám</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.total_attempts ?? 0}</div>
          <div className="stat-label">Összes próbálkozás</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.badges_earned ?? 0}</div>
          <div className="stat-label">Megszerezett badge</div>
        </div>
      </div>

      <div className="badge-section">
        <h2 className="section-title">Eredményeid</h2>
        <div className="badge-grid">
          {data.badges.map((badge) => (
            <div key={badge.id} className={`badge-item ${badge.earned ? "earned" : ""}`}>
              <div className="badge-icon">{badge.icon}</div>
              <div className="badge-name">{badge.name}</div>
              <div className="badge-requirement">{badge.requirement}</div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

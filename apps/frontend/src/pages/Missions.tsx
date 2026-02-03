import { useEffect, useMemo, useState } from "react";
import { getUserMissions } from "../api/users";

type Mission = NonNullable<ReturnType<typeof getUserMissions> extends Promise<infer U> ? U : any>[number];

export const Missions = () => {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await getUserMissions(28);
        setMissions(data ?? []);
      } catch (err) {
        console.error("Nem sikerült betölteni a küldetéseket", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const grouped = useMemo(() => {
    const map = new Map<string, Mission[]>();
    for (const m of missions) {
      const key = String(m.date ?? "");
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(m);
    }
    return Array.from(map.entries());
  }, [missions]);

  return (
    <div style={{ padding: "30px 20px" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        <h2 style={{ fontSize: "28px", marginBottom: "16px" }}>🧭 Küldetések</h2>
        <p style={{ color: "#666", marginBottom: "20px" }}>
          Napi küldetések listája az elmúlt napokból.
        </p>

        {loading && <div className="loading">Betöltés...</div>}

        {!loading && grouped.length === 0 && (
          <div className="empty-state">
            <div style={{ fontSize: "48px", marginBottom: "12px" }}>🎯</div>
            <p>Még nincs küldetésed.</p>
          </div>
        )}

        {!loading && grouped.length > 0 && (
          <div className="mission-history">
            {grouped.map(([date, items]) => (
              <div key={date} className="mission-day">
                <div className="mission-day-title">
                  {new Date(date).toLocaleDateString("hu-HU")}
                </div>
                <div className="mission-grid">
                  {items.map((m) => {
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
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

import { useEffect, useMemo, useState } from "react";
import { getQuizzes, getQuizResults, Quiz, QuizAttempt, QuizResults } from "../api/quizzes";

export const Results = () => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [selectedQuizId, setSelectedQuizId] = useState<string>("");
  const [results, setResults] = useState<QuizResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedAttemptId, setSelectedAttemptId] = useState<string>("");

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getQuizzes();
        setQuizzes(data);
        if (data.length > 0) setSelectedQuizId(data[0].id);
      } catch (err) {
        console.error("Nem sikerült betölteni a kvízeket", err);
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (!selectedQuizId) return;
    const load = async () => {
      try {
        setLoading(true);
        const data = await getQuizResults(selectedQuizId);
        setResults(data);
        setSelectedAttemptId(data.attempts[0]?.id ?? "");
      } catch (err) {
        console.error("Nem sikerült betölteni az eredményeket", err);
        setResults(null);
        setSelectedAttemptId("");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [selectedQuizId]);

  const selectedAttempt: QuizAttempt | null = useMemo(() => {
    if (!results || !selectedAttemptId) return null;
    return results.attempts.find((a) => a.id === selectedAttemptId) ?? null;
  }, [results, selectedAttemptId]);

  return (
    <div style={{ padding: "30px 20px" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        <h2 style={{ fontSize: "28px", marginBottom: "16px" }}>📊 Eredmények</h2>

        <div style={{ marginBottom: "24px", display: "flex", gap: "12px", alignItems: "center" }}>
          <label style={{ fontSize: "14px", color: "#666" }}>Kvíz kiválasztása</label>
          <select
            value={selectedQuizId}
            onChange={(e) => setSelectedQuizId(e.target.value)}
            style={{
              padding: "10px 12px",
              borderRadius: "8px",
              border: "1px solid #ddd",
              minWidth: "260px",
            }}
          >
            {quizzes.map((q) => (
              <option key={q.id} value={q.id}>
                {q.title}
              </option>
            ))}
          </select>
        </div>

        {loading && <div className="loading">Betöltés...</div>}

        {!loading && results && (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
              <div style={{ background: "white", padding: "20px", borderRadius: "16px" }}>
                <h3 style={{ marginBottom: "12px" }}>👥 Próbálkozások</h3>
                {results.attempts.length === 0 && (
                  <div style={{ color: "#666" }}>Még nincs kitöltés ennél a kvíznél.</div>
                )}
                {results.attempts.map((a) => (
                  <button
                    key={a.id}
                    onClick={() => setSelectedAttemptId(a.id)}
                    className="btn btn-secondary"
                    style={{
                      width: "100%",
                      textAlign: "left",
                      marginBottom: "10px",
                      background: a.id === selectedAttemptId ? "var(--light)" : undefined,
                    }}
                  >
                    <strong>{a.student_email ?? "Anonim"}</strong> – {a.score}% –{" "}
                    {new Date(a.created_at).toLocaleString("hu-HU")}
                  </button>
                ))}
              </div>

              <div style={{ background: "white", padding: "20px", borderRadius: "16px" }}>
                <h3 style={{ marginBottom: "12px" }}>🧠 Válaszok (kijelölt próbálkozás)</h3>
                {!selectedAttempt && <div style={{ color: "#666" }}>Válassz egy próbálkozást.</div>}
                {selectedAttempt && results.questions.map((q) => {
                  const selected = selectedAttempt.answers?.[q.id];
                  const correct = q.correct_index;
                  return (
                    <div key={q.id} style={{ padding: "12px 0", borderBottom: "1px solid #f0f0f0" }}>
                      <div style={{ fontWeight: 600, marginBottom: "6px" }}>{q.prompt}</div>
                      <div style={{ fontSize: "14px", color: "#444" }}>
                        Válasz:{" "}
                        <strong style={{ color: selected === correct ? "var(--success)" : "var(--danger)" }}>
                          {selected !== undefined ? q.options[selected] : "Nincs válasz"}
                        </strong>
                      </div>
                      <div style={{ fontSize: "13px", color: "#888" }}>
                        Helyes: {q.options[correct]}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div style={{ marginTop: "24px", background: "white", padding: "20px", borderRadius: "16px" }}>
              <h3 style={{ marginBottom: "12px" }}>📈 Kérdésenkénti statisztika</h3>
              {results.stats.map((s) => {
                const q = results.questions.find((qq) => qq.id === s.question_id);
                if (!q) return null;
                const total = Math.max(s.total, 1);
                return (
                  <div key={s.question_id} style={{ marginBottom: "20px" }}>
                    <div style={{ fontWeight: 600, marginBottom: "8px" }}>{q.prompt}</div>
                    {q.options.map((opt, idx) => {
                      const count = s.counts[idx] ?? 0;
                      const pct = Math.round((count / total) * 100);
                      const isCorrect = idx === s.correct_index;
                      return (
                        <div key={`${s.question_id}-${idx}`} style={{ marginBottom: "8px" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                            <span style={{ color: isCorrect ? "var(--success)" : "#555" }}>
                              {isCorrect ? "✅ " : ""}{opt}
                            </span>
                            <span>{count} válasz ({pct}%)</span>
                          </div>
                          <div style={{ height: "8px", background: "#f1f1f1", borderRadius: "6px" }}>
                            <div
                              style={{
                                height: "8px",
                                width: `${pct}%`,
                                borderRadius: "6px",
                                background: isCorrect ? "var(--success)" : "#bbb",
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

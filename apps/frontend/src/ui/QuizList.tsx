import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getQuizzes, Quiz, deleteQuiz } from "../api/quizzes";

interface Props {
  onEdit: (id: string) => void;
}

type DiffBadge = { label: string; class: string };

function getDifficultyStyle(avgDiff: number | string | null | undefined): DiffBadge {
  const n = avgDiff == null ? 3 : Number(avgDiff);
  const rounded = Math.round(Number.isFinite(n) ? n : 3);

  const levels: Record<number, DiffBadge> = {
    1: { label: "Nagyon könnyű", class: "diff-v-easy" },
    2: { label: "Könnyű", class: "diff-easy" },
    3: { label: "Közepes", class: "diff-medium" },
    4: { label: "Nehéz", class: "diff-hard" },
    5: { label: "Nagyon nehéz", class: "diff-v-hard" },
  };

  return levels[rounded] ?? levels[3];
}

export const QuizList = ({ onEdit }: Props) => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchList = async () => {
    try {
      setLoading(true);
      const data = await getQuizzes();
      setQuizzes(data);
    } catch (error) {
      console.error("Nem sikerült betölteni a kvízeket", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Biztosan törölni szeretnéd ezt a kvízt?")) return;
    try {
      await deleteQuiz(id);
      await fetchList();
    } catch (e) {
      alert("Hiba a törlésnél");
    }
  };

  if (loading) return <div className="loading">Betöltés...</div>;

  if (quizzes.length === 0) {
    return (
      <div className="empty-state">
        <div style={{ fontSize: "48px", marginBottom: "20px" }}>📚</div>
        <p>Még nincs kvízed. Kezdj el egyet létrehozni!</p>
      </div>
    );
  }

  return (
    <div className="quiz-grid">
      {quizzes.map((quiz) => {
        const diff = getDifficultyStyle((quiz as any).avg_difficulty);

        return (
          <div key={quiz.id} className="quiz-card">
            <div className="quiz-header">
              <div
                className="quiz-header-top"
                style={{ display: "flex", gap: "8px", marginBottom: "12px" }}
              >
                {/* Mode jelző */}
                <span className={`mode-badge ${quiz.mode || "practice"}`}>
                  {quiz.mode === "assessment" ? "🏆 Assessment" : "📖 Practice"}
                </span>

                {/* Nehézség (AVG kérdés difficulty alapján) */}
                <div className={`difficulty-badge ${diff.class}`}>{diff.label}</div>
              </div>

              <div className="quiz-title" style={{ fontWeight: "bold", fontSize: "1.2rem" }}>
                {quiz.title}
              </div>

              <div className="quiz-meta" style={{ color: "#666", marginTop: "4px" }}>
                {quiz.description || "Nincs leírás"}
              </div>
            </div>

            <div className="quiz-body" style={{ marginTop: "20px" }}>
              <div className="quiz-stats" style={{ display: "flex", gap: "20px", marginBottom: "20px" }}>
                <div className="quiz-stat">
                  <div className="quiz-stat-value" style={{ fontSize: "1.1rem", fontWeight: "bold" }}>
                    {quiz.question_count ?? "?"}
                  </div>
                  <div className="quiz-stat-label" style={{ fontSize: "0.8rem", color: "#999" }}>
                    Kérdések
                  </div>
                </div>

                <div className="quiz-stat">
                  <div className="quiz-stat-value" style={{ fontSize: "1.1rem", fontWeight: "bold" }}>
                    {quiz.total_attempts ?? 0}
                  </div>
                  <div className="quiz-stat-label" style={{ fontSize: "0.8rem", color: "#999" }}>
                    Próbák
                  </div>
                </div>
              </div>

              <div className="quiz-actions" style={{ display: "flex", gap: "10px" }}>
                <Link to={`/play/${quiz.id}`} className="btn btn-primary">
                  ▶ Indítás
                </Link>
                <button onClick={() => onEdit(quiz.id)} className="btn btn-secondary">
                  Szerkesztés
                </button>
                <button onClick={() => handleDelete(quiz.id)} className="btn btn-danger-soft">
                  Törlés
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

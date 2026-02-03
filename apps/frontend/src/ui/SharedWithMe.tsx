import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/http";
import { ShareModal } from "./ShareModal";

type SharedQuiz = {
  id: string;
  title: string;
  description?: string;
  mode: 'practice' | 'assessment';
  question_count: number;
  owner_email: string | null;
  shared_by_email: string | null;
  shared_at: string;
  token: string; // Share token
  allow_reshare: boolean;
};

export const SharedWithMe = () => {
  const [sharedQuizzes, setSharedQuizzes] = useState<SharedQuiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState<SharedQuiz | null>(null);

  useEffect(() => {
    fetchSharedQuizzes();
  }, []);

  const fetchSharedQuizzes = async () => {
    try {
      setLoading(true);
      // Ez egy új backend endpoint lesz
      const data = await api<SharedQuiz[]>("/api/quizzes/shared-with-me");
      setSharedQuizzes(data);
    } catch (error) {
      console.error("Nem sikerült betölteni a megosztott kvízeket", error);
    } finally {
      setLoading(false);
    }
  };

  const handleReshare = (quiz: SharedQuiz) => {
    setSelectedQuiz(quiz);
    setShareModalOpen(true);
  };

  if (loading) {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: '60px 20px',
        color: '#666'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📚</div>
        <div>Betöltés...</div>
      </div>
    );
  }

  if (sharedQuizzes.length === 0) {
    return (
      <div className="empty-state">
        <div style={{ fontSize: "64px", marginBottom: "20px" }}>📬</div>
        <p style={{ fontSize: '20px', fontWeight: '600', color: 'var(--dark)', marginBottom: '12px' }}>
          Még nincs veled megosztott kvíz
        </p>
        <p style={{ color: '#999', fontSize: '15px' }}>
          Amikor egy tanár megoszt veled egy kvízt, itt fog megjelenni!
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="quiz-grid">
        {sharedQuizzes.map((quiz) => (
          <div key={quiz.id} className="quiz-card">
          <div className="quiz-header">
            {/* Shared badge */}
            <div style={{ 
              display: 'flex', 
              gap: '8px', 
              marginBottom: '12px',
              alignItems: 'center' 
            }}>
              <span className={`mode-badge ${quiz.mode || "practice"}`}>
                {quiz.mode === "assessment" ? "🏆 Vizsga" : "📖 Gyakorlás"}
              </span>
              <span style={{
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                color: 'white',
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: 'bold'
              }}>
                👨‍🏫 Megosztva
              </span>
            </div>

            <div className="quiz-title" style={{ fontWeight: "bold", fontSize: "1.2rem" }}>
              {quiz.title}
            </div>

            <div className="quiz-meta" style={{ color: "#666", marginTop: "4px" }}>
              {quiz.description || "Nincs leírás"}
            </div>

            {/* Tanár info */}
            <div style={{
              marginTop: '12px',
              padding: '8px 12px',
              background: 'var(--light)',
              borderRadius: '8px',
              fontSize: '13px',
              color: '#666'
            }}>
              👨‍🏫 Készítette: <strong>{quiz.owner_email ?? "Ismeretlen"}</strong>
            </div>
            <div style={{
              marginTop: '8px',
              padding: '8px 12px',
              background: '#f7f7f7',
              borderRadius: '8px',
              fontSize: '13px',
              color: '#666'
            }}>
              🔗 Megosztotta: <strong>{quiz.shared_by_email ?? "Ismeretlen"}</strong>
            </div>
          </div>

          <div className="quiz-body" style={{ marginTop: "20px" }}>
            <div className="quiz-stats" style={{ 
              display: "flex", 
              gap: "20px", 
              marginBottom: "20px",
              justifyContent: 'center'
            }}>
              <div className="quiz-stat">
                <div className="quiz-stat-value" style={{ fontSize: "1.1rem", fontWeight: "bold" }}>
                  {quiz.question_count ?? "?"}
                </div>
                <div className="quiz-stat-label" style={{ fontSize: "0.8rem", color: "#999" }}>
                  Kérdések
                </div>
              </div>

              <div className="quiz-stat">
                <div className="quiz-stat-value" style={{ fontSize: "0.9rem", color: "#666" }}>
                  {new Date(quiz.shared_at).toLocaleDateString('hu-HU')}
                </div>
                <div className="quiz-stat-label" style={{ fontSize: "0.8rem", color: "#999" }}>
                  Megosztva
                </div>
              </div>
            </div>

            <div className="quiz-actions" style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <Link 
                to={`/shared/${quiz.token}`} 
                className="btn btn-primary"
                style={{ flex: '1', textAlign: 'center' }}
              >
                ▶ Kvíz Megnyitása
              </Link>
              {quiz.allow_reshare && (
                <button
                  onClick={() => handleReshare(quiz)}
                  className="btn"
                  style={{
                    flex: '1',
                    textAlign: 'center',
                    background: 'linear-gradient(135deg, var(--success), #00d4aa)',
                    color: 'white',
                    boxShadow: '0 4px 15px rgba(6, 214, 160, 0.2)'
                  }}
                >
                  📤 Továbbosztás
                </button>
              )}
            </div>
          </div>
          </div>
        ))}
      </div>
      {selectedQuiz && (
        <ShareModal
          quizId={selectedQuiz.id}
          quizTitle={selectedQuiz.title}
          sourceToken={selectedQuiz.token}
          isOpen={shareModalOpen}
          onClose={() => {
            setShareModalOpen(false);
            setSelectedQuiz(null);
          }}
        />
      )}
    </>
  );
};

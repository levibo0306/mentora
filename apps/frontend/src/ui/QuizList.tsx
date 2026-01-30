import { useEffect, useState } from "react";
import { Link } from "react-router-dom"; 
import { getQuizzes, Quiz, deleteQuiz } from "../api/quizzes";

interface Props {
  onEdit: (id: string) => void;
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
      fetchList();
    } catch (e) {
      alert("Hiba a törlésnél");
    }
  };

  if (loading) {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: '60px 20px',
        fontSize: '18px',
        color: '#666'
      }}>
        Betöltés...
      </div>
    );
  }
  
  if (quizzes.length === 0) {
    return (
      <div className="empty-state">
        <div style={{ fontSize: '48px', marginBottom: '20px' }}>📚</div>
        <p style={{ fontSize: '20px', fontWeight: '600', marginBottom: '10px' }}>
          Még nincs kvízed
        </p>
        <p style={{ color: '#999' }}>
          Kezdj el egyet létrehozni a fenti gombbal!
        </p>
      </div>
    );
  }

  return (
    <div className="quiz-grid">
      {quizzes.map((quiz) => (
        <div key={quiz.id} className="quiz-card">
          <div className="quiz-header">
            <div>
              <div className="difficulty-badge difficulty-medium">Medium</div>
              <div className="quiz-title">{quiz.title}</div>
              <div className="quiz-meta">{quiz.description || "Nincs leírás"}</div>
            </div>
          </div>
          
          <div className="quiz-body">
            <div className="quiz-stats">
              <div className="quiz-stat">
                <div className="quiz-stat-value">?</div>
                <div className="quiz-stat-label">Kérdések</div>
              </div>
              <div className="quiz-stat">
                <div className="quiz-stat-value">0</div>
                <div className="quiz-stat-label">Diákok</div>
              </div>
              <div className="quiz-stat">
                <div className="quiz-stat-value">0</div>
                <div className="quiz-stat-label">Próbák</div>
              </div>
            </div>
            
            <div className="quiz-actions">
              <Link 
                to={`/play/${quiz.id}`}
                className="btn btn-primary"
              >
                ▶ Indítás
              </Link>

              <button 
                onClick={() => onEdit(quiz.id)} 
                className="btn btn-secondary"
              >
                Szerkesztés
              </button>
              
              <button 
                onClick={() => handleDelete(quiz.id)} 
                className="btn btn-secondary"
                style={{ 
                  background: '#ffe6e6', 
                  color: 'var(--danger)', 
                  borderColor: 'var(--danger)' 
                }}
              >
                Törlés
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
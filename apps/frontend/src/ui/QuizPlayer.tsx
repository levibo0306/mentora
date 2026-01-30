import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getQuiz, submitQuizAttempt, QuizResult } from "../api/quizzes";
import { api } from "../api/http";

type Question = {
  id: string;
  prompt: string;
  options: string[];
};

export const QuizPlayer = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [result, setResult] = useState<QuizResult | null>(null);

  useEffect(() => {
    if (!id) return;
    
    api<any[]>(`/api/quizzes/${id}/questions`)
      .then((data) => {
        const parsed = data.map(q => ({
          ...q,
          options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options
        }));
        setQuestions(parsed);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSelect = (idx: number) => {
    const currentQ = questions[currentStep];
    setAnswers({ ...answers, [currentQ.id]: idx });
  };

  const handleNext = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const res = await submitQuizAttempt(id, answers);
      setResult(res);
    } catch (e) {
      alert("Hiba a kiértékeléskor");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: '80px 20px',
        fontSize: '18px',
        color: '#666'
      }}>
        Betöltés...
      </div>
    );
  }
  
  // HA NINCS KÉRDÉS
  if (questions.length === 0) {
    return (
      <div className="result-card">
        <div style={{ fontSize: '64px', marginBottom: '20px' }}>📝</div>
        <h3 style={{ fontSize: '24px', marginBottom: '12px' }}>Ez a kvíz még üres!</h3>
        <p style={{ color: '#666', marginBottom: '30px' }}>
          Még nincsenek kérdések ebben a kvízben.
        </p>
        <button onClick={() => navigate('/')} className="btn btn-primary">
          Vissza a főoldalra
        </button>
      </div>
    );
  }

  // EREDMÉNY NÉZET
  if (result) {
    const percentage = result.score;
    const isPassed = percentage >= 50;
    
    return (
      <div className="result-card">
        <div style={{ fontSize: '48px', marginBottom: '20px' }}>
          {isPassed ? '🎉' : '📚'}
        </div>
        
        <h2 style={{ 
          fontSize: '32px', 
          marginBottom: '20px',
          color: 'var(--dark)'
        }}>
          {isPassed ? 'Gratulálunk!' : 'Még gyakorolnod kell!'}
        </h2>
        
        <div className="result-score" style={{
          color: isPassed ? 'var(--success)' : 'var(--danger)'
        }}>
          {percentage}%
        </div>
        
        <div className="result-details">
          {result.correct} / {result.total} helyes válasz
        </div>

        <button 
          onClick={() => navigate('/')} 
          className="btn btn-primary"
          style={{ marginTop: '30px', padding: '16px 40px' }}
        >
          Vissza a Dashboardra
        </button>
      </div>
    );
  }

  // JÁTÉK NÉZET
  const question = questions[currentStep];
  const selectedOption = answers[question.id];

  return (
    <div className="quiz-player-container">
      {/* Haladásjelző */}
      <div className="progress-bar">
        <span style={{ fontWeight: '600', color: 'var(--dark)' }}>
          Kérdés {currentStep + 1} / {questions.length}
        </span>
        <button 
          onClick={() => navigate('/')} 
          className="btn btn-secondary"
          style={{ padding: '8px 16px', fontSize: '14px' }}
        >
          Kilépés
        </button>
      </div>

      {/* Kérdés Kártya */}
      <div className="question-card">
        <h2 className="question-text">{question.prompt}</h2>

        <div className="options-container">
          {question.options.map((opt, idx) => (
            <div 
              key={idx}
              onClick={() => handleSelect(idx)}
              className={`option-card ${selectedOption === idx ? 'selected' : ''}`}
            >
              <div className="option-radio"></div>
              <span>{opt}</span>
            </div>
          ))}
        </div>

        <div className="quiz-navigation">
          <button 
            className="btn btn-primary" 
            onClick={handleNext}
            disabled={selectedOption === undefined}
            style={{ 
              opacity: selectedOption === undefined ? 0.5 : 1,
              padding: '14px 32px',
              fontSize: '16px'
            }}
          >
            {currentStep === questions.length - 1 ? "Befejezés" : "Következő →"}
          </button>
        </div>
      </div>
    </div>
  );
};
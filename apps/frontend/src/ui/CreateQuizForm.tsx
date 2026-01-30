import React, { useState, useEffect } from 'react';
import { createQuiz, createQuestion, updateQuiz, getQuiz, CreateQuestionDto } from '../api/quizzes';
import { api } from '../api/http';

interface Props {
  quizId?: string | null;
  onSuccess: () => void;
}

export const CreateQuizForm = ({ quizId, onSuccess }: Props) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [questions, setQuestions] = useState<CreateQuestionDto[]>([]);

  // Éppen szerkesztett kérdés állapotai
  const [currentPrompt, setCurrentPrompt] = useState('');
  const [options, setOptions] = useState(['', '', '', '']); 
  const [correctIndex, setCorrectIndex] = useState(0);
  const [explanation, setExplanation] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Adatok betöltése szerkesztéskor
  useEffect(() => {
    if (quizId) {
      setLoading(true);
      getQuiz(quizId).then(q => {
        setTitle(q.title);
        setDescription(q.description || '');
      }).catch(console.error);
      
      api<any[]>(`/api/quizzes/${quizId}/questions`).then(qs => {
        const mapped = qs.map(q => ({
            prompt: q.prompt,
            options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options,
            correct_index: q.correct_index,
            explanation: q.explanation
        }));
        setQuestions(mapped);
      }).catch(console.error).finally(() => setLoading(false));
    }
  }, [quizId]);

  const getQuestionFromInput = (): CreateQuestionDto | null => {
    if (!currentPrompt.trim()) return null;

    const validOptions: string[] = [];
    let newCorrectIndex = 0;

    if (!options[correctIndex] || !options[correctIndex].trim()) {
      return null;
    }

    options.forEach((opt, idx) => {
      if (opt.trim()) {
        validOptions.push(opt);
        if (idx === correctIndex) {
          newCorrectIndex = validOptions.length - 1;
        }
      }
    });

    if (validOptions.length < 2) return null;

    return {
      prompt: currentPrompt,
      options: validOptions,
      correct_index: newCorrectIndex,
      explanation: explanation || undefined
    };
  };

  const handleAddQuestion = () => {
    const q = getQuestionFromInput();
    if (!q) {
      setError("Írj be egy kérdést, legalább 2 választ, és jelöld be a helyeset!");
      return;
    }
    setQuestions([...questions, q]);
    
    setCurrentPrompt('');
    setOptions(['', '', '', '']);
    setCorrectIndex(0);
    setExplanation('');
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    
    setLoading(true);
    setError(null);

    try {
      const finalQuestionsList = [...questions];
      const pendingQuestion = getQuestionFromInput();
      
      if (pendingQuestion) {
        finalQuestionsList.push(pendingQuestion);
      }

      if (finalQuestionsList.length === 0) {
        throw new Error("A kvíz nem lehet üres! Adj hozzá legalább egy kérdést.");
      }

      let targetQuizId = quizId;

      if (quizId) {
        await updateQuiz(quizId, { title, description });
      } else {
        const newQuiz = await createQuiz({ title, description });
        targetQuizId = newQuiz.id;
      }

      if (finalQuestionsList.length > 0) {
        for (const q of finalQuestionsList) {
          try {
            await createQuestion(targetQuizId!, q);
          } catch (err) {
            console.error("Hiba a kérdés mentésekor:", q.prompt, err);
          }
        }
      }

      alert("Kvíz sikeresen mentve!");
      onSuccess();
      
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Hiba történt a mentés során");
    } finally {
      setLoading(false);
    }
  };

  const updateOption = (idx: number, val: string) => {
    const newOpts = [...options];
    newOpts[idx] = val;
    setOptions(newOpts);
  };

  const removeQuestion = (idx: number) => {
    setQuestions(questions.filter((_, i) => i !== idx));
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {error && (
        <div style={{ 
          color: '#721c24', 
          background: '#f8d7da', 
          padding: '12px 16px', 
          borderRadius: '12px', 
          border: '1px solid #f5c6cb',
          fontSize: '14px'
        }}>
          {error}
        </div>
      )}
      
      <div className="input-group">
        <label>Kvíz Címe</label>
        <input 
          value={title} 
          onChange={e => setTitle(e.target.value)} 
          required 
          placeholder="Pl. Történelem alapok" 
        />
      </div>

      <div className="input-group">
        <label>Leírás</label>
        <input 
          value={description} 
          onChange={e => setDescription(e.target.value)} 
          placeholder="Rövid leírás a kvízről..." 
        />
      </div>
      
      {/* Hozzáadott kérdések listája */}
      {questions.length > 0 && (
        <div style={{ 
          background: '#f8f9fa', 
          padding: '20px', 
          borderRadius: '16px', 
          border: '2px solid #e0e0e0' 
        }}>
          <h3 style={{ 
            marginTop: 0, 
            marginBottom: '16px', 
            fontSize: '18px',
            color: 'var(--dark)'
          }}>
            Hozzáadott Kérdések ({questions.length})
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {questions.map((q, i) => (
              <div 
                key={i} 
                className="question-item"
                style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  padding: '16px',
                  background: 'white'
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '600', marginBottom: '8px', color: 'var(--dark)' }}>
                    {i + 1}. {q.prompt}
                  </div>
                  <div style={{ fontSize: '13px', color: '#666' }}>
                    {q.options.length} válasz • Helyes: #{q.correct_index + 1}
                  </div>
                </div>
                <button 
                  type="button"
                  onClick={() => removeQuestion(i)}
                  className="btn btn-secondary"
                  style={{ 
                    padding: '6px 12px', 
                    fontSize: '13px',
                    background: '#ffe6e6',
                    color: 'var(--danger)',
                    borderColor: 'var(--danger)'
                  }}
                >
                  Törlés
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Új kérdés hozzáadása */}
      <div className="question-item">
        <div className="question-header">
          <span className="question-number">+ Új Kérdés</span>
        </div>
        
        <div className="input-group">
          <label>Kérdés</label>
          <input 
            placeholder="Írd ide a kérdést..." 
            value={currentPrompt} 
            onChange={e => setCurrentPrompt(e.target.value)} 
          />
        </div>
        
        <div className="input-group">
          <label>Válaszlehetőségek (jelöld be a helyeset!)</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {options.map((opt, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <input 
                  type="radio" 
                  name="correct_answer_selector" 
                  checked={correctIndex === idx} 
                  onChange={() => setCorrectIndex(idx)} 
                  style={{ 
                    width: '20px', 
                    height: '20px', 
                    cursor: 'pointer',
                    margin: 0
                  }}
                />
                <input 
                  placeholder={`${idx + 1}. válasz`} 
                  value={opt} 
                  onChange={e => updateOption(idx, e.target.value)} 
                  style={{ flex: 1 }}
                />
              </div>
            ))}
          </div>
          <small style={{ display: 'block', marginTop: '8px', color: '#666', fontSize: '13px' }}>
            * Töltsd ki legalább 2 választ, és a pöttyel jelöld be a helyeset!
          </small>
        </div>

        <div className="input-group">
          <label>Magyarázat (opcionális)</label>
          <input 
            value={explanation} 
            onChange={e => setExplanation(e.target.value)} 
            placeholder="Miért ez a helyes válasz?" 
          />
        </div>

        <button 
          type="button" 
          onClick={handleAddQuestion} 
          className="btn btn-secondary"
          style={{ width: '100%' }}
        >
          Kérdés Hozzáadása
        </button>
      </div>

      <button 
        type="submit" 
        className="btn btn-primary" 
        disabled={loading} 
        style={{ 
          padding: '16px', 
          fontSize: '16px',
          opacity: loading ? 0.6 : 1
        }}
      >
        {loading ? 'Mentés folyamatban...' : (quizId ? 'Módosítások Mentése' : 'Kvíz Létrehozása')}
      </button>
    </form>
  );
};
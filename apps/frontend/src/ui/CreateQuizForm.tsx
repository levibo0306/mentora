import React, { useState, useEffect } from 'react';
import { createQuiz, createQuestion, updateQuiz, getQuiz, CreateQuestionDto, generateQuestionsAI } from '../api/quizzes';
import { api } from '../api/http';

interface Props {
  quizId?: string | null;
  onSuccess: () => void;
}

export const CreateQuizForm = ({ quizId, onSuccess }: Props) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [mode, setMode] = useState<'practice' | 'assessment'>('practice');
  const [questions, setQuestions] = useState<CreateQuestionDto[]>([]);

  // Aktuális kérdés szerkesztése
  const [currentPrompt, setCurrentPrompt] = useState('');
  const [options, setOptions] = useState(['', '', '', '']); 
  const [correctIndex, setCorrectIndex] = useState(0);
  const [explanation, setExplanation] = useState('');
  const [difficulty, setDifficulty] = useState(3); // Alapértelmezett: Medium (3)

  const [aiTopic, setAiTopic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (quizId) {
      setLoading(true);
      // Kvíz alapadatok betöltése
      getQuiz(quizId).then(q => {
        setTitle(q.title);
        setDescription(q.description || '');
        setMode(q.mode || 'practice');
      }).catch(console.error);
      
      // Kérdések betöltése
      api<any[]>(`/api/quizzes/${quizId}/questions`).then(qs => {
        const mapped = qs.map(q => ({
            prompt: q.prompt,
            options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options,
            correct_index: q.correct_index,
            explanation: q.explanation,
            difficulty: q.difficulty || 3
        }));
        setQuestions(mapped);
      }).catch(console.error).finally(() => setLoading(false));
    }
  }, [quizId]);

  const getQuestionFromInput = (): CreateQuestionDto | null => {
    if (!currentPrompt.trim()) return null;

    const validOptions = options.filter(opt => opt.trim() !== '');
    if (validOptions.length < 2) return null;

    return {
      prompt: currentPrompt,
      options: validOptions,
      correct_index: correctIndex,
      explanation: explanation || undefined,
      difficulty: difficulty
    };
  };

  const handleAddQuestion = () => {
    const q = getQuestionFromInput();
    if (!q) {
      setError("Legalább a kérdést és 2 választ töltsd ki!");
      return;
    }
    setQuestions([...questions, q]);
    
    // Mezők ürítése
    setCurrentPrompt('');
    setOptions(['', '', '', '']);
    setCorrectIndex(0);
    setExplanation('');
    setDifficulty(3);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const allQuestions = [...questions];
      const pending = getQuestionFromInput();
      if (pending) allQuestions.push(pending);

      if (allQuestions.length === 0) throw new Error("Adj hozzá legalább egy kérdést!");

      let id = quizId;
      if (quizId) {
        await updateQuiz(quizId, { title, description, mode });
      } else {
        const newQuiz = await createQuiz({ title, description, mode });
        id = newQuiz.id;
      }

      // Kérdések mentése (egyszerűsített verzió, a backend-től függően lehet tömeges is)
      for (const q of allQuestions) {
        await createQuestion(id!, q);
      }

      onSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="create-quiz-form">
      {error && <div className="error-message">{error}</div>}
      
      <div className="card section">
        <h3>Alapadatok</h3>
        <div className="input-group">
          <label>Kvíz címe</label>
          <input value={title} onChange={e => setTitle(e.target.value)} required />
        </div>
        
        <div className="input-group">
          <label>Mód</label>
          <select value={mode} onChange={e => setMode(e.target.value as any)}>
            <option value="practice">Gyakorlás</option>
            <option value="assessment">Vizsga</option>
          </select>
        </div>
      </div>

      <div className="card section question-builder">
        <h3>Új kérdés hozzáadása</h3>
        <input 
          className="prompt-input"
          placeholder="Kérdés szövege..." 
          value={currentPrompt} 
          onChange={e => setCurrentPrompt(e.target.value)} 
        />

        <div className="options-grid">
          {options.map((opt, idx) => (
            <div key={idx} className="option-row">
              <input 
                type="radio" 
                checked={correctIndex === idx} 
                onChange={() => setCorrectIndex(idx)} 
              />
              <input 
                value={opt} 
                onChange={e => {
                  const newOpts = [...options];
                  newOpts[idx] = e.target.value;
                  setOptions(newOpts);
                }} 
                placeholder={`Válasz ${idx + 1}`}
              />
            </div>
          ))}
        </div>

        <div className="difficulty-slider">
          <label>Nehézség: <strong>{difficulty}</strong></label>
          <input 
            type="range" min="1" max="5" 
            value={difficulty} 
            onChange={e => setDifficulty(Number(e.target.value))} 
          />
        </div>

        <button type="button" onClick={handleAddQuestion} className="btn-add">
          Kérdés mentése a listába
        </button>
      </div>

      <button type="submit" className="btn-submit" disabled={loading}>
        {loading ? 'Mentés...' : 'Kvíz véglegesítése'}
      </button>
    </form>
  );
};
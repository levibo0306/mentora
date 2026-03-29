import { useEffect, useMemo, useState } from "react";
import { createFlashcard, deleteFlashcard, Flashcard, getFlashcards } from "../api/flashcards";
import { getTopics, Topic } from "../api/topics";

type Props = {
  topicId?: string | null;
};

export const Flashcards = ({ topicId: fixedTopicId = null }: Props) => {
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [topicId, setTopicId] = useState<string | null>(fixedTopicId);
  const [front, setFront] = useState("");
  const [back, setBack] = useState("");
  const [loading, setLoading] = useState(false);
  const [practiceMode, setPracticeMode] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await getFlashcards(topicId);
      setCards(data);
      setCurrentIndex(0);
      setFlipped(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (fixedTopicId !== null) setTopicId(fixedTopicId);
  }, [fixedTopicId]);

  useEffect(() => {
    load();
  }, [topicId, fixedTopicId]);

  useEffect(() => {
    const loadTopics = async () => {
      try {
        const data = await getTopics();
        setTopics(data);
      } catch {
        setTopics([]);
      }
    };
    loadTopics();
  }, []);

  const addCard = async () => {
    if (!front.trim() || !back.trim()) return;
    await createFlashcard(front, back, topicId);
    setFront("");
    setBack("");
    await load();
  };

  const removeCard = async (id: string) => {
    if (!confirm("Biztosan törlöd a kártyát?")) return;
    await deleteFlashcard(id);
    await load();
  };

  const shuffled = useMemo(() => {
    if (!practiceMode) return cards;
    const copy = [...cards];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }, [cards, practiceMode]);

  const current = shuffled[currentIndex];

  return (
    <div className="flashcards">
      <div className="card section">
        <h3>Új tanulókártya</h3>
        {fixedTopicId === null && (
          <div className="input-group">
            <label>Téma</label>
            <select value={topicId ?? ""} onChange={(e) => setTopicId(e.target.value || null)}>
              <option value="">Nincs téma</option>
              {topics.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
        )}
        <div className="input-group">
          <label>Előlap (kérdés)</label>
          <input value={front} onChange={(e) => setFront(e.target.value)} placeholder="Mi az..." />
        </div>
        <div className="input-group">
          <label>Hátlap (válasz)</label>
          <textarea value={back} onChange={(e) => setBack(e.target.value)} rows={3} placeholder="A válasz..." />
        </div>
        <button className="btn btn-primary btn-sm" type="button" onClick={addCard}>
          + Hozzáadás
        </button>
      </div>

      <div className="card section">
        <div className="flashcards-header">
          <h3>Gyakorlás</h3>
          {fixedTopicId === null && (
            <select value={topicId ?? ""} onChange={(e) => setTopicId(e.target.value || null)}>
              <option value="">Összes téma</option>
              {topics.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          )}
          <button
            className="btn btn-secondary btn-sm"
            type="button"
            onClick={() => setPracticeMode((v) => !v)}
          >
            {practiceMode ? "Lista mód" : "Gyakorló mód"}
          </button>
        </div>

        {loading && <div className="loading">Betöltés...</div>}
        {!loading && cards.length === 0 && <div className="empty-subtle">Még nincs kártyád.</div>}

        {!loading && cards.length > 0 && practiceMode && current && (
          <div className="flashcard-practice">
            <div
              className={`flashcard ${flipped ? "flipped" : ""}`}
              onClick={() => setFlipped((v) => !v)}
            >
              <div className="flashcard-front">{current.front}</div>
              <div className="flashcard-back">{current.back}</div>
            </div>
            <div className="flashcard-actions">
              <button
                className="btn btn-secondary btn-sm"
                type="button"
                onClick={() => {
                  setFlipped(false);
                  setCurrentIndex((i) => Math.max(0, i - 1));
                }}
                disabled={currentIndex === 0}
              >
                ← Előző
              </button>
              <button
                className="btn btn-primary btn-sm"
                type="button"
                onClick={() => {
                  setFlipped(false);
                  setCurrentIndex((i) => Math.min(shuffled.length - 1, i + 1));
                }}
              >
                Következő →
              </button>
            </div>
            <div className="flashcard-meta">
              {currentIndex + 1} / {shuffled.length}
            </div>
          </div>
        )}

        {!loading && cards.length > 0 && !practiceMode && (
          <div className="flashcard-list">
            {cards.map((c) => (
              <div key={c.id} className="flashcard-row">
                <div>
                  <div className="flashcard-front">{c.front}</div>
                  <div className="flashcard-back">{c.back}</div>
                </div>
                <button className="btn btn-danger-soft btn-sm" type="button" onClick={() => removeCard(c.id)}>
                  Törlés
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

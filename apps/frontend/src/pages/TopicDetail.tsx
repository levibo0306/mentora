import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getTopic, Topic } from "../api/topics";
import { QuizList } from "../ui/QuizList";
import { Flashcards } from "../ui/Flashcards";

export const TopicDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [topic, setTopic] = useState<Topic | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      try {
        setLoading(true);
        const t = await getTopic(id);
        setTopic(t);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) return <div className="loading">Betöltés...</div>;
  if (!topic) return <div className="empty-state">Nem található téma.</div>;

  return (
    <div className="main-content">
      <div className="topic-header">
        <div>
          <div className="topic-title">{topic.name}</div>
          <div className="topic-meta">
            {topic.subject ? `${topic.subject} · ` : ""}{topic.grade ?? ""}
          </div>
          {topic.description && <div className="topic-desc">{topic.description}</div>}
        </div>
        <Link to="/" className="btn btn-secondary btn-sm">← Vissza</Link>
      </div>

      <div className="topic-section">
        <h3>Kvízek</h3>
        <QuizList onEdit={() => {}} topicId={topic.id} hideFilter />
      </div>

      <div className="topic-section">
        <h3>Tanulókártyák</h3>
        <Flashcards topicId={topic.id} />
      </div>
    </div>
  );
};

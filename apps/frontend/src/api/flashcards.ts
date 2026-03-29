import { api } from "./http";

export type Flashcard = {
  id: string;
  front: string;
  back: string;
  created_at: string;
};

export async function getFlashcards(topicId?: string | null) {
  const qs = topicId ? `?topic_id=${encodeURIComponent(topicId)}` : "";
  return api<Flashcard[]>(`/api/flashcards${qs}`);
}

export async function createFlashcard(front: string, back: string, topicId?: string | null) {
  return api<Flashcard>("/api/flashcards", {
    method: "POST",
    body: JSON.stringify({ front, back, topic_id: topicId ?? undefined }),
  });
}

export async function deleteFlashcard(id: string) {
  return api<{ ok: boolean }>(`/api/flashcards/${id}`, {
    method: "DELETE",
  });
}

import { api } from "./http";

export type SharedQuizData = {
  quiz: {
    id: string;
    title: string;
    description?: string;
  };
  questions: Array<{
    id: string;
    prompt: string;
    options: string[] | string; // Lehet string (JSON) is a backend-ből
  }>;
};

export type SharedQuizResult = {
  score: number;
  max: number;
};

/**
 * Megosztott kvíz betöltése token alapján
 */
export async function fetchSharedQuiz(token: string) {
  return api<SharedQuizData>(`/api/share/${token}`);
}

/**
 * Megosztott kvíz kitöltése
 */
export async function submitSharedQuiz(
  token: string, 
  answers: Record<string, number>
) {
  return api<SharedQuizResult>(`/api/share/${token}/submit`, {
    method: 'POST',
    body: JSON.stringify({ answers })
  });
}

/**
 * Megosztási link generálása (tanár)
 */
export async function createShareLink(quizId: string) {
  return api<{ token: string }>(`/api/quizzes/${quizId}/share`, {
    method: 'POST'
  });
}

// apps/frontend/src/api/quizzes.ts
import { api } from "./http"; // Most már az 'api'-t importáljuk a te kódod alapján


// apps/frontend/src/api/quizzes.ts

export interface Quiz {
  id: string;
  title: string;
  description?: string;
  mode: 'practice' | 'assessment';
  difficulty?: number;      // Ez maradjon meg a biztonság kedvéért
  avg_difficulty?: number | string | null;
  question_count?: number;
  total_attempts?: number;
  created_at: string;
  updated_at: string;
}

export type CreateQuizDto = {
  title: string;
  description?: string;
  mode: 'practice' | 'assessment'; // Ezt add hozzá!
  difficulty?: number; 
};

export type CreateQuestionDto = {
  prompt: string;
  options: string[];
  correct_index: number;
  explanation?: string;
  difficulty: number; 
};

// Válaszok típusa: { kerdes_id: valasztott_index }
export type QuizSubmission = {
  [questionId: string]: number; 
};

export type QuizResult = {
  score: number;   // Százalék (0-100)
  total: number;   // Összes kérdés száma
  correct: number; // Helyes válaszok száma
};
// --- API Hívások ---

// Kvízek listázása
export async function getQuizzes() {
  // A backend az '/api/quizzes' útvonalon figyel (lásd backend/src/index.ts)
  return api<Quiz[]>("/api/quizzes");
}

// Egy kvíz lekérése
export async function getQuiz(id: string) {
  return api<Quiz>(`/api/quizzes/${id}`);
}

// Kvíz létrehozása
export async function createQuiz(data: CreateQuizDto) {
  return api<Quiz>("/api/quizzes", {
    method: "POST",
    body: JSON.stringify(data), // Fontos: stringify kell, mert az api() wrappered csak a header-t állítja be
  });
}

// Kvíz módosítása
export async function updateQuiz(id: string, data: Partial<CreateQuizDto>) {
  return api<Quiz>(`/api/quizzes/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

// Kvíz törlése
export async function deleteQuiz(id: string) {
  return api<{ ok: boolean }>(`/api/quizzes/${id}`, {
    method: "DELETE",
  });
}

// Kérdés hozzáadása (EZT HASZNÁLJA A MODAL)
export async function createQuestion(quizId: string, data: CreateQuestionDto) {
  return api<any>(`/api/quizzes/${quizId}/questions`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}
export async function submitQuizAttempt(quizId: string, answers: QuizSubmission) {
  return api<QuizResult>(`/api/quizzes/${quizId}/attempt`, {
    method: "POST",
    body: JSON.stringify({ answers }),
  });
}

export async function generateQuestionsAI(topic: string) {
  return api<CreateQuestionDto[]>("/api/quizzes/generate-ai", {
    method: "POST",
    body: JSON.stringify({ topic }),
  });
}


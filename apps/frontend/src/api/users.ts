import { api } from "./http";

export type UserOverview = {
  role: "teacher" | "student";
  stats: Record<string, number>;
  badges: Array<{
    id: string;
    icon: string;
    name: string;
    requirement: string;
    earned: boolean;
  }>;
  xp: number;
  level: number;
  rank: string;
  next_level_xp?: number;
  daily_missions?: Array<{
    id: string;
    title: string;
    description: string;
    type: string;
    target: number;
    threshold?: number | null;
    difficulty: "easy" | "medium" | "hard";
    xp_reward: number;
    progress: number;
    completed_at?: string | null;
  }>;
  streak_days?: number;
};

export async function getUserOverview() {
  return api<UserOverview>("/api/users/me/overview");
}

export async function getUserMissions(limit = 14) {
  return api<UserOverview["daily_missions"]>(`/api/users/me/missions?limit=${limit}`);
}

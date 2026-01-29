import { api } from "./http";
import type { UserRole } from "../context/AuthContext";

export type AuthUser = {
  id: string;
  email: string;
  role: UserRole;
};

export function registerApi(email: string, password: string, role: UserRole) {
  return api("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password, role }),
  }) as Promise<{ token: string; user: AuthUser }>;
}

export function loginApi(email: string, password: string) {
  return api("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  }) as Promise<{ token: string; user: AuthUser }>;
}

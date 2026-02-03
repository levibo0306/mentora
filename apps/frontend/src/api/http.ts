const BASE = import.meta.env.VITE_API_BASE_URL ?? "";

let isRedirecting = false; // Prevent redirect loop

export async function api<T = any>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);

  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const token = localStorage.getItem("mentora_token");
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (!headers.has("X-Timezone-Offset")) {
    headers.set("X-Timezone-Offset", String(new Date().getTimezoneOffset()));
  }

  try {
    const res = await fetch(`${BASE}${path}`, { ...init, headers, cache: "no-store" });

    // 1. HA A SZERVER AZT MONDJA: "NEM VAGY BELÉPVE" (401)
    if (res.status === 401) {
      // Csak egyszer redirecteljünk
      if (!isRedirecting) {
        isRedirecting = true;
        localStorage.removeItem("mentora_token");
        localStorage.removeItem("mentora_user");
        
        // Csak akkor redirect, ha nem login/register oldalon vagyunk
        if (!window.location.pathname.includes("/login") && 
            !window.location.pathname.includes("/shared")) {
          window.location.href = "/login";
        }
      }
      throw new Error("Session expired");
    }

    // Reset redirect flag on successful request
    isRedirecting = false;

    if (res.status === 204) return null as any;

    if (!res.ok) {
      let msg = `${res.status} ${res.statusText}`;
      try {
        const data = await res.json();
        msg = data?.error ?? msg;
      } catch {}
      throw new Error(msg);
    }

    const ct = res.headers.get("content-type") ?? "";
    if (ct.includes("application/json")) return (await res.json()) as T;
    return (await res.text()) as any as T;
    
  } catch (error: any) {
    // Ha network error, ne redirecteljünk
    if (error.message === 'Failed to fetch') {
      console.error('Network error:', error);
      throw new Error('Hálózati hiba - ellenőrizd a backend-et');
    }
    throw error;
  }
}

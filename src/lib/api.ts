import { supabase } from "./supabase";

/**
 * Standardized fetch helper that automatically appends the Supabase JWT session token
 * to the request headers, ensuring all server endpoints are secure and context-aware.
 */
function getTokenFromStorage(): string | null {
  try {
    const raw = localStorage.getItem("supabase.auth.token");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.currentSession?.access_token || null;
  } catch {
    return null;
  }
}

export async function apiFetch(url: string, options: RequestInit = {}): Promise<Response> {
  let token: string | undefined;

  try {
    const { data: { session } } = await supabase.auth.getSession();
    token = session?.access_token;
  } catch (err) {
    console.warn("Could not retrieve active Supabase session for API header:", err);
  }

  if (!token && typeof window !== "undefined") {
    token = getTokenFromStorage() ?? undefined;
  }

  const headers = new Headers(options.headers || {});
  
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  
  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  return fetch(url, {
    ...options,
    headers,
  });
}

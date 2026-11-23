import { API_URL } from "../config";
import { formatApiError } from "./apiError";

type SignInResult =
  | { ok: true; user: unknown }
  | { ok: false; error: string; status: number; code: string | null; retryAfterSeconds: number | null };

function toPositiveSeconds(value: unknown): number | null {
  const parsed = typeof value === "number" || typeof value === "string" ? Number(value) : NaN;
  return Number.isFinite(parsed) && parsed > 0 ? Math.ceil(parsed) : null;
}

async function completeSignIn(response: Response, fallback: string): Promise<SignInResult> {
  const token = response.headers.get("Authorization");
  const data = await response.json().catch(() => null);
  const hasValidToken = Boolean(token?.startsWith("Bearer ") && token.length > "Bearer ".length);
  const hasUser = Boolean(data && typeof data === "object" && !Array.isArray(data));

  if (!response.ok || !hasValidToken || !hasUser) {
    const retryAfter = response.headers.get("Retry-After");
    const record = data && typeof data === "object" ? data as Record<string, unknown> : null;
    const retryAfterSeconds = toPositiveSeconds(record?.retry_after) ?? toPositiveSeconds(retryAfter);
    const code = typeof record?.code === "string" ? record.code : null;

    return { ok: false, error: formatApiError(data, fallback), status: response.status, code, retryAfterSeconds };
  }

  localStorage.setItem("token", token!);
  return { ok: true, user: data };
}

export async function signInWithPassword(email: string, password: string): Promise<SignInResult> {
  const response = await fetch(`${API_URL}/auth/sign_in`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user: { email, password } }),
  });

  return completeSignIn(response, "Email or password is incorrect!");
}

export async function signInWithGoogle(credential: string): Promise<SignInResult> {
  const response = await fetch(`${API_URL}/auth/google`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ credential }),
  });

  return completeSignIn(response, "Google sign-in could not be verified. Please try again.");
}

export async function signOut(): Promise<void> {
  const token = localStorage.getItem("token");

  await fetch(`${API_URL}/auth/sign_out`, {
    method: "DELETE",
    headers: {
      "Accept": "application/json",
      "Authorization": token || "",
    },
  }).catch(() => undefined);

  localStorage.removeItem("token");
  window.location.href = "/users/sign_in";
}

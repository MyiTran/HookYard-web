import { API_URL } from "../config";
import { formatApiError } from "./apiError";

export type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; status: number };

type HttpMethod = "GET" | "POST" | "PATCH" | "DELETE";

export async function apiRequest<T>(path: string, method: HttpMethod, body?: unknown): Promise<ApiResult<T>> {
  const token = localStorage.getItem("token");
  const hasBody = body !== undefined;

  try {
    const response = await fetch(`${API_URL}${path}`, {
      method,
      headers: {
        Accept: "application/json",
        ...(hasBody ? { "Content-Type": "application/json" } : {}),
        Authorization: token || "",
      },
      body: hasBody ? JSON.stringify(body) : undefined,
    });

    if (response.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/users/sign_in";
      return { ok: false, error: "Your session has expired. Please sign in again.", status: 401 };
    }

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      return {
        ok: false,
        error: formatApiError(data, "Something went wrong. Please try again."),
        status: response.status,
      };
    }

    return { ok: true, data: data as T };
  } catch {
    return { ok: false, error: "Unable to connect to the server. Please try again.", status: 0 };
  }
}

export async function apiRequestCollection<T>(path: string): Promise<ApiResult<T[]>> {
  const result = await apiRequest<{ data: T[] }>(path, "GET");

  return result.ok ? { ok: true, data: result.data.data } : result;
}

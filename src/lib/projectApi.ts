import { API_URL } from "../config";
import type { Project, ProjectInvitation, ProjectMembership } from "../types/project";
import { formatApiError } from "./apiError";

export type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; status: number };

type HttpMethod = "GET" | "POST" | "PATCH" | "DELETE";

async function request<T>(path: string, method: HttpMethod, body?: unknown): Promise<ApiResult<T>> {
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

async function requestCollection<T>(path: string): Promise<ApiResult<T[]>> {
  const result = await request<{ data: T[] }>(path, "GET");

  return result.ok ? { ok: true, data: result.data.data } : result;
}

export function listProjects(): Promise<ApiResult<Project[]>> {
  return requestCollection<Project>("/projects");
}

export function createProject(name: string): Promise<ApiResult<Project>> {
  return request<Project>("/projects", "POST", { project: { name } });
}

export function getProject(id: string): Promise<ApiResult<Project>> {
  return request<Project>(`/projects/${id}`, "GET");
}

export function updateProject(id: string, name: string): Promise<ApiResult<Project>> {
  return request<Project>(`/projects/${id}`, "PATCH", { project: { name } });
}

export function deleteProject(id: string): Promise<ApiResult<void>> {
  return request<void>(`/projects/${id}`, "DELETE");
}

export function listMemberships(projectId: string): Promise<ApiResult<ProjectMembership[]>> {
  return requestCollection<ProjectMembership>(`/projects/${projectId}/memberships`);
}

export function removeMembership(projectId: string, membershipId: string): Promise<ApiResult<void>> {
  return request<void>(`/projects/${projectId}/memberships/${membershipId}`, "DELETE");
}

export function listProjectInvitations(projectId: string): Promise<ApiResult<ProjectInvitation[]>> {
  return requestCollection<ProjectInvitation>(`/projects/${projectId}/invitations`);
}

export function createInvitation(projectId: string, email: string): Promise<ApiResult<ProjectInvitation>> {
  return request<ProjectInvitation>(`/projects/${projectId}/invitations`, "POST", { invitation: { email } });
}

export function cancelInvitation(projectId: string, invitationId: string): Promise<ApiResult<void>> {
  return request<void>(`/projects/${projectId}/invitations/${invitationId}`, "DELETE");
}

export function listMyInvitations(): Promise<ApiResult<ProjectInvitation[]>> {
  return requestCollection<ProjectInvitation>("/invitations");
}

export function acceptInvitation(id: string): Promise<ApiResult<ProjectInvitation>> {
  return request<ProjectInvitation>(`/invitations/${id}/accept`, "PATCH");
}

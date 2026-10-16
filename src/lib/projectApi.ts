import type { Project, ProjectInvitation, ProjectMembership, ProjectMembershipRole } from "../types/project";
import { apiRequest, apiRequestCollection, type ApiResult } from "./apiRequest";

export type ProjectQueryParams = {
  search?: string;
  role?: ProjectMembershipRole;
  order?: "created_desc" | "created_asc" | "name_asc";
};

export function getProjects(params: ProjectQueryParams = {}): Promise<ApiResult<Project[]>> {
  const query = new URLSearchParams();

  if (params.search) query.set("search", params.search);
  if (params.role) query.set("role", params.role);
  if (params.order) query.set("order", params.order);

  const suffix = query.toString();

  return apiRequestCollection<Project>(`/projects${suffix ? `?${suffix}` : ""}`);
}

export function createProject(name: string): Promise<ApiResult<Project>> {
  return apiRequest<Project>("/projects", "POST", { project: { name } });
}

export function getProject(id: string): Promise<ApiResult<Project>> {
  return apiRequest<Project>(`/projects/${id}`, "GET");
}

export function updateProject(id: string, name: string): Promise<ApiResult<Project>> {
  return apiRequest<Project>(`/projects/${id}`, "PATCH", { project: { name } });
}

export function deleteProject(id: string): Promise<ApiResult<void>> {
  return apiRequest<void>(`/projects/${id}`, "DELETE");
}

export function listMemberships(projectId: string): Promise<ApiResult<ProjectMembership[]>> {
  return apiRequestCollection<ProjectMembership>(`/projects/${projectId}/memberships`);
}

export function removeMembership(projectId: string, membershipId: string): Promise<ApiResult<void>> {
  return apiRequest<void>(`/projects/${projectId}/memberships/${membershipId}`, "DELETE");
}

export function listProjectInvitations(projectId: string): Promise<ApiResult<ProjectInvitation[]>> {
  return apiRequestCollection<ProjectInvitation>(`/projects/${projectId}/invitations`);
}

export function createInvitation(projectId: string, email: string): Promise<ApiResult<ProjectInvitation>> {
  return apiRequest<ProjectInvitation>(`/projects/${projectId}/invitations`, "POST", { invitation: { email } });
}

export function cancelInvitation(projectId: string, invitationId: string): Promise<ApiResult<void>> {
  return apiRequest<void>(`/projects/${projectId}/invitations/${invitationId}`, "DELETE");
}

export function listMyInvitations(): Promise<ApiResult<ProjectInvitation[]>> {
  return apiRequestCollection<ProjectInvitation>("/invitations");
}

export function acceptInvitation(id: string): Promise<ApiResult<ProjectInvitation>> {
  return apiRequest<ProjectInvitation>(`/invitations/${id}/accept`, "PATCH");
}

export function declineInvitation(id: string): Promise<ApiResult<ProjectInvitation>> {
  return apiRequest<ProjectInvitation>(`/invitations/${id}/decline`, "PATCH");
}

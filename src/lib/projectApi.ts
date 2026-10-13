import type { Project, ProjectInvitation, ProjectMembership } from "../types/project";
import { apiRequest, apiRequestCollection, type ApiResult } from "./apiRequest";

export function listProjects(): Promise<ApiResult<Project[]>> {
  return apiRequestCollection<Project>("/projects");
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

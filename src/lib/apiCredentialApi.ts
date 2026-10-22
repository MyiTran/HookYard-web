import type { CreatedProjectApiCredential, ProjectApiCredential } from "../types/apiCredential";
import type { Paginated } from "../types/pagination";
import { apiRequest, apiRequestPage, type ApiResult } from "./apiRequest";

export const API_KEYS_PAGE_SIZE = 25;

export function listProjectApiCredentials(
  projectId: string,
  page = 1,
  perPage = API_KEYS_PAGE_SIZE,
): Promise<ApiResult<Paginated<ProjectApiCredential>>> {
  const query = new URLSearchParams();

  if (page > 1) query.set("page[number]", String(page));
  query.set("page[size]", String(perPage));

  return apiRequestPage<ProjectApiCredential>(`/projects/${projectId}/api_credentials?${query.toString()}`);
}

export function createProjectApiCredential(
  projectId: string,
  name: string,
): Promise<ApiResult<CreatedProjectApiCredential>> {
  return apiRequest<CreatedProjectApiCredential>(`/projects/${projectId}/api_credentials`, "POST", {
    api_credential: { name },
  });
}

export function revokeProjectApiCredential(
  projectId: string,
  credentialId: string,
): Promise<ApiResult<ProjectApiCredential>> {
  return apiRequest<ProjectApiCredential>(
    `/projects/${projectId}/api_credentials/${credentialId}/revoke`,
    "POST",
  );
}

import type { Endpoint, EndpointInput, EndpointWithSigningSecret } from "../types/endpoint";
import type { Paginated } from "../types/pagination";
import { apiRequest, apiRequestPage, type ApiResult } from "./apiRequest";

export type EndpointOrder = "created_desc" | "created_asc" | "name_asc";

export type GlobalEndpointQuery = {
  q?: string;
  projectId?: string;
  active?: boolean;
  archived?: boolean;
  order?: EndpointOrder;
  page?: number;
  perPage?: number;
};

function buildPageParams(page?: number, perPage?: number): URLSearchParams {
  const query = new URLSearchParams();

  if (page && page > 1) query.set("page[number]", String(page));
  if (perPage) query.set("page[size]", String(perPage));

  return query;
}

export function getEndpoints(params: GlobalEndpointQuery = {}): Promise<ApiResult<Paginated<Endpoint>>> {
  const query = buildPageParams(params.page, params.perPage);

  if (params.q) query.set("q", params.q);
  if (params.projectId) query.set("project_id", params.projectId);
  if (params.active !== undefined) query.set("active", String(params.active));
  if (params.archived !== undefined) query.set("archived", String(params.archived));
  if (params.order) query.set("order", params.order);

  const suffix = query.toString();

  return apiRequestPage<Endpoint>(`/endpoints${suffix ? `?${suffix}` : ""}`);
}

export function listProjectEndpoints(
  projectId: string,
  page = 1,
  perPage?: number,
): Promise<ApiResult<Paginated<Endpoint>>> {
  const query = buildPageParams(page, perPage);
  const suffix = query.toString();

  return apiRequestPage<Endpoint>(`/projects/${projectId}/endpoints${suffix ? `?${suffix}` : ""}`);
}

export function getEndpoint(projectId: string, endpointId: string): Promise<ApiResult<Endpoint>> {
  return apiRequest<Endpoint>(`/projects/${projectId}/endpoints/${endpointId}`, "GET");
}

export function createEndpoint(projectId: string, input: EndpointInput): Promise<ApiResult<EndpointWithSigningSecret>> {
  return apiRequest<EndpointWithSigningSecret>(`/projects/${projectId}/endpoints`, "POST", { endpoint: input });
}

export function updateEndpoint(
  projectId: string,
  endpointId: string,
  input: EndpointInput,
): Promise<ApiResult<Endpoint>> {
  return apiRequest<Endpoint>(`/projects/${projectId}/endpoints/${endpointId}`, "PATCH", { endpoint: input });
}

export function archiveEndpoint(projectId: string, endpointId: string): Promise<ApiResult<void>> {
  return apiRequest<void>(`/projects/${projectId}/endpoints/${endpointId}`, "DELETE");
}

export function rotateSigningSecret(
  projectId: string,
  endpointId: string,
): Promise<ApiResult<EndpointWithSigningSecret>> {
  return apiRequest<EndpointWithSigningSecret>(
    `/projects/${projectId}/endpoints/${endpointId}/rotate_signing_secret`,
    "POST",
  );
}

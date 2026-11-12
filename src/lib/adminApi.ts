import type {
  AdminDelivery,
  AdminEndpoint,
  AdminEndpointDetail,
  AdminOverview,
  AdminProject,
  AdminProjectDetail,
  AdminSupportAccount,
  AdminSupportAccountDetail,
} from "../types/admin";
import type { Paginated } from "../types/pagination";
import type { Plan } from "../types/plan";
import { apiRequest, apiRequestPage, type ApiResult } from "./apiRequest";
import { toUtcRangeBound } from "./dateRange";

export type AdminSupportAccountsQuery = {
  q?: string;
  role?: "admin" | "support" | "none";
  plan?: Plan;
  active?: boolean;
  order?: "created_desc" | "created_asc" | "email_asc";
  page?: number;
  perPage?: number;
};

export type AdminProjectsQuery = {
  q?: string;
  accountId?: string;
  plan?: Plan;
  order?: "created_desc" | "created_asc" | "name_asc";
  page?: number;
  perPage?: number;
};

export type AdminEndpointsQuery = {
  q?: string;
  projectId?: string;
  circuitState?: "enabled" | "circuit_open" | "disabled";
  active?: boolean;
  archived?: boolean;
  order?: "created_desc" | "created_asc" | "name_asc";
  page?: number;
  perPage?: number;
};

export type AdminDeliveriesQuery = {
  accountId?: string;
  status?: string;
  failureCategory?: string;
  projectId?: string;
  endpointId?: string;
  from?: string;
  to?: string;
  order?: "created_desc" | "created_asc";
  page?: number;
  perPage?: number;
};

function buildPageParams(page?: number, perPage?: number): URLSearchParams {
  const query = new URLSearchParams();

  if (page && page > 1) query.set("page[number]", String(page));
  if (perPage) query.set("page[size]", String(perPage));

  return query;
}

function setIfPresent(query: URLSearchParams, key: string, value: string | undefined): void {
  if (value) query.set(key, value);
}

export function getAdminOverview(): Promise<ApiResult<AdminOverview>> {
  return apiRequest<AdminOverview>("/admin/dashboard", "GET");
}

export function getAdminSupportAccounts(
  params: AdminSupportAccountsQuery = {},
): Promise<ApiResult<Paginated<AdminSupportAccount>>> {
  const query = buildPageParams(params.page, params.perPage);

  setIfPresent(query, "q", params.q);
  setIfPresent(query, "role", params.role);
  setIfPresent(query, "plan", params.plan);
  if (params.active !== undefined) query.set("active", String(params.active));
  setIfPresent(query, "order", params.order);

  const suffix = query.toString();

  return apiRequestPage<AdminSupportAccount>(`/admin/support_accounts${suffix ? `?${suffix}` : ""}`);
}

export function getAdminAccount(accountId: string): Promise<ApiResult<AdminSupportAccountDetail>> {
  return apiRequest<AdminSupportAccountDetail>(`/admin/accounts/${accountId}`, "GET");
}

export function changeAdminAccountPlan(accountId: string, plan: Plan): Promise<ApiResult<AdminSupportAccount>> {
  return apiRequest<AdminSupportAccount>(`/admin/accounts/${accountId}/plan`, "PATCH", { plan });
}

export function getAdminProjects(params: AdminProjectsQuery = {}): Promise<ApiResult<Paginated<AdminProject>>> {
  const query = buildPageParams(params.page, params.perPage);

  setIfPresent(query, "q", params.q);
  setIfPresent(query, "account_id", params.accountId);
  setIfPresent(query, "plan", params.plan);
  setIfPresent(query, "order", params.order);

  const suffix = query.toString();

  return apiRequestPage<AdminProject>(`/admin/projects${suffix ? `?${suffix}` : ""}`);
}

export function getAdminProject(projectId: string): Promise<ApiResult<AdminProjectDetail>> {
  return apiRequest<AdminProjectDetail>(`/admin/projects/${projectId}`, "GET");
}

export function getAdminEndpoints(params: AdminEndpointsQuery = {}): Promise<ApiResult<Paginated<AdminEndpoint>>> {
  const query = buildPageParams(params.page, params.perPage);

  setIfPresent(query, "q", params.q);
  setIfPresent(query, "project_id", params.projectId);
  setIfPresent(query, "circuit_state", params.circuitState);
  if (params.active !== undefined) query.set("active", String(params.active));
  if (params.archived !== undefined) query.set("archived", String(params.archived));
  setIfPresent(query, "order", params.order);

  const suffix = query.toString();

  return apiRequestPage<AdminEndpoint>(`/admin/endpoints${suffix ? `?${suffix}` : ""}`);
}

export function getAdminEndpoint(endpointId: string): Promise<ApiResult<AdminEndpointDetail>> {
  return apiRequest<AdminEndpointDetail>(`/admin/endpoints/${endpointId}`, "GET");
}

export function getAdminDeliveries(params: AdminDeliveriesQuery = {}): Promise<ApiResult<Paginated<AdminDelivery>>> {
  const query = buildPageParams(params.page, params.perPage);

  setIfPresent(query, "account_id", params.accountId);
  setIfPresent(query, "status", params.status);
  setIfPresent(query, "failure_category", params.failureCategory);
  setIfPresent(query, "project_id", params.projectId);
  setIfPresent(query, "endpoint_id", params.endpointId);
  if (params.from) query.set("from", toUtcRangeBound(params.from, "start"));
  if (params.to) query.set("to", toUtcRangeBound(params.to, "end"));
  setIfPresent(query, "order", params.order);

  const suffix = query.toString();

  return apiRequestPage<AdminDelivery>(`/admin/deliveries${suffix ? `?${suffix}` : ""}`);
}

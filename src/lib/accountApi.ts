import type { AccountPlan, Plan } from "../types/plan";
import { apiRequest, type ApiResult } from "./apiRequest";

export function getAccount(): Promise<ApiResult<AccountPlan>> {
  return apiRequest<AccountPlan>("/account", "GET");
}

export function changeAccountPlan(plan: Plan): Promise<ApiResult<AccountPlan>> {
  return apiRequest<AccountPlan>("/account/plan", "PATCH", { account: { plan } });
}

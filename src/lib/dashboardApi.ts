import { apiRequest, type ApiResult } from "./apiRequest";
import type { UserDashboard } from "../types/userDashboard";

export function getUserDashboard(): Promise<ApiResult<UserDashboard>> {
  return apiRequest<UserDashboard>("/dashboard", "GET");
}

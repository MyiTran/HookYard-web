import type { EndpointDiagnosis } from "../types/diagnosis";
import { apiRequest, type ApiResult } from "./apiRequest";

export function createEndpointDiagnosis(projectId: string, endpointId: string): Promise<ApiResult<EndpointDiagnosis>> {
  return apiRequest<EndpointDiagnosis>(`/projects/${projectId}/endpoints/${endpointId}/diagnoses`, "POST");
}

export function getLatestEndpointDiagnosis(
  projectId: string,
  endpointId: string,
): Promise<ApiResult<EndpointDiagnosis | null>> {
  return apiRequest<EndpointDiagnosis | null>(
    `/projects/${projectId}/endpoints/${endpointId}/diagnoses/latest`,
    "GET",
  );
}

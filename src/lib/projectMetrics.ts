import type { ApiResult } from "./apiRequest";
import { getDeliveries } from "./deliveryApi";
import { listProjectEndpoints } from "./endpointApi";

export type ProjectMetrics = {
  endpointCount: number;
  eventCount: number;
  successRate: number;
  failedCount: number;
};

export async function getProjectMetrics(projectId: string): Promise<ApiResult<ProjectMetrics>> {
  const [endpointsResult, allMessagesResult, succeededResult, failedResult] = await Promise.all([
    listProjectEndpoints(projectId, 1, 1),
    getDeliveries({ projectId, page: 1, perPage: 1 }),
    getDeliveries({ projectId, status: "succeeded", page: 1, perPage: 1 }),
    getDeliveries({ projectId, status: "failed", page: 1, perPage: 1 }),
  ]);

  if (!endpointsResult.ok) return endpointsResult;
  if (!allMessagesResult.ok) return allMessagesResult;
  if (!succeededResult.ok) return succeededResult;
  if (!failedResult.ok) return failedResult;

  const succeededCount = succeededResult.data.meta.total_count;
  const failedCount = failedResult.data.meta.total_count;
  const completedCount = succeededCount + failedCount;

  return {
    ok: true,
    data: {
      endpointCount: endpointsResult.data.meta.total_count,
      eventCount: allMessagesResult.data.meta.total_count,
      successRate: completedCount === 0 ? 0 : Math.round((succeededCount / completedCount) * 100),
      failedCount,
    },
  };
}

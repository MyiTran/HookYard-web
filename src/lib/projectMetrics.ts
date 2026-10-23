import type { Endpoint } from "../types/endpoint";
import type { GlobalDeliveryMessageSummary } from "../types/delivery";
import { getDeliveries } from "./deliveryApi";
import { getEndpoints, listProjectEndpoints } from "./endpointApi";
import type { ApiResult } from "./apiRequest";

export type ProjectMetrics = {
  endpointCount: number;
  eventCount: number;
  successRate: number | null;
  failedCount: number;
};

type ProjectMetricTotals = {
  endpointCount: number;
  eventCount: number;
  succeededCount: number;
  failedCount: number;
};

const METRICS_PAGE_SIZE = 100;

async function listAllEndpoints(): Promise<ApiResult<Endpoint[]>> {
  const endpoints: Endpoint[] = [];
  let page = 1;

  while (true) {
    const result = await getEndpoints({ page, perPage: METRICS_PAGE_SIZE });

    if (!result.ok) return result;

    endpoints.push(...result.data.data);

    if (page >= Math.max(1, result.data.meta.last_page)) return { ok: true, data: endpoints };

    page += 1;
  }
}

async function listAllDeliveries(): Promise<ApiResult<GlobalDeliveryMessageSummary[]>> {
  const messages: GlobalDeliveryMessageSummary[] = [];
  let page = 1;

  while (true) {
    const result = await getDeliveries({ page, perPage: METRICS_PAGE_SIZE });

    if (!result.ok) return result;

    messages.push(...result.data.data);

    if (page >= Math.max(1, result.data.meta.last_page)) return { ok: true, data: messages };

    page += 1;
  }
}

function emptyTotals(): ProjectMetricTotals {
  return { endpointCount: 0, eventCount: 0, succeededCount: 0, failedCount: 0 };
}

function toMetrics(totals: ProjectMetricTotals): ProjectMetrics {
  const completedCount = totals.succeededCount + totals.failedCount;

  return {
    endpointCount: totals.endpointCount,
    eventCount: totals.eventCount,
    successRate: completedCount === 0 ? null : Math.round((totals.succeededCount / completedCount) * 100),
    failedCount: totals.failedCount,
  };
}

export async function getProjectsMetrics(projectIds: string[]): Promise<ApiResult<Map<string, ProjectMetrics>>> {
  const [endpointsResult, deliveriesResult] = await Promise.all([listAllEndpoints(), listAllDeliveries()]);

  if (!endpointsResult.ok) return endpointsResult;
  if (!deliveriesResult.ok) return deliveriesResult;

  const totalsByProject = new Map<string, ProjectMetricTotals>();
  projectIds.forEach((projectId) => totalsByProject.set(projectId, emptyTotals()));

  endpointsResult.data.forEach((endpoint) => {
    const totals = totalsByProject.get(endpoint.project.id);

    if (totals) totals.endpointCount += 1;
  });

  deliveriesResult.data.forEach((message) => {
    const totals = totalsByProject.get(message.project.id);

    if (!totals) return;

    totals.eventCount += 1;
    if (message.status === "succeeded") totals.succeededCount += 1;
    if (message.status === "failed") totals.failedCount += 1;
  });

  return {
    ok: true,
    data: new Map(
      projectIds.map((projectId) => [projectId, toMetrics(totalsByProject.get(projectId) ?? emptyTotals())]),
    ),
  };
}

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

  return {
    ok: true,
    data: toMetrics({
      endpointCount: endpointsResult.data.meta.total_count,
      eventCount: allMessagesResult.data.meta.total_count,
      succeededCount,
      failedCount,
    }),
  };
}

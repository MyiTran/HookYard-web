import type { DeliveryOrder } from "../types/delivery";
import type { ReplayPreview, ReplayRun } from "../types/replay";
import { apiRequest, type ApiResult } from "./apiRequest";
import { toUtcRangeBound } from "./dateRange";
import { readMessageSearchParam } from "./deliveryApi";

export const REPLAY_POLL_INTERVAL_MS = 3000;
export const REPLAY_HELD_POLL_INTERVAL_MS = 30000;
export const REPLAY_HELD_POLL_MAX_WAIT_MS = 5 * 60 * 1000;

export type ReplayFilterInput = {
  q?: string;
  endpointId?: string;
  eventType?: string;
  from?: string;
  to?: string;
  order?: DeliveryOrder;
};

export function buildReplayFilters(filters: ReplayFilterInput): Record<string, string> {
  const body: Record<string, string> = {};
  const search = readMessageSearchParam(filters.q ?? "");

  if (search) body[search.key] = search.value;
  if (filters.endpointId) body.endpoint_id = filters.endpointId;
  if (filters.eventType) body.event_type = filters.eventType;
  if (filters.from) body.from = toUtcRangeBound(filters.from, "start");
  if (filters.to) body.to = toUtcRangeBound(filters.to, "end");
  if (filters.order) body.order = filters.order;

  return body;
}

export function previewReplay(projectId: string, filters: ReplayFilterInput): Promise<ApiResult<ReplayPreview>> {
  return apiRequest<ReplayPreview>(`/projects/${projectId}/replays/preview`, "POST", buildReplayFilters(filters));
}

export function createBulkReplay(projectId: string, filters: ReplayFilterInput): Promise<ApiResult<ReplayRun>> {
  return apiRequest<ReplayRun>(`/projects/${projectId}/replays`, "POST", buildReplayFilters(filters));
}

export function getReplayRun(projectId: string, replayRunId: string): Promise<ApiResult<ReplayRun>> {
  return apiRequest<ReplayRun>(`/projects/${projectId}/replays/${replayRunId}`, "GET");
}

export function replayMessage(messageId: string): Promise<ApiResult<ReplayRun>> {
  return apiRequest<ReplayRun>(`/messages/${messageId}/replay`, "POST");
}

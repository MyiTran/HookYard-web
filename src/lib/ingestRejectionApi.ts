import type { IngestRejection, IngestRejectionFilters, IngestRejectionReason } from "../types/ingestRejection";
import type { Paginated } from "../types/pagination";
import { apiRequestPage, type ApiResult } from "./apiRequest";
import { toUtcRangeBound } from "./dateRange";

export const INGEST_REJECTIONS_PAGE_SIZE = 25;
export const INGEST_REJECTIONS_PAGE_SIZES = [25, 50, 100];

export type IngestRejectionQuery = {
  projectId?: string;
  reason?: IngestRejectionReason;
  eventType?: string;
  from?: string;
  to?: string;
  order?: IngestRejectionFilters["order"];
  page?: number;
  perPage?: number;
};

function buildQuery(params: IngestRejectionQuery): URLSearchParams {
  const query = new URLSearchParams();

  if (params.page && params.page > 1) query.set("page[number]", String(params.page));
  if (params.perPage) query.set("page[size]", String(params.perPage));
  if (params.projectId) query.set("project_id", params.projectId);
  if (params.reason) query.set("reason", params.reason);
  if (params.eventType) query.set("event_type", params.eventType);
  if (params.from) query.set("from", toUtcRangeBound(params.from, "start"));
  if (params.to) query.set("to", toUtcRangeBound(params.to, "end"));
  if (params.order) query.set("order", params.order);

  return query;
}

export function getIngestRejections(
  params: IngestRejectionQuery = {},
): Promise<ApiResult<Paginated<IngestRejection>>> {
  const suffix = buildQuery(params).toString();

  return apiRequestPage<IngestRejection>(`/ingest_rejections${suffix ? `?${suffix}` : ""}`);
}

import type {
  DeliveryMessageDetail,
  DeliveryMessageSummary,
  DeliveryOrder,
  DeliveryStateFilter,
  GlobalDeliveryMessageSummary,
  MessageStatus,
} from "../types/delivery";
import type { Paginated } from "../types/pagination";
import { apiRequest, apiRequestPage, type ApiResult } from "./apiRequest";

export const DELIVERIES_PAGE_SIZE = 25;
export const DELIVERIES_PAGE_SIZES = [25, 50, 100];

export type DeliveryQuery = {
  q?: string;
  projectId?: string;
  endpointId?: string;
  status?: MessageStatus;
  deliveryState?: DeliveryStateFilter;
  eventType?: string;
  from?: string;
  to?: string;
  order?: DeliveryOrder;
  page?: number;
  perPage?: number;
};

function buildPageParams(page?: number, perPage?: number): URLSearchParams {
  const query = new URLSearchParams();

  if (page && page > 1) query.set("page[number]", String(page));
  if (perPage) query.set("page[size]", String(perPage));

  return query;
}

function toRangeBound(value: string, edge: "start" | "end"): string {
  const time = edge === "start" ? "T00:00:00.000" : "T23:59:59.999";
  const date = new Date(`${value}${time}`);

  return Number.isNaN(date.getTime()) ? value : date.toISOString();
}

export function getDeliveries(
  params: DeliveryQuery = {},
): Promise<ApiResult<Paginated<GlobalDeliveryMessageSummary>>> {
  const query = buildPageParams(params.page, params.perPage);

  if (params.q) query.set("q", params.q);
  if (params.projectId) query.set("project_id", params.projectId);
  if (params.endpointId) query.set("endpoint_id", params.endpointId);
  if (params.status) query.set("status", params.status);
  if (params.deliveryState) query.set("delivery_state", params.deliveryState);
  if (params.eventType) query.set("event_type", params.eventType);
  if (params.from) query.set("from", toRangeBound(params.from, "start"));
  if (params.to) query.set("to", toRangeBound(params.to, "end"));
  if (params.order) query.set("order", params.order);

  const suffix = query.toString();

  return apiRequestPage<GlobalDeliveryMessageSummary>(`/messages${suffix ? `?${suffix}` : ""}`);
}

export function listEndpointMessages(
  projectId: string,
  endpointId: string,
  page = 1,
  perPage = DELIVERIES_PAGE_SIZE,
): Promise<ApiResult<Paginated<DeliveryMessageSummary>>> {
  const suffix = buildPageParams(page, perPage).toString();

  return apiRequestPage<DeliveryMessageSummary>(
    `/projects/${projectId}/endpoints/${endpointId}/messages${suffix ? `?${suffix}` : ""}`,
  );
}

export function getDeliveryMessage(projectId: string, messageId: string): Promise<ApiResult<DeliveryMessageDetail>> {
  return apiRequest<DeliveryMessageDetail>(`/projects/${projectId}/messages/${messageId}`, "GET");
}

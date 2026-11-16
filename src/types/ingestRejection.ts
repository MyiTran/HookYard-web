import type { DeliveryOrder } from "./delivery";

export type IngestRejectionReason = "queue_capacity_exceeded" | "monthly_delivery_limit_exceeded";

export type IngestRejectionProjectRef = {
  id: string;
  name: string;
};

export type IngestRejectionEndpointRef = {
  id: string;
  name: string;
};

export type IngestRejection = {
  id: string;
  reason: IngestRejectionReason;
  event_type: string;
  created_at: string;
  project: IngestRejectionProjectRef;
  endpoint: IngestRejectionEndpointRef | null;
  payload_keys: string[];
  payload_bytes: number;
};

export type IngestRejectionReasonFilter = "all" | IngestRejectionReason;

export type IngestRejectionFilters = {
  projectId: string;
  reason: IngestRejectionReasonFilter;
  eventType: string;
  from: string;
  to: string;
  order: DeliveryOrder;
};

export type IngestRejectionFilterKey = keyof IngestRejectionFilters;

export type MessageStatus = "pending" | "delivering" | "succeeded" | "failed";

export type DeliveryState =
  | "queued"
  | "scheduled_retry"
  | "held_by_circuit"
  | "delivering"
  | "terminal";

export type DeliveryHoldReason = "endpoint_circuit_open" | "endpoint_disabled";

export type DeliveryHold = {
  reason: DeliveryHoldReason;
  since: string;
  release_at: string | null;
};

export type AttemptStatus = "succeeded" | "failed";

export type DeliveryMessageSummary = {
  id: string;
  webhook_id: string;
  status: MessageStatus;
  event_id: string;
  event_type: string;
  created_at: string;
  updated_at: string;
  attempt_count: number;
  max_attempts: number | null;
  next_retry_at: string | null;
  terminal_at: string | null;
  retryable: boolean;
  delivery_state?: DeliveryState;
  hold?: DeliveryHold | null;
  last_attempt_at: string | null;
  last_response_status: number | null;
  last_duration_ms: number | null;
  last_error_type: string | null;
};

export type DeliveryProjectRef = {
  id: string;
  name: string;
};

export type DeliveryEndpointListRef = {
  id: string;
  name: string;
  url: string;
};

export type GlobalDeliveryMessageSummary = DeliveryMessageSummary & {
  project: DeliveryProjectRef;
  endpoint: DeliveryEndpointListRef;
};

export type DeliveryOrder = "created_desc" | "created_asc";

export type DeliveryStatusFilter = "all" | MessageStatus;

export type DeliveryFilters = {
  q: string;
  projectId: string;
  endpointId: string;
  status: DeliveryStatusFilter;
  eventType: string;
  from: string;
  to: string;
  order: DeliveryOrder;
};

export type DeliveryFilterKey = keyof DeliveryFilters;

export type DeliveryEvent = {
  id: string;
  event_type: string;
  payload: unknown;
  created_at: string;
};

export type DeliveryEndpointRef = {
  id: string;
  name: string;
  url: string;
  project: {
    id: string;
    name: string;
  };
};

export type DeliveryAttempt = {
  id: string;
  attempt_number: number;
  request_id: string;
  webhook_id: string;
  signing_secret_version: number;
  signed_at: string;
  created_at: string;
  request_url: string;
  http_method: string;
  request_headers: Record<string, string>;
  request_body: string;
  response_status: number | null;
  response_headers: Record<string, string> | null;
  response_body: string | null;
  duration_ms: number | null;
  error_type: string | null;
  error_message: string | null;
  status: AttemptStatus;
};

export type DeliveryMessageDetail = {
  id: string;
  webhook_id: string;
  status: MessageStatus;
  created_at: string;
  updated_at: string;
  attempt_count: number;
  max_attempts: number | null;
  next_retry_at: string | null;
  terminal_at: string | null;
  retryable: boolean;
  delivery_state?: DeliveryState;
  hold?: DeliveryHold | null;
  event: DeliveryEvent;
  endpoint: DeliveryEndpointRef;
  attempts: DeliveryAttempt[];
};

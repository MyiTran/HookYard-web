import type {
  DeliveryMessageDetail,
  DeliveryMessageSummary,
  DeliveryState,
  MessageStatus,
  RealtimeDeliveryStatus,
} from "../types/delivery";

export type EndpointDeliveryUpdate = {
  type: "delivery.updated";
  endpointId: string;
  messageId: string;
  eventType: string;
  status: RealtimeDeliveryStatus;
  messageStatus: MessageStatus;
  deliveryState: DeliveryState;
  attemptCount: number;
  latestAttemptStatus: "succeeded" | "failed" | null;
  responseStatus: number | null;
  errorType: string | null;
  durationMs: number | null;
  occurredAt: string;
};

const REALTIME_STATUSES: RealtimeDeliveryStatus[] = [
  "pending",
  "processing",
  "succeeded",
  "failed",
  "held",
  "retry_scheduled",
];

function readString(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

function readNullableString(value: unknown): string | null | undefined {
  if (value === null) return null;

  return typeof value === "string" ? value : undefined;
}

function readNullableInteger(value: unknown): number | null | undefined {
  if (value === null) return null;

  return typeof value === "number" && Number.isInteger(value) ? value : undefined;
}

function normalizeStatus(status: RealtimeDeliveryStatus): { messageStatus: MessageStatus; deliveryState: DeliveryState } {
  if (status === "processing") return { messageStatus: "delivering", deliveryState: "delivering" };
  if (status === "held") return { messageStatus: "pending", deliveryState: "held_by_circuit" };
  if (status === "retry_scheduled") return { messageStatus: "pending", deliveryState: "scheduled_retry" };
  if (status === "succeeded" || status === "failed") return { messageStatus: status, deliveryState: "terminal" };

  return { messageStatus: "pending", deliveryState: "queued" };
}

export function parseEndpointDeliveryUpdate(data: unknown): EndpointDeliveryUpdate | null {
  if (typeof data !== "object" || data === null) return null;

  const payload = data as Record<string, unknown>;
  const type = readString(payload.type);
  const endpointId = readString(payload.endpoint_id);
  const messageId = readString(payload.message_id);
  const eventType = readString(payload.event_type);
  const status = readString(payload.status);
  const attemptCount = payload.attempt_count;
  const latestAttemptStatus = payload.latest_attempt_status;
  const responseStatus = readNullableInteger(payload.response_status);
  const errorType = readNullableString(payload.error_type);
  const durationMs = readNullableInteger(payload.duration_ms);
  const occurredAt = readString(payload.occurred_at);

  if (
    type !== "delivery.updated" ||
    !endpointId ||
    !messageId ||
    !eventType ||
    !status ||
    !REALTIME_STATUSES.includes(status as RealtimeDeliveryStatus) ||
    typeof attemptCount !== "number" ||
    !Number.isInteger(attemptCount) ||
    attemptCount < 0 ||
    !occurredAt ||
    Number.isNaN(Date.parse(occurredAt)) ||
    responseStatus === undefined ||
    (responseStatus !== null && responseStatus < 100) ||
    errorType === undefined ||
    durationMs === undefined ||
    (durationMs !== null && durationMs < 0) ||
    (latestAttemptStatus !== "succeeded" && latestAttemptStatus !== "failed" && latestAttemptStatus !== null)
  ) {
    return null;
  }

  const normalized = normalizeStatus(status as RealtimeDeliveryStatus);

  return {
    type: "delivery.updated",
    endpointId,
    messageId,
    eventType,
    status: status as RealtimeDeliveryStatus,
    ...normalized,
    attemptCount,
    latestAttemptStatus,
    responseStatus,
    errorType,
    durationMs,
    occurredAt,
  };
}

export function applyEndpointDeliveryUpdate(
  messages: DeliveryMessageSummary[],
  update: EndpointDeliveryUpdate,
): DeliveryMessageSummary[] {
  return messages.map((message) => {
    if (message.id !== update.messageId) return message;

    return {
      ...message,
      status: update.messageStatus,
      realtime_status: update.status,
      delivery_state: update.deliveryState,
      event_type: update.eventType,
      attempt_count: update.attemptCount,
      last_attempt_at: update.occurredAt,
      last_response_status: update.responseStatus,
      last_error_type: update.errorType,
      last_duration_ms: update.durationMs,
      updated_at: update.occurredAt,
    };
  });
}

export function toDeliveryMessageSummary(detail: DeliveryMessageDetail): DeliveryMessageSummary {
  const latestAttempt = detail.attempts.reduce<DeliveryMessageDetail["attempts"][number] | null>(
    (latest, attempt) => !latest || attempt.attempt_number > latest.attempt_number ? attempt : latest,
    null,
  );

  return {
    id: detail.id,
    webhook_id: detail.webhook_id,
    status: detail.status,
    event_id: detail.event.id,
    event_type: detail.event.event_type,
    created_at: detail.created_at,
    updated_at: detail.updated_at,
    attempt_count: detail.attempt_count,
    max_attempts: detail.max_attempts,
    next_retry_at: detail.next_retry_at,
    terminal_at: detail.terminal_at,
    retryable: detail.retryable,
    delivery_state: detail.delivery_state,
    hold: detail.hold,
    last_attempt_at: latestAttempt?.created_at ?? null,
    last_response_status: latestAttempt?.response_status ?? null,
    last_duration_ms: latestAttempt?.duration_ms ?? null,
    last_error_type: latestAttempt?.error_type ?? null,
    failure_category: latestAttempt?.failure_category ?? detail.failure_category ?? null,
    replay: detail.replay,
  };
}

export function insertEndpointDeliveryUpdate(
  messages: DeliveryMessageSummary[],
  detail: DeliveryMessageDetail,
  update: EndpointDeliveryUpdate,
): DeliveryMessageSummary[] {
  if (messages.some((message) => message.id === update.messageId)) {
    return applyEndpointDeliveryUpdate(messages, update);
  }

  const [message] = applyEndpointDeliveryUpdate([toDeliveryMessageSummary(detail)], update);

  return [message, ...messages];
}

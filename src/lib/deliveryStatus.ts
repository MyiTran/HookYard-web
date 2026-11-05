import type { DeliveryHold, DeliveryState, MessageStatus } from "../types/delivery";
import type { MessageReplay } from "../types/replay";
import { formatDateTime } from "./dateFormat";

type DeliveryLifecycleState = {
  status: MessageStatus;
  attempt_count: number;
  max_attempts?: number | null;
  next_retry_at?: string | null;
  retryable?: boolean;
  delivery_state?: DeliveryState;
  hold?: DeliveryHold | null;
  replay?: MessageReplay | null;
};

type ReplayDeliveryState = {
  status: MessageStatus;
  replay?: MessageReplay | null;
};

const LEASE_EXPIRED_ERROR_TYPE = "DeliveryLeaseExpired";

function attemptWord(count: number): string {
  return count === 1 ? "attempt" : "attempts";
}

function isTimeoutError(errorType: string): boolean {
  return errorType.toLowerCase().includes("timeout");
}

export function formatAttemptProgress(attemptCount: number, maxAttempts?: number | null): string {
  if (typeof maxAttempts !== "number") return `Attempt ${attemptCount}`;

  return `Attempt ${Math.min(attemptCount, maxAttempts)} of ${maxAttempts}`;
}

export function formatAttemptsUsed(attemptCount: number, maxAttempts?: number | null): string {
  if (typeof maxAttempts !== "number") return String(attemptCount);

  return `${Math.min(attemptCount, maxAttempts)} of ${maxAttempts}`;
}

export function isHeldDelivery(message: { delivery_state?: DeliveryState; hold?: DeliveryHold | null }): boolean {
  return message.delivery_state === "held_by_circuit" || Boolean(message.hold);
}

export function heldDeliveryLabel(hold: DeliveryHold): string {
  if (hold.reason === "endpoint_disabled") return "Held — endpoint delivery disabled";

  return "Held — endpoint circuit open";
}

export function heldDeliveryGuidance(attemptCount: number, maxAttempts: number | null): string {
  if (attemptCount === 0) {
    return "HookYard has not sent this delivery because the endpoint is being protected. It will be released after the receiver recovers.";
  }

  if (typeof maxAttempts === "number") {
    return `HookYard paused further delivery attempts after the endpoint circuit opened. This delivery has already used ${attemptCount} of ${maxAttempts} attempts.`;
  }

  return `HookYard paused further delivery attempts after the endpoint circuit opened. This delivery has already used ${attemptCount} ${attemptCount === 1 ? "attempt" : "attempts"}.`;
}

export function isDeliveredByReplay(message: ReplayDeliveryState): boolean {
  if (message.status !== "succeeded") return false;

  return message.replay?.last_outcome?.status === "succeeded";
}

export function deliveryLifecycleLabel(message: DeliveryLifecycleState): string {
  if (isHeldDelivery(message) && message.hold) return heldDeliveryLabel(message.hold);

  if (message.status === "pending") {
    if (message.next_retry_at) {
      const scheduledAt = formatDateTime(message.next_retry_at);

      return scheduledAt ? `Retry scheduled ${scheduledAt}` : "Retry scheduled";
    }

    if (message.retryable === false) return "No retries left";

    return "Queued";
  }

  if (message.status === "delivering") return "Delivering now";
  if (message.status === "succeeded") return isDeliveredByReplay(message) ? "Delivered by replay" : "Delivered";

  const attemptsUsed = formatAttemptsUsed(message.attempt_count, message.max_attempts);
  const attemptsLabel = typeof message.max_attempts === "number" ? "attempts" : attemptWord(message.attempt_count);

  return `Failed after ${attemptsUsed} ${attemptsLabel}`;
}

const FAILURE_CATEGORY_LABELS: Record<string, string> = {
  destination_rejected: "Destination rejected",
  timeout: "Timeout",
  network: "Network error",
  http_error: "HTTP error",
  interrupted: "Attempt interrupted",
};

export function failureCategoryLabel(failureCategory?: string | null): string | null {
  if (!failureCategory) return null;

  return FAILURE_CATEGORY_LABELS[failureCategory] ?? null;
}

export function attemptFailureShortLabel(
  failureCategory?: string | null,
  errorType?: string | null,
): string {
  const categoryLabel = failureCategoryLabel(failureCategory);

  if (categoryLabel === "Timeout") return "Timeout";
  if (categoryLabel === "Attempt interrupted") return "Attempt interrupted";

  if (!errorType) return categoryLabel ?? "No HTTP response";
  if (errorType === LEASE_EXPIRED_ERROR_TYPE) return "Lease expired";
  if (isTimeoutError(errorType)) return "Timeout";

  return categoryLabel ?? "Transport error";
}

export function attemptFailureHeadline(
  failureCategory?: string | null,
  errorType?: string | null,
): string {
  if (failureCategory === "destination_rejected") return "Destination rejected — no request was sent";
  if (failureCategory === "interrupted") return "Attempt interrupted — no response captured";
  if (failureCategory === "timeout") return "Timeout — no HTTP response received";
  if (failureCategory === "network") return "Network error — no HTTP response received";
  if (failureCategory === "http_error") return "HTTP error";

  if (!errorType) return "No HTTP response was received";
  if (errorType === LEASE_EXPIRED_ERROR_TYPE) return "Delivery lease expired — no response captured";
  if (isTimeoutError(errorType)) return "Timeout — no HTTP response received";

  return "Transport error — no HTTP response received";
}

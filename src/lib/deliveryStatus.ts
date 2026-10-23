import type { MessageStatus } from "../types/delivery";
import { formatDateTime } from "./dateFormat";

type DeliveryLifecycleState = {
  status: MessageStatus;
  attempt_count: number;
  max_attempts?: number | null;
  next_retry_at?: string | null;
  retryable?: boolean;
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

  return `Attempt ${attemptCount} of ${maxAttempts}`;
}

export function formatAttemptsUsed(attemptCount: number, maxAttempts?: number | null): string {
  if (typeof maxAttempts !== "number") return String(attemptCount);

  return `${attemptCount} of ${maxAttempts}`;
}

export function deliveryLifecycleLabel(message: DeliveryLifecycleState): string {
  if (message.status === "pending") {
    if (message.next_retry_at) {
      const scheduledAt = formatDateTime(message.next_retry_at);

      return scheduledAt ? `Retry scheduled ${scheduledAt}` : "Retry scheduled";
    }

    if (message.retryable === false) return "No retries left";

    return "Queued";
  }

  if (message.status === "delivering") return "Delivering now";
  if (message.status === "succeeded") return "Delivered";

  const attemptsUsed = formatAttemptsUsed(message.attempt_count, message.max_attempts);

  return `Failed after ${attemptsUsed} ${attemptWord(message.attempt_count)}`;
}

export function attemptFailureShortLabel(errorType?: string | null): string {
  if (!errorType) return "No HTTP response";
  if (errorType === LEASE_EXPIRED_ERROR_TYPE) return "Lease expired";
  if (isTimeoutError(errorType)) return "Timeout";

  return "Transport error";
}

export function attemptFailureHeadline(errorType?: string | null): string {
  if (!errorType) return "No HTTP response was received";
  if (errorType === LEASE_EXPIRED_ERROR_TYPE) return "Delivery lease expired — no response captured";
  if (isTimeoutError(errorType)) return "Timeout — no HTTP response received";

  return "Transport error — no HTTP response received";
}

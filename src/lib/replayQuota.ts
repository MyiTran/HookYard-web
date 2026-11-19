import type { ReplayQuotaError } from "../types/replay";
import { formatDate } from "./dateFormat";
import { formatCount } from "./numberFormat";

const PLAN_LIMIT_EXCEEDED_CODE = "plan_limit_exceeded";

type QuotaErrorSource = {
  status: number;
  data?: unknown;
};

type QuotaPayload = Record<string, unknown>;

function readObject(value: unknown): QuotaPayload | null {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as QuotaPayload) : null;
}

function readNumber(value: QuotaPayload | null, key: string): number | null {
  if (!value) return null;

  const field = value[key];

  return typeof field === "number" && Number.isFinite(field) ? field : null;
}

function readString(value: QuotaPayload | null, key: string): string | null {
  if (!value) return null;

  const field = value[key];

  return typeof field === "string" && field.trim() ? field : null;
}

export function readReplayQuotaError(source: QuotaErrorSource): ReplayQuotaError | null {
  if (source.status !== 402) return null;

  const payload = readObject(source.data);
  const code = readString(payload, "error");

  if (code !== PLAN_LIMIT_EXCEEDED_CODE) return null;

  return {
    eligible: readNumber(payload, "eligible_count") ?? readNumber(payload, "count") ?? readNumber(payload, "eligible"),
    used: readNumber(payload, "used"),
    limit: readNumber(payload, "limit"),
    period_ends: readString(payload, "period_ends"),
  };
}

export function singleReplayQuotaMessage(error: ReplayQuotaError): { title: string; context: string | null } {
  const contextParts: string[] = [];

  if (error.used !== null && error.limit !== null) {
    contextParts.push(`Monthly limit reached (${formatCount(error.used)} of ${formatCount(error.limit)}).`);

    const resetDate = error.period_ends ? formatDate(error.period_ends) : "";
    if (resetDate) contextParts.push(`Resets ${resetDate}.`);
  }

  return {
    title: "This project's monthly delivery limit has been reached.",
    context: contextParts.length > 0 ? contextParts.join(" ") : null,
  };
}

export function bulkReplayQuotaMessage(
  error: ReplayQuotaError,
  previewEligible?: number | null,
): { title: string; context: string | null } {
  const contextParts: string[] = [];

  const eligible = error.eligible ?? previewEligible ?? null;
  if (eligible !== null) contextParts.push(`Eligible deliveries: ${formatCount(eligible)}`);

  if (error.used !== null && error.limit !== null) {
    const remaining = error.limit - error.used;
    if (remaining >= 0) contextParts.push(`Remaining monthly quota: ${formatCount(remaining)}`);
  }

  return {
    title: "This project does not have enough monthly delivery quota for this replay.",
    context: contextParts.length > 0 ? contextParts.join(" · ") : null,
  };
}

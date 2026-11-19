import { formatCount } from "./numberFormat";
import type { ReplayPreview } from "../types/replay";

export const FALLBACK_MAX_ITEMS_PER_RUN = 20000;

const LIMIT_ERROR_CODE = "bulk_replay_limit_exceeded";

export type ReplayLimit = {
  eligible: number;
  limit: number;
};

type LimitSource = Pick<ReplayPreview, "eligible_count" | "max_items_per_run" | "over_limit">;

function readNumber(value: unknown, key: string): number | null {
  if (Array.isArray(value)) {
    for (const item of value) {
      const found = readNumber(item, key);
      if (found !== null) return found;
    }

    return null;
  }

  if (!value || typeof value !== "object") return null;

  const record = value as Record<string, unknown>;
  const direct = record[key];

  if (typeof direct === "number" && Number.isFinite(direct)) return direct;

  for (const nested of Object.values(record)) {
    const found = readNumber(nested, key);
    if (found !== null) return found;
  }

  return null;
}

function containsLimitCode(value: unknown): boolean {
  if (typeof value === "string") return value.includes(LIMIT_ERROR_CODE);

  if (Array.isArray(value)) return value.some(containsLimitCode);

  if (value && typeof value === "object") {
    return Object.values(value as Record<string, unknown>).some(containsLimitCode);
  }

  return false;
}

export function replayItemLimit(preview: Pick<ReplayPreview, "max_items_per_run">): number {
  const limit = preview.max_items_per_run;

  return typeof limit === "number" && Number.isFinite(limit) && limit > 0 ? limit : FALLBACK_MAX_ITEMS_PER_RUN;
}

export function isPreviewOverLimit(preview: LimitSource): boolean {
  if (typeof preview.over_limit === "boolean") return preview.over_limit;

  return preview.eligible_count > replayItemLimit(preview);
}

export function replayLimitWarning(preview: LimitSource): ReplayLimit | null {
  if (!isPreviewOverLimit(preview)) return null;

  return { eligible: preview.eligible_count, limit: replayItemLimit(preview) };
}

export function replayLimitMessage({ eligible, limit }: ReplayLimit): string {
  return `${formatCount(eligible)} deliveries are eligible for recovery. A recovery run can include up to ${formatCount(limit)}. Narrow the date range or filters, then preview again.`;
}

export function replayLimitBatchHint(limit: number): string {
  return `For large recoveries, use a smaller date range and run them in batches of up to ${formatCount(limit)} deliveries.`;
}

export function readReplayLimitFailure(error: string, payload: unknown, fallback: ReplayLimit): ReplayLimit | null {
  if (!containsLimitCode(error) && !containsLimitCode(payload)) return null;

  return {
    eligible: readNumber(payload, "eligible") ?? fallback.eligible,
    limit: readNumber(payload, "limit") ?? fallback.limit,
  };
}

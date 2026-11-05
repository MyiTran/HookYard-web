import type {
  ReplayBlockedReason,
  ReplayHoldReason,
  ReplayItemStatus,
  ReplayRun,
  ReplayRunStatus,
  ReplaySkipReason,
  ReplaySummary,
} from "../types/replay";

export const REPLAY_HELD_GUIDANCE =
  "This replay waits for the endpoint circuit to recover. It has not been sent yet.";

export const REPLAY_ENDPOINT_PAUSED_MESSAGE =
  "This endpoint is paused. Resume it before replaying this delivery.";

const ITEM_STATUS_LABELS: Record<ReplayItemStatus, string> = {
  queued: "Queued",
  held: "Held",
  delivering: "Delivering",
  succeeded: "Succeeded",
  failed: "Failed",
  skipped: "Skipped",
};

const RUN_STATUS_LABELS: Record<ReplayRunStatus, string> = {
  queued: "Queued",
  running: "Running",
  completed: "Completed",
};

const HOLD_REASON_LABELS: Record<ReplayHoldReason, string> = {
  endpoint_circuit_open: "Held — endpoint circuit open",
};

const SKIP_REASON_LABELS: Record<ReplaySkipReason, string> = {
  endpoint_archived: "Skipped — endpoint archived",
  endpoint_disabled: "Skipped — delivery disabled",
  endpoint_paused: "Skipped — endpoint paused",
};

const BLOCKED_REASON_MESSAGES: Record<ReplayBlockedReason, string> = {
  message_held: "This message is held by the endpoint circuit, so it cannot be replayed.",
  message_not_terminal: "Only deliveries that terminally failed can be replayed.",
  message_not_failed: "This delivery already succeeded.",
  endpoint_archived: "This endpoint is archived, so its deliveries cannot be replayed.",
  endpoint_paused: REPLAY_ENDPOINT_PAUSED_MESSAGE,
  endpoint_disabled: "Delivery for this endpoint is disabled, so it cannot be replayed.",
  replay_in_progress: "A replay for this message is already in progress.",
};

const SUMMARY_LABELS: { key: keyof ReplaySummary; label: string }[] = [
  { key: "requested", label: "Requested" },
  { key: "eligible", label: "Eligible" },
  { key: "blocked", label: "Blocked" },
  { key: "queued", label: "Queued" },
  { key: "held", label: "Held" },
  { key: "delivering", label: "Delivering" },
  { key: "succeeded", label: "Succeeded" },
  { key: "failed", label: "Failed" },
  { key: "skipped", label: "Skipped" },
];

export function replayItemStatusLabel(status: ReplayItemStatus): string {
  return ITEM_STATUS_LABELS[status];
}

export function replayRunStatusLabel(status: ReplayRunStatus): string {
  return RUN_STATUS_LABELS[status];
}

export function replayHoldReasonLabel(reason: ReplayHoldReason | null): string | null {
  return reason ? HOLD_REASON_LABELS[reason] : null;
}

export function replaySkipReasonLabel(reason: ReplaySkipReason | null): string | null {
  return reason ? SKIP_REASON_LABELS[reason] : null;
}

export function replayItemOutcomeLabel(item: {
  status: ReplayItemStatus;
  hold_reason: ReplayHoldReason | null;
  skip_reason: ReplaySkipReason | null;
}): string {
  if (item.status === "held") return replayHoldReasonLabel(item.hold_reason) ?? ITEM_STATUS_LABELS.held;
  if (item.status === "skipped") return replaySkipReasonLabel(item.skip_reason) ?? ITEM_STATUS_LABELS.skipped;

  return ITEM_STATUS_LABELS[item.status];
}

export function replayBlockedMessage(reason: ReplayBlockedReason | null): string | null {
  return reason ? BLOCKED_REASON_MESSAGES[reason] : null;
}

export function replayRequestErrorMessage(error: string): string {
  const code = error.trim();

  return BLOCKED_REASON_MESSAGES[code as ReplayBlockedReason] ?? error;
}

export function replaySummaryEntries(summary: ReplaySummary): { key: keyof ReplaySummary; label: string; value: number }[] {
  return SUMMARY_LABELS.map(({ key, label }) => ({ key, label, value: summary[key] }));
}

export function isReplayRunWaitingForRecovery(run: ReplayRun): boolean {
  if (run.status === "completed") return false;

  return run.summary.held > 0 && run.summary.queued === 0 && run.summary.delivering === 0;
}

export function replayRunStateNote(run: ReplayRun): string {
  if (isReplayRunWaitingForRecovery(run)) {
    return "Waiting for endpoint recovery. Held replays have not been sent; they run after the endpoint circuit closes or delivery is re-enabled.";
  }

  if (run.status === "completed") {
    return "The run is complete. Replay attempts appear in each delivery's attempt history.";
  }

  if (run.status === "queued") {
    return "The run is queued. No replay has been sent yet.";
  }

  return "Replay deliveries are in progress. This summary updates as each attempt finishes.";
}

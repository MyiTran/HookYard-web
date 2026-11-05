export type ReplayRunMode = "single" | "bulk";

export type ReplayRunStatus = "queued" | "running" | "completed";

export type ReplayItemStatus = "queued" | "held" | "delivering" | "succeeded" | "failed" | "skipped";

export type ReplayHoldReason = "endpoint_circuit_open";

export type ReplaySkipReason = "endpoint_archived" | "endpoint_disabled" | "endpoint_paused";

export type ReplayBlockedReason =
  | "message_held"
  | "message_not_terminal"
  | "message_not_failed"
  | "endpoint_archived"
  | "endpoint_paused"
  | "endpoint_disabled"
  | "replay_in_progress";

export type ReplaySummary = {
  requested: number;
  eligible: number;
  blocked: number;
  queued: number;
  held: number;
  delivering: number;
  succeeded: number;
  failed: number;
  skipped: number;
};

export type ReplayActor = {
  id: string;
  name: string;
};

export type ReplayItem = {
  id: string;
  message_id: string;
  endpoint_id: string;
  status: ReplayItemStatus;
  hold_reason: ReplayHoldReason | null;
  skip_reason: ReplaySkipReason | null;
  error_type: string | null;
  error_message: string | null;
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
  delivery_attempt_id: string | null;
};

export type ReplayRun = {
  id: string;
  mode: ReplayRunMode;
  project_id: string;
  requested_count: number;
  filters: Record<string, string>;
  materialized_at: string | null;
  created_at: string;
  updated_at: string;
  status: ReplayRunStatus;
  summary: ReplaySummary;
  actor: ReplayActor;
  items?: ReplayItem[];
};

export type ReplayPreviewSample = {
  message_id: string;
  event_type: string;
  endpoint: {
    id: string;
    name: string;
  };
  terminal_at: string;
  failure_category: string | null;
};

export type ReplayPreview = {
  requested_count: number;
  eligible_count: number;
  blocked_count: number;
  max_items_per_run?: number | null;
  over_limit?: boolean;
  sample: ReplayPreviewSample[];
};

export type ReplayLastOutcome = {
  id: string;
  replay_run_id: string;
  status: ReplayItemStatus;
  hold_reason: ReplayHoldReason | null;
  skip_reason: ReplaySkipReason | null;
  error_type: string | null;
  created_at: string;
  completed_at: string | null;
};

export type MessageReplay = {
  allowed: boolean;
  blocked_reason: ReplayBlockedReason | null;
  active: boolean;
  last_outcome: ReplayLastOutcome | null;
};

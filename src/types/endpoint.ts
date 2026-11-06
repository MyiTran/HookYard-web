export type EndpointProject = {
  id: string;
  name: string;
};

export type EndpointCircuitState = "enabled" | "circuit_open" | "disabled";

export type EndpointCircuitProbeStatus = "pending" | "succeeded" | "failed";

export type EndpointCircuitProbe = {
  id: string;
  status: EndpointCircuitProbeStatus;
  request_id: string;
  webhook_id: string;
  signing_secret_version: number | null;
  started_at: string;
  completed_at: string | null;
  response_status: number | null;
  duration_ms: number | null;
  error_type: string | null;
  error_message: string | null;
};

export type EndpointCircuit = {
  state: EndpointCircuitState;
  opened_at: string | null;
  failure_count: number;
  failure_threshold: number;
  disable_window_ends_at: string | null;
  next_probe_at: string | null;
  probe_in_flight: boolean;
  held_message_count: number;
  last_probe?: EndpointCircuitProbe | null;
};

export type EndpointQueueState = "ok" | "warning" | "full";

export type EndpointQueue = {
  state: EndpointQueueState;
  queued_count: number;
  capacity: number;
};

export type Endpoint = {
  id: string;
  name: string;
  url: string;
  description: string | null;
  active: boolean;
  event_types: string[];
  archived_at: string | null;
  created_at: string;
  updated_at: string;
  has_signing_secret: boolean;
  signing_secret_version: number;
  signing_secret_last_rotated_at: string | null;
  circuit?: EndpointCircuit;
  queue?: EndpointQueue;
  project: EndpointProject;
};

export type EndpointWithSigningSecret = Endpoint & {
  signing_secret: string;
};

export type EndpointInput = {
  name: string;
  url: string;
  description: string;
  active: boolean;
  event_types: string[];
};

export type ProjectRealtimeEventType =
  | "message.changed"
  | "endpoint.changed"
  | "replay.changed";

export type ProjectRealtimeEvent = {
  type: ProjectRealtimeEventType;
  project_id: string;
  endpoint_id?: string;
  message_id?: string;
  replay_run_id?: string;
  replay_item_id?: string;
  status?: string;
  delivery_state?: string;
  circuit_state?: string;
  occurred_at?: string;
};

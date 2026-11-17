import type { ProjectRealtimeEvent, ProjectRealtimeEventType } from "../types/projectRealtime";

const PROJECT_REALTIME_EVENT_TYPES: ProjectRealtimeEventType[] = [
  "message.changed",
  "endpoint.changed",
  "replay.changed",
];

export function readProjectRealtimeEvent(data: unknown): ProjectRealtimeEvent | null {
  if (typeof data !== "object" || data === null) return null;

  const record = data as Record<string, unknown>;
  const type = record.type;
  const projectId = record.project_id;

  if (typeof type !== "string" || typeof projectId !== "string") return null;
  if (!PROJECT_REALTIME_EVENT_TYPES.includes(type as ProjectRealtimeEventType)) return null;

  return record as unknown as ProjectRealtimeEvent;
}

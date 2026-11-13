import { useEffect, useRef, useState } from "react";
import { createConsumer, type Consumer } from "@rails/actioncable";
import { buildCableUrl, requestCableTicket } from "../lib/cableApi";
import { readProjectRealtimeEvent } from "../lib/projectRealtime";
import type { ProjectRealtimeEvent, ProjectRealtimeEventType } from "../types/projectRealtime";

export type ProjectRealtimeStatus = "connecting" | "connected" | "disconnected";

type ProjectRealtimeTarget = {
  projectId: string;
  endpointId?: string | null;
  replayRunId?: string | null;
  messageId?: string | null;
};

type ProjectRealtimeHandlers = {
  onMessageChanged?: () => void;
  onEndpointChanged?: () => void;
  onReplayChanged?: () => void;
  onConnected?: () => void;
};

type UseProjectRealtimeOptions = ProjectRealtimeHandlers & {
  projectId: string | null;
  endpointId?: string | null;
  replayRunId?: string | null;
  messageId?: string | null;
};

type InvalidationKey = "message" | "endpoint" | "replay";

const REFRESH_DEBOUNCE_MS = 300;
const RETRY_DELAYS_MS = [1000, 2000, 5000, 10000];

const INVALIDATION_KEY_BY_TYPE: Record<ProjectRealtimeEventType, InvalidationKey> = {
  "message.changed": "message",
  "endpoint.changed": "endpoint",
  "replay.changed": "replay",
};

function isRelevantEvent(event: ProjectRealtimeEvent, target: ProjectRealtimeTarget): boolean {
  if (event.project_id !== target.projectId) return false;

  if (event.type === "replay.changed") {
    if (target.replayRunId && event.replay_run_id !== target.replayRunId) return false;
    if (target.messageId && event.message_id !== target.messageId) return false;

    return true;
  }

  if (target.endpointId && event.endpoint_id !== target.endpointId) return false;

  return true;
}

export function useProjectRealtime({
  projectId,
  endpointId,
  replayRunId,
  messageId,
  onMessageChanged,
  onEndpointChanged,
  onReplayChanged,
  onConnected,
}: UseProjectRealtimeOptions): { status: ProjectRealtimeStatus } {
  const [status, setStatus] = useState<ProjectRealtimeStatus>("connecting");

  const consumerRef = useRef<Consumer | null>(null);
  const retryTimerRef = useRef<number | null>(null);
  const retryCountRef = useRef(0);
  const pendingKeysRef = useRef<Set<InvalidationKey>>(new Set());
  const debounceTimerRef = useRef<number | null>(null);

  const onMessageChangedRef = useRef(onMessageChanged);
  const onEndpointChangedRef = useRef(onEndpointChanged);
  const onReplayChangedRef = useRef(onReplayChanged);
  const onConnectedRef = useRef(onConnected);

  useEffect(() => {
    onMessageChangedRef.current = onMessageChanged;
    onEndpointChangedRef.current = onEndpointChanged;
    onReplayChangedRef.current = onReplayChanged;
    onConnectedRef.current = onConnected;
  }, [onMessageChanged, onEndpointChanged, onReplayChanged, onConnected]);

  useEffect(() => {
    if (!projectId) return;

    const activeProjectId = projectId;
    let cancelled = false;
    retryCountRef.current = 0;
    pendingKeysRef.current = new Set();

    function clearDebounceTimer() {
      if (debounceTimerRef.current !== null) {
        window.clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }
    }

    function clearRetryTimer() {
      if (retryTimerRef.current !== null) {
        window.clearTimeout(retryTimerRef.current);
        retryTimerRef.current = null;
      }
    }

    function disposeConsumer() {
      const consumer = consumerRef.current;
      consumerRef.current = null;
      consumer?.disconnect();
    }

    function flushPending() {
      clearDebounceTimer();

      const keys = pendingKeysRef.current;
      pendingKeysRef.current = new Set();

      if (keys.has("message")) onMessageChangedRef.current?.();
      if (keys.has("endpoint")) onEndpointChangedRef.current?.();
      if (keys.has("replay")) onReplayChangedRef.current?.();
    }

    function scheduleInvalidation(key: InvalidationKey) {
      pendingKeysRef.current.add(key);

      if (debounceTimerRef.current !== null) return;

      debounceTimerRef.current = window.setTimeout(() => {
        debounceTimerRef.current = null;
        flushPending();
      }, REFRESH_DEBOUNCE_MS);
    }

    function scheduleReconnect() {
      if (cancelled) return;
      if (retryTimerRef.current !== null) return;

      const delay = RETRY_DELAYS_MS[Math.min(retryCountRef.current, RETRY_DELAYS_MS.length - 1)];
      retryCountRef.current += 1;

      retryTimerRef.current = window.setTimeout(() => {
        retryTimerRef.current = null;
        void connect();
      }, delay);
    }

    async function connect() {
      if (cancelled) return;

      const ticketResult = await requestCableTicket();

      if (cancelled) return;

      if (!ticketResult.ok) {
        setStatus("disconnected");
        scheduleReconnect();
        return;
      }

      const consumer = createConsumer(buildCableUrl(ticketResult.data.token));
      consumerRef.current = consumer;

      consumer.subscriptions.create(
        { channel: "ProjectRealtimeChannel", project_id: activeProjectId },
        {
          connected() {
            if (cancelled) return;

            clearRetryTimer();
            retryCountRef.current = 0;
            setStatus("connected");
            onConnectedRef.current?.();
          },
          received(data: unknown) {
            if (cancelled) return;

            const event = readProjectRealtimeEvent(data);

            if (!event || !isRelevantEvent(event, { projectId: activeProjectId, endpointId, replayRunId, messageId })) return;

            scheduleInvalidation(INVALIDATION_KEY_BY_TYPE[event.type]);
          },
          rejected() {
            if (cancelled) return;
            disposeConsumer();
            setStatus("disconnected");
            scheduleReconnect();
          },
          disconnected() {
            if (cancelled) return;
            disposeConsumer();
            setStatus("disconnected");
            scheduleReconnect();
          },
        },
      );
    }

    void connect();

    return () => {
      cancelled = true;
      clearDebounceTimer();
      clearRetryTimer();
      pendingKeysRef.current = new Set();
      disposeConsumer();
    };
  }, [projectId, endpointId, replayRunId, messageId]);

  return { status };
}

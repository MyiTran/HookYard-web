import { useEffect, useRef, useState } from "react";
import { createConsumer, type Consumer } from "@rails/actioncable";
import { buildCableUrl, requestCableTicket } from "../lib/cableApi";
import type { NotificationRealtimeEvent } from "../types/notification";

export type RealtimeStatus = "connecting" | "connected" | "disconnected";

type UseNotificationsRealtimeOptions = {
  onNotificationChange: () => void | Promise<void>;
  onConnected?: () => void | Promise<void>;
};

const RETRY_DELAYS_MS = [1000, 2000, 5000, 10000];

const NOTIFICATION_EVENT_TYPES: NotificationRealtimeEvent["type"][] = [
  "notification.created",
  "notification.removed",
];

function isNotificationRealtimeEvent(data: unknown): data is NotificationRealtimeEvent {
  if (typeof data !== "object" || data === null) return false;

  const type = (data as Record<string, unknown>).type;

  return typeof type === "string" && NOTIFICATION_EVENT_TYPES.some((eventType) => eventType === type);
}

export function useNotificationsRealtime({
  onNotificationChange,
  onConnected,
}: UseNotificationsRealtimeOptions): { status: RealtimeStatus } {
  const [status, setStatus] = useState<RealtimeStatus>("connecting");

  const consumerRef = useRef<Consumer | null>(null);
  const retryTimerRef = useRef<number | null>(null);
  const retryCountRef = useRef(0);
  const disposedRef = useRef(false);

  const onNotificationChangeRef = useRef(onNotificationChange);
  const onConnectedRef = useRef(onConnected);

  useEffect(() => {
    onNotificationChangeRef.current = onNotificationChange;
  }, [onNotificationChange]);

  useEffect(() => {
    onConnectedRef.current = onConnected;
  }, [onConnected]);

  useEffect(() => {
    disposedRef.current = false;

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

    function scheduleReconnect() {
      if (retryTimerRef.current !== null) return;

      const delay = RETRY_DELAYS_MS[Math.min(retryCountRef.current, RETRY_DELAYS_MS.length - 1)];
      retryCountRef.current += 1;

      retryTimerRef.current = window.setTimeout(() => {
        retryTimerRef.current = null;
        void connect();
      }, delay);
    }

    async function connect() {
      if (disposedRef.current) return;

      const ticketResult = await requestCableTicket();

      if (disposedRef.current) return;

      if (!ticketResult.ok) {
        setStatus("disconnected");
        scheduleReconnect();
        return;
      }

      const consumer = createConsumer(buildCableUrl(ticketResult.data.token));
      consumerRef.current = consumer;

      consumer.subscriptions.create(
        { channel: "NotificationsChannel" },
        {
          connected() {
            clearRetryTimer();
            retryCountRef.current = 0;
            setStatus("connected");
            void onConnectedRef.current?.();
          },
          received(data: unknown) {
            if (isNotificationRealtimeEvent(data)) {
              void onNotificationChangeRef.current();
            }
          },
          rejected() {
            disposeConsumer();
            setStatus("disconnected");
            scheduleReconnect();
          },
          disconnected() {
            disposeConsumer();
            setStatus("disconnected");
            scheduleReconnect();
          },
        },
      );
    }

    void connect();

    return () => {
      disposedRef.current = true;
      clearRetryTimer();
      disposeConsumer();
    };
  }, []);

  return { status };
}

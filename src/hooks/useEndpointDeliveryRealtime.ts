import { useEffect, useRef, useState } from "react";
import { createConsumer, type Consumer, type Subscription } from "@rails/actioncable";
import { parseEndpointDeliveryUpdate, type EndpointDeliveryUpdate } from "../lib/endpointDeliveryRealtime";
import { buildCableUrl, requestCableTicket } from "../lib/cableApi";

export type EndpointDeliveryRealtimeStatus = "connected" | "reconnecting" | "disconnected";

type UseEndpointDeliveryRealtimeOptions = {
  endpointId: string;
  onDeliveryUpdate: (update: EndpointDeliveryUpdate) => void | Promise<void>;
  onConnected?: () => void | Promise<void>;
};

const RETRY_DELAYS_MS = [1000, 2000, 5000, 10000];

export function useEndpointDeliveryRealtime({
  endpointId,
  onDeliveryUpdate,
  onConnected,
}: UseEndpointDeliveryRealtimeOptions): { status: EndpointDeliveryRealtimeStatus } {
  const [status, setStatus] = useState<EndpointDeliveryRealtimeStatus>("reconnecting");
  const generationRef = useRef(0);
  const onDeliveryUpdateRef = useRef(onDeliveryUpdate);
  const onConnectedRef = useRef(onConnected);

  useEffect(() => {
    onDeliveryUpdateRef.current = onDeliveryUpdate;
  }, [onDeliveryUpdate]);

  useEffect(() => {
    onConnectedRef.current = onConnected;
  }, [onConnected]);

  useEffect(() => {
    if (!endpointId) {
      return;
    }

    const generation = generationRef.current + 1;
    generationRef.current = generation;
    let disposed = false;
    let consumer: Consumer | null = null;
    let subscription: Subscription | null = null;
    let retryTimer: number | null = null;
    let retryCount = 0;

    function isCurrent() {
      return !disposed && generationRef.current === generation;
    }

    function clearRetryTimer() {
      if (retryTimer !== null) {
        window.clearTimeout(retryTimer);
        retryTimer = null;
      }
    }

    function disposeConsumer() {
      subscription?.unsubscribe();
      subscription = null;
      consumer?.disconnect();
      consumer = null;
    }

    function scheduleReconnect() {
      if (retryTimer !== null || !isCurrent()) return;

      const delay = RETRY_DELAYS_MS[Math.min(retryCount, RETRY_DELAYS_MS.length - 1)];
      retryCount += 1;

      retryTimer = window.setTimeout(() => {
        retryTimer = null;
        if (!isCurrent()) return;
        setStatus("reconnecting");
        void connect();
      }, delay);
    }

    async function connect() {
      if (!isCurrent()) return;

      const ticketResult = await requestCableTicket();

      if (!isCurrent()) return;

      if (!ticketResult.ok) {
        setStatus("disconnected");
        scheduleReconnect();
        return;
      }

      consumer = createConsumer(buildCableUrl(ticketResult.data.token));
      subscription = consumer.subscriptions.create(
        { channel: "EndpointDeliveryChannel", endpoint_id: endpointId },
        {
          connected() {
            if (!isCurrent()) return;
            clearRetryTimer();
            retryCount = 0;
            setStatus("connected");
            void onConnectedRef.current?.();
          },
          received(data: unknown) {
            if (!isCurrent()) return;
            const update = parseEndpointDeliveryUpdate(data);

            if (update?.endpointId === endpointId) {
              void onDeliveryUpdateRef.current(update);
            }
          },
          rejected() {
            if (!isCurrent()) return;
            disposeConsumer();
            setStatus("disconnected");
            scheduleReconnect();
          },
          disconnected() {
            if (!isCurrent()) return;
            disposeConsumer();
            setStatus("disconnected");
            scheduleReconnect();
          },
        },
      );
    }

    void connect();

    return () => {
      disposed = true;
      if (generationRef.current === generation) generationRef.current += 1;
      clearRetryTimer();
      disposeConsumer();
    };
  }, [endpointId]);

  return { status: endpointId ? status : "disconnected" };
}

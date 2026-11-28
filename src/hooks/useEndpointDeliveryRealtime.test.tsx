/* eslint-disable @typescript-eslint/no-require-imports */
import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, jest } from "@jest/globals";
import type { EndpointDeliveryUpdate } from "../lib/endpointDeliveryRealtime";

jest.mock("@rails/actioncable", () => ({ createConsumer: jest.fn() }));
jest.mock("../lib/cableApi", () => ({
  buildCableUrl: jest.fn(() => "ws://example.test/cable?ticket=cable-ticket"),
  requestCableTicket: jest.fn(),
}));

const { createConsumer } = require("@rails/actioncable") as {
  createConsumer: jest.Mock<() => unknown>;
};
const { requestCableTicket } = require("../lib/cableApi") as {
  requestCableTicket: jest.Mock<() => Promise<unknown>>;
};
const { useEndpointDeliveryRealtime } = require("./useEndpointDeliveryRealtime") as typeof import("./useEndpointDeliveryRealtime");

type CableCallbacks = {
  connected: () => void;
  disconnected: () => void;
  rejected: () => void;
  received: (data: unknown) => void;
};

type Deferred<T> = {
  promise: Promise<T>;
  resolve: (value: T) => void;
};

function deferred<T>(): Deferred<T> {
  let resolve: (value: T) => void = () => {};
  const promise = new Promise<T>((nextResolve) => {
    resolve = nextResolve;
  });

  return { promise, resolve };
}

describe("useEndpointDeliveryRealtime", () => {
  let callbacks: CableCallbacks;
  let unsubscribe: jest.Mock<() => void>;
  let disconnect: jest.Mock<() => void>;

  function installConsumer() {
    unsubscribe = jest.fn();
    disconnect = jest.fn();
    createConsumer.mockReturnValue({
      subscriptions: {
        create: jest.fn((_identifier: unknown, nextCallbacks: CableCallbacks) => {
          callbacks = nextCallbacks;
          return { unsubscribe, perform: jest.fn() };
        }),
      },
      disconnect,
    });
    requestCableTicket.mockResolvedValue({ ok: true, data: { token: "cable-ticket", expires_at: "2026-11-28T02:00:00Z" } });
  }

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  it("subscribes to the endpoint channel and forwards only valid delivery updates", async () => {
    installConsumer();
    const onDeliveryUpdate = jest.fn<(update: EndpointDeliveryUpdate) => void>();
    const { result } = renderHook(() => useEndpointDeliveryRealtime({ endpointId: "endpoint_1", onDeliveryUpdate }));

    await waitFor(() => expect(createConsumer).toHaveBeenCalledTimes(1));
    const consumer = createConsumer.mock.results[0].value as {
      subscriptions: { create: jest.Mock<(identifier: unknown, callbacks: CableCallbacks) => void> };
    };
    expect(consumer.subscriptions.create).toHaveBeenCalledWith(
      { channel: "EndpointDeliveryChannel", endpoint_id: "endpoint_1" },
      expect.any(Object),
    );

    act(() => callbacks.connected());
    expect(result.current.status).toBe("connected");

    act(() => callbacks.received({ type: "unexpected" }));
    expect(onDeliveryUpdate).not.toHaveBeenCalled();

    act(() => callbacks.received({
      type: "delivery.updated",
      endpoint_id: "endpoint_1",
      message_id: "msg_1",
      event_type: "invoice.created",
      status: "processing",
      attempt_count: 1,
      latest_attempt_status: "succeeded",
      response_status: 200,
      error_type: null,
      duration_ms: 12,
      occurred_at: "2026-11-28T01:00:00Z",
      response_body: "never forwarded",
    }));

    expect(onDeliveryUpdate).toHaveBeenCalledWith(expect.objectContaining({
      messageId: "msg_1",
      messageStatus: "delivering",
    }));
    expect(onDeliveryUpdate.mock.calls[0][0]).not.toHaveProperty("response_body");
  });

  it("reconnects after a disconnection and refreshes after reconnecting", async () => {
    jest.useFakeTimers();
    installConsumer();
    const onConnected = jest.fn<() => void>();
    const onDeliveryUpdate = jest.fn<(update: EndpointDeliveryUpdate) => void>();
    const { result } = renderHook(() => useEndpointDeliveryRealtime({ endpointId: "endpoint_1", onDeliveryUpdate, onConnected }));

    await act(async () => {});
    act(() => callbacks.connected());
    expect(onConnected).toHaveBeenCalledTimes(1);

    act(() => callbacks.disconnected());
    expect(result.current.status).toBe("disconnected");
    expect(unsubscribe).toHaveBeenCalledTimes(1);
    expect(disconnect).toHaveBeenCalledTimes(1);

    await act(async () => { jest.advanceTimersByTime(1000); });
    expect(createConsumer).toHaveBeenCalledTimes(2);

    act(() => callbacks.connected());
    expect(result.current.status).toBe("connected");
    expect(onConnected).toHaveBeenCalledTimes(2);
  });

  it("unsubscribes when unmounted or when endpoint_id changes", async () => {
    installConsumer();
    const { rerender, unmount } = renderHook(
      ({ endpointId }) => useEndpointDeliveryRealtime({ endpointId, onDeliveryUpdate: jest.fn<(update: EndpointDeliveryUpdate) => void>() }),
      { initialProps: { endpointId: "endpoint_1" } },
    );

    await waitFor(() => expect(createConsumer).toHaveBeenCalledTimes(1));
    rerender({ endpointId: "endpoint_2" });
    await waitFor(() => expect(createConsumer).toHaveBeenCalledTimes(2));
    expect(unsubscribe).toHaveBeenCalledTimes(1);

    unmount();
    expect(unsubscribe).toHaveBeenCalledTimes(2);
  });

  it("ignores stale ticket responses after endpoint changes or unmount", async () => {
    const ticketA = deferred<unknown>();
    const ticketB = deferred<unknown>();
    const ticketC = deferred<unknown>();
    const subscriptions: unknown[] = [];
    const unsubscribeCurrent = jest.fn<() => void>();
    const disconnectCurrent = jest.fn<() => void>();

    requestCableTicket
      .mockReturnValueOnce(ticketA.promise)
      .mockReturnValueOnce(ticketB.promise)
      .mockReturnValueOnce(ticketC.promise);
    createConsumer.mockImplementation(() => ({
      subscriptions: {
        create: jest.fn((identifier: unknown, nextCallbacks: CableCallbacks) => {
          subscriptions.push(identifier);
          callbacks = nextCallbacks;
          return { unsubscribe: unsubscribeCurrent, perform: jest.fn() };
        }),
      },
      disconnect: disconnectCurrent,
    }));

    const { rerender, unmount } = renderHook(
      ({ endpointId }) => useEndpointDeliveryRealtime({ endpointId, onDeliveryUpdate: jest.fn<(update: EndpointDeliveryUpdate) => void>() }),
      { initialProps: { endpointId: "endpoint_a" } },
    );

    await waitFor(() => expect(requestCableTicket).toHaveBeenCalledTimes(1));
    rerender({ endpointId: "endpoint_b" });
    await waitFor(() => expect(requestCableTicket).toHaveBeenCalledTimes(2));

    await act(async () => {
      ticketA.resolve({ ok: true, data: { token: "ticket-a", expires_at: "2026-11-28T02:00:00Z" } });
    });
    expect(createConsumer).not.toHaveBeenCalled();

    await act(async () => {
      ticketB.resolve({ ok: true, data: { token: "ticket-b", expires_at: "2026-11-28T02:00:00Z" } });
    });
    expect(subscriptions).toEqual([{ channel: "EndpointDeliveryChannel", endpoint_id: "endpoint_b" }]);

    rerender({ endpointId: "endpoint_c" });
    await waitFor(() => expect(requestCableTicket).toHaveBeenCalledTimes(3));
    unmount();
    await act(async () => {
      ticketC.resolve({ ok: true, data: { token: "ticket-c", expires_at: "2026-11-28T02:00:00Z" } });
    });

    expect(subscriptions).toEqual([{ channel: "EndpointDeliveryChannel", endpoint_id: "endpoint_b" }]);
    expect(unsubscribeCurrent).toHaveBeenCalledTimes(1);
    expect(disconnectCurrent).toHaveBeenCalledTimes(1);
  });
});

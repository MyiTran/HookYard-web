/* eslint-disable @typescript-eslint/no-require-imports */
import { act, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { MemoryRouter } from "react-router-dom";
import type { DeliveryMessageSummary } from "../../types/delivery";

jest.mock("../../lib/deliveryApi", () => ({
  DELIVERIES_PAGE_SIZE: 25,
  listEndpointMessages: jest.fn(),
  getDeliveryMessage: jest.fn(),
}));
jest.mock("../../hooks/useEndpointDeliveryRealtime", () => ({ useEndpointDeliveryRealtime: jest.fn() }));

const { listEndpointMessages, getDeliveryMessage } = require("../../lib/deliveryApi") as {
  listEndpointMessages: jest.Mock<() => Promise<unknown>>;
  getDeliveryMessage: jest.Mock<() => Promise<unknown>>;
};
const { useEndpointDeliveryRealtime } = require("../../hooks/useEndpointDeliveryRealtime") as {
  useEndpointDeliveryRealtime: jest.Mock<(options: unknown) => unknown>;
};
const { default: DeliveryActivityPanel } = require("./DeliveryActivityPanel") as typeof import("./DeliveryActivityPanel");

const replay = { allowed: true, blocked_reason: null, active: false, last_outcome: null };

function message(id: string, eventType = "invoice.created"): DeliveryMessageSummary {
  return {
    id,
    webhook_id: `wh_${id}`,
    status: "pending",
    event_id: `evt_${id}`,
    event_type: eventType,
    created_at: "2026-11-28T01:00:00Z",
    updated_at: "2026-11-28T01:00:00Z",
    attempt_count: 0,
    max_attempts: 3,
    next_retry_at: null,
    terminal_at: null,
    retryable: true,
    last_attempt_at: null,
    last_response_status: null,
    last_duration_ms: null,
    last_error_type: null,
    replay,
  };
}

function renderPanel() {
  return render(
    <MemoryRouter initialEntries={["/projects/project_1/endpoints/endpoint_1"]}>
      <DeliveryActivityPanel
        projectId="project_1"
        endpointId="endpoint_1"
        endpointName="Primary endpoint"
        origin={{ from: "/endpoints", fromLabel: "Endpoints" }}
      />
    </MemoryRouter>,
  );
}

describe("DeliveryActivityPanel realtime updates", () => {
  let realtimeOptions: { onDeliveryUpdate: (update: unknown) => void; onConnected: () => void };

  beforeEach(() => {
    listEndpointMessages.mockResolvedValue({
      ok: true,
      data: { data: [message("msg_1")], meta: { page_number: 1, page_size: 25, total_count: 1, prev_page: null, next_page: null, last_page: 1 } },
    });
    useEndpointDeliveryRealtime.mockImplementation((options: unknown) => {
      realtimeOptions = options as typeof realtimeOptions;
      return { status: "connected" };
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("adds a newly received Message without reloading the page", async () => {
    getDeliveryMessage.mockResolvedValue({
      ok: true,
      data: {
        ...message("msg_2", "payment.succeeded"),
        event: { id: "evt_msg_2", event_type: "payment.succeeded", payload: {}, created_at: "2026-11-28T01:01:00Z" },
        endpoint: { id: "endpoint_1", name: "Primary endpoint", url: "https://example.test", project: { id: "project_1", name: "Project" } },
        attempts: [],
      },
    });
    renderPanel();
    await screen.findByText("invoice.created");

    await act(async () => realtimeOptions.onDeliveryUpdate({ messageId: "msg_2", eventType: "payment.succeeded", status: "pending" }));

    expect(await screen.findByText("payment.succeeded")).not.toBeNull();
    expect(listEndpointMessages).toHaveBeenCalledTimes(1);
  });

  it("patches an existing Message in place and does not duplicate repeated events", async () => {
    renderPanel();
    await screen.findByText("invoice.created");
    const update = {
      messageId: "msg_1",
      eventType: "invoice.created",
      status: "failed",
      messageStatus: "failed",
      deliveryState: "terminal",
      attemptCount: 2,
      responseStatus: 503,
      errorType: "TimeoutError",
      durationMs: 200,
      occurredAt: "2026-11-28T01:01:00Z",
    };

    await act(async () => realtimeOptions.onDeliveryUpdate(update));
    await act(async () => realtimeOptions.onDeliveryUpdate(update));

    expect(await screen.findByText("Failed")).not.toBeNull();
    expect(screen.getAllByText("invoice.created")).toHaveLength(1);
    expect(screen.getByText("HTTP 503")).not.toBeNull();
  });

  it.each([
    ["processing", "delivering", "Delivering"],
    ["retry_scheduled", "pending", "Retry scheduled"],
    ["succeeded", "succeeded", "Succeeded"],
    ["held", "pending", "Held"],
  ])("renders the %s delivery transition", async (status, messageStatus, label) => {
    renderPanel();
    await screen.findByText("invoice.created");

    await act(async () => realtimeOptions.onDeliveryUpdate({
      messageId: "msg_1",
      eventType: "invoice.created",
      status,
      messageStatus,
      deliveryState: status === "processing" ? "delivering" : status === "retry_scheduled" ? "scheduled_retry" : status === "held" ? "held_by_circuit" : "terminal",
      attemptCount: 1,
      responseStatus: null,
      errorType: null,
      durationMs: null,
      occurredAt: "2026-11-28T01:01:00Z",
    }));

    expect((await screen.findAllByText(label)).length).toBeGreaterThan(0);
  });

  it("renders the connected indicator and keeps the current page while refreshing after reconnect", async () => {
    renderPanel();
    await screen.findByText("invoice.created");

    expect(screen.getByText("Connected")).not.toBeNull();
    await act(async () => realtimeOptions.onConnected());
    await waitFor(() => expect(listEndpointMessages).toHaveBeenCalledTimes(2));
  });
});

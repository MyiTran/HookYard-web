import { describe, expect, it } from "@jest/globals";
import {
  applyEndpointDeliveryUpdate,
  parseEndpointDeliveryUpdate,
} from "./endpointDeliveryRealtime";
import type { DeliveryMessageSummary } from "../types/delivery";

const message: DeliveryMessageSummary = {
  id: "msg_1",
  webhook_id: "wh_1",
  status: "pending",
  event_id: "evt_1",
  event_type: "invoice.created",
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
  replay: { allowed: true, blocked_reason: null, active: false, last_outcome: null },
};

function parse(status: string) {
  return parseEndpointDeliveryUpdate({
    type: "delivery.updated",
    endpoint_id: "endpoint_1",
    message_id: "msg_1",
    event_type: "invoice.created",
    status,
    attempt_count: 2,
    latest_attempt_status: status === "failed" ? "failed" : "succeeded",
    response_status: status === "failed" ? 503 : 200,
    error_type: status === "failed" ? "TimeoutError" : null,
    duration_ms: 193,
    occurred_at: "2026-11-28T01:01:00Z",
  });
}

describe("endpoint delivery realtime payload", () => {
  it("patches an existing Message in place with the latest delivery fields", () => {
    const event = parse("succeeded");

    expect(event).not.toBeNull();
    expect(applyEndpointDeliveryUpdate([message], event!)).toEqual([
      expect.objectContaining({
        id: "msg_1",
        status: "succeeded",
        realtime_status: "succeeded",
        attempt_count: 2,
        event_type: "invoice.created",
        last_response_status: 200,
        last_error_type: null,
        last_duration_ms: 193,
        last_attempt_at: "2026-11-28T01:01:00Z",
        updated_at: "2026-11-28T01:01:00Z",
      }),
    ]);
  });

  it.each([
    ["pending", "pending", "queued"],
    ["processing", "delivering", "delivering"],
    ["succeeded", "succeeded", "terminal"],
    ["failed", "failed", "terminal"],
    ["held", "pending", "held_by_circuit"],
    ["retry_scheduled", "pending", "scheduled_retry"],
  ])("normalizes %s without exposing transport payload data", (status, messageStatus, deliveryState) => {
    const event = parse(status);

    expect(event).toEqual(expect.objectContaining({ status, messageStatus, deliveryState }));
    expect(event).not.toHaveProperty("request_body");
    expect(event).not.toHaveProperty("response_body");
    expect(event).not.toHaveProperty("headers");
  });

  it("does not add a duplicate Message when the event is delivered again", () => {
    const event = parse("processing");
    const firstUpdate = applyEndpointDeliveryUpdate([message], event!);
    const secondUpdate = applyEndpointDeliveryUpdate(firstUpdate, event!);

    expect(secondUpdate).toHaveLength(1);
    expect(secondUpdate[0]).toEqual(expect.objectContaining({ id: "msg_1", status: "delivering" }));
  });

  it.each([
    null,
    {},
    { type: "delivery.created" },
    { type: "delivery.updated", endpoint_id: "endpoint_1", message_id: "msg_1", status: "unknown" },
    { type: "delivery.updated", endpoint_id: "endpoint_1", message_id: "msg_1", status: "succeeded", attempt_count: -1 },
    { type: "delivery.updated", endpoint_id: "endpoint_1", message_id: "msg_1", status: "succeeded", occurred_at: "bad-date" },
  ])("ignores malformed or unknown payloads", (payload) => {
    expect(parseEndpointDeliveryUpdate(payload)).toBeNull();
  });
});

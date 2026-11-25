import { test } from "node:test";
import assert from "node:assert/strict";
import { toSafeNotificationPath } from "../src/lib/notificationTarget.ts";

test("returns null for non-string values", () => {
  assert.equal(toSafeNotificationPath(null), null);
  assert.equal(toSafeNotificationPath(undefined), null);
});

test("returns null for empty or whitespace-only values", () => {
  assert.equal(toSafeNotificationPath(""), null);
  assert.equal(toSafeNotificationPath("   "), null);
  assert.equal(toSafeNotificationPath("\t\n"), null);
});

test("keeps safe internal application paths", () => {
  assert.equal(toSafeNotificationPath("/"), "/");
  assert.equal(toSafeNotificationPath("/projects"), "/projects");
  assert.equal(toSafeNotificationPath("/projects/123"), "/projects/123");
  assert.equal(
    toSafeNotificationPath("/projects/123/endpoints/456/deliveries/789"),
    "/projects/123/endpoints/456/deliveries/789",
  );
  assert.equal(toSafeNotificationPath("/admin/projects/123"), "/admin/projects/123");
  assert.equal(toSafeNotificationPath("/settings"), "/settings");
  assert.equal(toSafeNotificationPath("/replay?status=failed"), "/replay?status=failed");
  assert.equal(toSafeNotificationPath("  /projects/123  "), "/projects/123");
});

test("rejects external URLs", () => {
  assert.equal(toSafeNotificationPath("https://evil.example/phishing"), null);
  assert.equal(toSafeNotificationPath("http://evil.example"), null);
  assert.equal(toSafeNotificationPath("ftp://evil.example"), null);
});

test("rejects protocol-relative URLs", () => {
  assert.equal(toSafeNotificationPath("//evil.example"), null);
  assert.equal(toSafeNotificationPath("//evil.example/path"), null);
});

test("rejects javascript: and other unsafe schemes", () => {
  assert.equal(toSafeNotificationPath("javascript:alert(1)"), null);
  assert.equal(toSafeNotificationPath("JAVASCRIPT:alert(1)"), null);
  assert.equal(toSafeNotificationPath("data:text/html,<script>alert(1)</script>"), null);
  assert.equal(toSafeNotificationPath("vbscript:msgbox(1)"), null);
  assert.equal(toSafeNotificationPath("mailto:user@example.com"), null);
});

test("rejects malformed paths", () => {
  assert.equal(toSafeNotificationPath("projects/123"), null);
  assert.equal(toSafeNotificationPath("/foo\\bar"), null);
  assert.equal(toSafeNotificationPath("/foo bar"), null);
  assert.equal(toSafeNotificationPath("/foo\u0000bar"), null);
});

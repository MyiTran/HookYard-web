/* eslint-disable @typescript-eslint/no-require-imports */
import { afterEach, describe, expect, it, jest } from "@jest/globals";

jest.mock("../config", () => ({ API_URL: "http://api.example.test/api/v1" }));

const { signInWithGoogle, signInWithPassword } = require("./auth") as typeof import("./auth");

describe("signInWithGoogle", () => {
  afterEach(() => {
    jest.restoreAllMocks();
    localStorage.clear();
  });

  it("sends only the GIS credential and stores the JWT from Authorization", async () => {
    const fetchMock = jest.fn<typeof fetch>().mockResolvedValue({
      ok: true,
      headers: { get: (name: string) => (name === "Authorization" ? "Bearer hookyard-jwt" : null) },
      json: async () => ({ id: "1", email: "person@example.com" }),
    } as unknown as Response);
    Object.assign(global, { fetch: fetchMock });

    const result = await signInWithGoogle("gis-id-token");

    expect(fetchMock).toHaveBeenCalledWith(
      "http://api.example.test/api/v1/auth/google",
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential: "gis-id-token" }),
      }),
    );
    expect(result).toEqual({ ok: true, user: { id: "1", email: "person@example.com" } });
    expect(localStorage.getItem("token")).toBe("Bearer hookyard-jwt");
    expect(window.location.href).not.toContain("gis-id-token");
  });

  it("uses the same valid Authorization session contract for password login", async () => {
    const fetchMock = jest.fn<typeof fetch>().mockResolvedValue({
      ok: true,
      headers: { get: () => "Bearer password-jwt" },
      json: async () => ({ id: "1", email: "person@example.com" }),
    } as unknown as Response);
    Object.assign(global, { fetch: fetchMock });

    await signInWithPassword("person@example.com", "password");

    expect(fetchMock).toHaveBeenCalledWith("http://api.example.test/api/v1/auth/sign_in", expect.objectContaining({
      body: JSON.stringify({ user: { email: "person@example.com", password: "password" } }),
    }));
    expect(localStorage.getItem("token")).toBe("Bearer password-jwt");
  });

  it("preserves an existing session when the response lacks a valid Bearer token", async () => {
    localStorage.setItem("token", "Bearer existing-jwt");
    Object.assign(global, { fetch: jest.fn<typeof fetch>().mockResolvedValue({
      ok: true,
      status: 200,
      headers: { get: () => "invalid" },
      json: async () => ({ id: "1", email: "person@example.com" }),
    } as unknown as Response) });

    const result = await signInWithGoogle("fake-google-id-token");

    expect(result).toEqual(expect.objectContaining({ ok: false }));
    expect(localStorage.getItem("token")).toBe("Bearer existing-jwt");
    expect(sessionStorage.getItem("credential")).toBeNull();
    expect(window.location.href).not.toContain("fake-google-id-token");
  });

  it("preserves account_link_required and prefers a valid JSON retry_after over the header", async () => {
    Object.assign(global, { fetch: jest.fn<typeof fetch>().mockResolvedValue({
      ok: false, status: 409,
      headers: { get: (name: string) => name === "Retry-After" ? "2" : null },
      json: async () => ({ code: "account_link_required", retry_after: 2.2 }),
    } as unknown as Response) });

    await expect(signInWithGoogle("fake-google-id-token")).resolves.toEqual(expect.objectContaining({
      ok: false, code: "account_link_required", retryAfterSeconds: 3,
    }));
  });

  it.each([null, "", "0", "-1", "NaN", "Infinity"])("rejects invalid Retry-After header %p", async (header) => {
    Object.assign(global, { fetch: jest.fn<typeof fetch>().mockResolvedValue({
      ok: false, status: 429,
      headers: { get: (name: string) => name === "Retry-After" ? header : null },
      json: async () => ({}),
    } as unknown as Response) });

    await expect(signInWithGoogle("fake-google-id-token")).resolves.toEqual(expect.objectContaining({ retryAfterSeconds: null }));
  });

  it("uses a valid Retry-After header when JSON retry_after is absent", async () => {
    Object.assign(global, { fetch: jest.fn<typeof fetch>().mockResolvedValue({
      ok: false, status: 429,
      headers: { get: (name: string) => name === "Retry-After" ? "1.2" : null },
      json: async () => ({}),
    } as unknown as Response) });

    await expect(signInWithGoogle("fake-google-id-token")).resolves.toEqual(expect.objectContaining({ retryAfterSeconds: 2 }));
  });
});

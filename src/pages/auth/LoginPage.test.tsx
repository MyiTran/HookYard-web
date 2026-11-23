/* eslint-disable @typescript-eslint/no-require-imports */
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, jest } from "@jest/globals";

jest.mock("../../config", () => ({ API_URL: "http://api.example.test/api/v1", GOOGLE_CLIENT_ID: "fake-client-id" }));

const { default: LoginPage } = require("./LoginPage") as typeof import("./LoginPage");

type GoogleCallback = (response: { credential?: string }) => void;

describe("LoginPage Google errors", () => {
  let callback: GoogleCallback | undefined;

  function installGoogle() {
    window.google = { accounts: { id: {
      initialize: jest.fn((options: { callback: GoogleCallback }) => { callback = options.callback; }),
      renderButton: jest.fn(),
    } } };
  }

  async function renderReadyPage() {
    installGoogle();
    render(<LoginPage />);
    await waitFor(() => expect(window.google?.accounts.id.initialize).toHaveBeenCalled());
  }

  function respond(status: number, body: unknown, retryAfter?: string) {
    Object.assign(global, { fetch: jest.fn<typeof fetch>().mockResolvedValue({
      ok: false, status, headers: { get: (name: string) => name === "Retry-After" ? retryAfter ?? null : null }, json: async () => body,
    } as unknown as Response) });
  }

  afterEach(() => { cleanup(); delete window.google; document.querySelectorAll('script[src="https://accounts.google.com/gsi/client"]').forEach((item) => item.remove()); jest.restoreAllMocks(); jest.useRealTimers(); });

  it("shows a safe verification error for an invalid credential and focuses it", async () => {
    respond(401, { error: "invalid" });
    await renderReadyPage();
    await act(async () => callback?.({ credential: "fake-google-id-token" }));
    const alert = await screen.findByRole("alert");
    expect(alert.textContent).toContain("Google sign-in could not be verified. Please try again.");
    await waitFor(() => expect(document.activeElement).toBe(alert));
  });

  it("explains account linking without disclosing privileged details", async () => {
    respond(409, { code: "account_link_required" });
    await renderReadyPage();
    await act(async () => callback?.({ credential: "fake-google-id-token" }));
    expect((await screen.findByRole("alert")).textContent).toContain("An account already exists for this email. Sign in with your email and password.");
  });

  it("uses the generic Google error for an unrelated conflict", async () => {
    respond(409, { code: "other_conflict" });
    await renderReadyPage();
    await act(async () => callback?.({ credential: "fake-google-id-token" }));
    expect((await screen.findByRole("alert")).textContent).toContain("Google sign-in could not be verified. Please try again.");
  });

  it("uses retry_after to disable Google sign-in then enables it", async () => {
    jest.useFakeTimers();
    respond(429, { retry_after: 2 });
    await renderReadyPage();
    await act(async () => callback?.({ credential: "fake-google-id-token" }));
    expect(document.body.contains(await screen.findByRole("alert"))).toBe(true);
    expect(screen.getByText("Google sign-in is in progress.").parentElement?.getAttribute("aria-disabled")).toBe("true");
    expect(screen.getByLabelText(/email/i).hasAttribute("disabled")).toBe(false);
    await act(async () => { jest.advanceTimersByTime(2000); });
    expect(window.google?.accounts.id.renderButton).toHaveBeenCalled();
  });

  it("keeps password login usable when Google is unavailable", async () => {
    delete window.google;
    render(<LoginPage />);
    fireEvent.error(document.querySelector('script[src="https://accounts.google.com/gsi/client"]')!);
    expect(document.body.contains(await screen.findByText("Google Sign-In is currently unavailable."))).toBe(true);
    expect(screen.getByRole("button", { name: "Sign in" }).hasAttribute("disabled")).toBe(false);
  });

  it("places Google sign-in before the email form and uses the email divider label", async () => {
    await renderReadyPage();
    const divider = screen.getByText("OR CONTINUE WITH EMAIL");
    const email = screen.getByLabelText(/email/i);

    expect(divider.compareDocumentPosition(email)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
  });
});

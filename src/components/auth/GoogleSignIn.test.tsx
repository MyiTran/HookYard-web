import { act, cleanup, render, waitFor } from "@testing-library/react";
import { StrictMode } from "react";
import { afterEach, describe, expect, it, jest } from "@jest/globals";
import GoogleSignIn from "./GoogleSignIn";

type GoogleCallback = (response: { credential?: string }) => void;

describe("GoogleSignIn", () => {
  afterEach(() => {
    cleanup();
    document.querySelectorAll('script[src="https://accounts.google.com/gsi/client"]').forEach((script) => script.remove());
    delete window.google;
    jest.restoreAllMocks();
  });

  it("loads GIS once, initializes with the client ID, renders once, and forwards a credential", async () => {
    let callback: GoogleCallback | undefined;
    const initialize = jest.fn((options: { callback: GoogleCallback }) => { callback = options.callback; });
    const renderButton = jest.fn((element: HTMLElement) => element.append(document.createElement("button")));
    const onCredential = jest.fn<(credential: string) => void>();
    const onUnavailable = jest.fn();
    const { container } = render(<GoogleSignIn clientId="fake-client-id" disabled={false} onCredential={onCredential} onUnavailable={onUnavailable} />);

    const script = document.querySelector<HTMLScriptElement>('script[src="https://accounts.google.com/gsi/client"]');
    expect(script).not.toBeNull();
    window.google = { accounts: { id: { initialize, renderButton } } };
    act(() => script?.onload?.(new Event("load")));

    await waitFor(() => expect(initialize).toHaveBeenCalledWith(expect.objectContaining({ client_id: "fake-client-id" })));
    expect(renderButton).toHaveBeenCalledTimes(1);
    expect(container.querySelectorAll("button")).toHaveLength(1);
    act(() => callback?.({ credential: "fake-google-id-token" }));
    expect(onCredential).toHaveBeenCalledWith("fake-google-id-token");
  });

  it("does not append multiple scripts or buttons in StrictMode", async () => {
    const initialize = jest.fn();
    const renderButton = jest.fn((element: HTMLElement) => element.append(document.createElement("button")));
    window.google = { accounts: { id: { initialize, renderButton } } };
    const { container } = render(<StrictMode><GoogleSignIn clientId="fake-client-id" disabled={false} onCredential={jest.fn<(credential: string) => void>()} onUnavailable={jest.fn()} /></StrictMode>);

    await waitFor(() => expect(initialize).toHaveBeenCalled());
    expect(document.querySelectorAll('script[src="https://accounts.google.com/gsi/client"]')).toHaveLength(0);
    expect(renderButton).toHaveBeenCalledTimes(1);
    expect(container.querySelectorAll("button")).toHaveLength(1);
  });

  it("keeps GIS initialized while callbacks and disabled state change", async () => {
    let callback: GoogleCallback | undefined;
    const initialize = jest.fn((options: { callback: GoogleCallback }) => { callback = options.callback; });
    const renderButton = jest.fn((element: HTMLElement) => element.append(document.createElement("button")));
    window.google = { accounts: { id: { initialize, renderButton } } };
    const firstCallback = jest.fn<(credential: string) => void>();
    const { rerender, container } = render(<GoogleSignIn clientId="fake-client-id" disabled={false} onCredential={firstCallback} onUnavailable={jest.fn()} />);
    await waitFor(() => expect(initialize).toHaveBeenCalledTimes(1));
    const latestCallback = jest.fn<(credential: string) => void>();
    rerender(<GoogleSignIn clientId="fake-client-id" disabled={true} onCredential={latestCallback} onUnavailable={jest.fn()} />);
    rerender(<GoogleSignIn clientId="fake-client-id" disabled={false} onCredential={latestCallback} onUnavailable={jest.fn()} />);
    expect(initialize).toHaveBeenCalledTimes(1);
    expect(renderButton).toHaveBeenCalledTimes(1);
    expect(container.querySelectorAll("button")).toHaveLength(1);
    act(() => callback?.({ credential: "fake-google-id-token" }));
    expect(latestCallback).toHaveBeenCalledWith("fake-google-id-token");
  });
});

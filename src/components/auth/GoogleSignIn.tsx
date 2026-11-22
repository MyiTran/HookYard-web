import { useEffect, useRef } from "react";

type GoogleCredentialResponse = { credential?: string };

type GoogleAccounts = {
  id: {
    initialize: (configuration: { client_id: string; callback: (response: GoogleCredentialResponse) => void }) => void;
    renderButton: (element: HTMLElement, options: { type: "standard"; theme: "outline"; size: "large"; shape: "rectangular"; text: "signin_with"; width: number }) => void;
  };
};

declare global {
  interface Window {
    google?: { accounts: GoogleAccounts };
  }
}

let gisLoadPromise: Promise<void> | null = null;

function loadGoogleIdentityServices(): Promise<void> {
  if (window.google?.accounts.id) return Promise.resolve();
  if (gisLoadPromise) return gisLoadPromise;

  gisLoadPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => window.google?.accounts.id ? resolve() : reject(new Error("Google Identity Services did not initialize."));
    script.onerror = () => reject(new Error("Google Identity Services could not load."));
    document.head.appendChild(script);
  });

  return gisLoadPromise;
}

type GoogleSignInProps = {
  clientId: string;
  disabled: boolean;
  onCredential: (credential: string) => Promise<void> | void;
  onUnavailable: () => void;
};

function GoogleSignIn({ clientId, disabled, onCredential, onUnavailable }: GoogleSignInProps) {
  const buttonRef = useRef<HTMLDivElement>(null);
  const handledCredential = useRef(false);

  useEffect(() => {
    let active = true;

    loadGoogleIdentityServices()
      .then(() => {
        if (!active || !buttonRef.current || !window.google?.accounts.id) return;

        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: ({ credential }) => {
            if (!credential || handledCredential.current) return;
            handledCredential.current = true;
            void Promise.resolve(onCredential(credential)).finally(() => {
              handledCredential.current = false;
            });
          },
        });
        buttonRef.current.replaceChildren();
        window.google.accounts.id.renderButton(buttonRef.current, {
          type: "standard",
          theme: "outline",
          size: "large",
          shape: "rectangular",
          text: "signin_with",
          width: Math.min(buttonRef.current.clientWidth || 384, 384),
        });
      })
      .catch(() => {
        if (active) onUnavailable();
      });

    return () => {
      active = false;
    };
  }, [clientId, onCredential, onUnavailable]);

  return <div aria-disabled={disabled} className={`flex min-h-11 w-full justify-center ${disabled ? "pointer-events-none opacity-60" : ""}`} ref={buttonRef} />;
}

export default GoogleSignIn;

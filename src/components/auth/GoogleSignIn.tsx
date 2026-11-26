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
    script.onload = () => {
      if (window.google?.accounts.id) return resolve();
      script.remove();
      gisLoadPromise = null;
      reject(new Error("Google Identity Services did not initialize."));
    };
    script.onerror = () => {
      script.remove();
      gisLoadPromise = null;
      reject(new Error("Google Identity Services could not load."));
    };
    document.head.appendChild(script);
  });

  return gisLoadPromise;
}

type GoogleSignInProps = {
  clientId: string;
  disabled: boolean;
  statusMessage: string | null;
  onCredential: (credential: string) => Promise<void> | void;
  onUnavailable: () => void;
};

function GoogleSignIn({ clientId, disabled, statusMessage, onCredential, onUnavailable }: GoogleSignInProps) {
  const buttonRef = useRef<HTMLDivElement>(null);
  const handledCredential = useRef(false);
  const onCredentialRef = useRef(onCredential);
  const onUnavailableRef = useRef(onUnavailable);
  const disabledRef = useRef(disabled);

  useEffect(() => {
    onCredentialRef.current = onCredential;
    onUnavailableRef.current = onUnavailable;
    disabledRef.current = disabled;
  }, [disabled, onCredential, onUnavailable]);

  useEffect(() => {
    let active = true;

    loadGoogleIdentityServices()
      .then(() => {
        if (!active || !buttonRef.current || !window.google?.accounts.id) return;

        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: ({ credential }) => {
            if (!credential || disabledRef.current || handledCredential.current) return;
            handledCredential.current = true;
            void Promise.resolve(onCredentialRef.current(credential)).finally(() => {
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
        if (active) onUnavailableRef.current();
      });

    return () => {
      active = false;
    };
  }, [clientId]);

  return (
    <div role="group" aria-label="Google sign-in" aria-busy={disabled} aria-disabled={disabled} className="relative flex min-h-11 w-full justify-center">
      <div ref={buttonRef} inert={disabled} className={disabled ? "pointer-events-none opacity-0" : ""} />
      {disabled && <div className="absolute inset-0 flex items-center justify-center text-sm text-[#718078]">{statusMessage}</div>}
    </div>
  );
}

export default GoogleSignIn;

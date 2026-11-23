import { useCallback, useEffect, useRef, useState } from "react";
import GoogleSignIn from "../../components/auth/GoogleSignIn";
import Brand from "../../components/branding/Brand";
import { GOOGLE_CLIENT_ID } from "../../config";
import { signInWithGoogle, signInWithPassword } from "../../lib/auth";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleUnavailable, setGoogleUnavailable] = useState(!GOOGLE_CLIENT_ID);
  const [googleCooldown, setGoogleCooldown] = useState(false);
  const errorRef = useRef<HTMLParagraphElement>(null);
  const cooldownTimerRef = useRef<number | null>(null);

  useEffect(() => () => {
    if (cooldownTimerRef.current !== null) window.clearTimeout(cooldownTimerRef.current);
  }, []);

  function showError(message: string) {
    setError(message);
    requestAnimationFrame(() => errorRef.current?.focus());
  }

  async function handleSubmit() {
    setError("");
    setLoading(true);

    try {
      const result = await signInWithPassword(email, password);

      if (!result.ok) {
        showError(result.error);
        return;
      }
      window.location.href = "/";
    } catch {
      showError("Cannot connect to the server. Please try again!");
    } finally {
      setLoading(false);
    }
  }

  const handleGoogleCredential = useCallback(async (credential: string) => {
    if (googleLoading || googleCooldown) return;

    setError("");
    setGoogleLoading(true);

    try {
      const result = await signInWithGoogle(credential);

      if (!result.ok) {
        if (result.code === "account_link_required") {
          showError("An account already exists for this email. Sign in with your email and password.");
        } else if (result.status === 429) {
          showError("Google sign-in is temporarily unavailable. Please try again shortly.");
          setGoogleCooldown(true);
          cooldownTimerRef.current = window.setTimeout(() => setGoogleCooldown(false), Math.max(1, result.retryAfterSeconds ?? 30) * 1000);
        } else if (result.status === 0 || result.status >= 500) {
          showError("Unable to complete Google sign-in. Please try again.");
        } else {
          showError("Google sign-in could not be verified. Please try again.");
        }
        return;
      }

      window.location.href = "/";
    } catch {
      showError("Unable to complete Google sign-in. Please try again.");
    } finally {
      setGoogleLoading(false);
    }
  }, [googleCooldown, googleLoading]);

  const handleGoogleUnavailable = useCallback(() => {
    setGoogleUnavailable(true);
  }, []);
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#EBEFEC] p-6 text-[#17211B]">
      <main className="grid min-h-[700px] w-full max-w-6xl overflow-hidden rounded-[28px] border border-[#C8DACD] bg-white shadow-[0_24px_70px_rgba(32,78,53,0.10)] lg:grid-cols-2">
        <section className="hidden flex-col bg-[#DFECE1] p-12 lg:flex lg:p-16">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              <Brand />
            </h1>

            <p className="mt-2 text-xs font-medium uppercase tracking-[4px] text-[#65766B]">
              Webhook operations
            </p>
          </div>

          <div className="my-auto">
            <p className="text-xs font-semibold uppercase tracking-[3px] text-[#718278]">
              Delivery infrastructure
            </p>

            <h2 className="mt-6 max-w-xl text-4xl font-semibold leading-tight tracking-tight lg:text-5xl">
              Monitor every webhook delivery with confidence.
            </h2>

            <p className="mt-7 max-w-xl text-base leading-7 text-[#607267]">
              Track deliveries, investigate failures and replay webhooks from one secure workspace.
            </p>
          </div>
        </section>

        <section className="flex items-center justify-center p-8 sm:p-12 lg:p-16">
          <div className="w-full max-w-md">
            <p className="text-xs font-semibold uppercase tracking-[3px] text-[#718278]">
              Secure access
            </p>

            <h2 className="mt-5 text-4xl font-semibold tracking-tight">
              Welcome back
            </h2>

            <p className="mt-3 text-base text-[#718078]">
              Enter your account details to continue
            </p>

            <div className="mt-8 min-h-11">
              {GOOGLE_CLIENT_ID && !googleUnavailable ? (
                <GoogleSignIn
                  clientId={GOOGLE_CLIENT_ID}
                  disabled={googleLoading || googleCooldown}
                  onCredential={handleGoogleCredential}
                  onUnavailable={handleGoogleUnavailable}
                />
              ) : (
                <p className="pt-2 text-center text-sm text-[#718078]">Google Sign-In is currently unavailable.</p>
              )}
            </div>

            <div className="my-8 flex items-center gap-3 text-xs font-medium uppercase tracking-[2px] text-[#8A9990]">
              <span className="h-px flex-1 bg-[#DCE6DE]" />
              <span>OR CONTINUE WITH EMAIL</span>
              <span className="h-px flex-1 bg-[#DCE6DE]" />
            </div>

            <form
              className="space-y-6"
              onSubmit={async (event) => {
                event.preventDefault();
                await handleSubmit();
              }}
            >
              <div>
                <label htmlFor="email" className="mb-2 block text-sm font-semibold">
                  Email <span className="text-[#B42318]">*</span>
                </label>

                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="hookyard@example.com"
                  autoComplete="email"
                  required
                  className="h-14 w-full rounded-xl border border-[#C9DACE] bg-white px-4 outline-none transition placeholder:text-[#A4B0A8] focus:border-[#23613F] focus:ring-2 focus:ring-[#23613F]/10"
                />
              </div>

              <div>
                <label htmlFor="password" className="mb-2 block text-sm font-semibold">
                  Password <span className="text-[#B42318]">*</span>
                </label>

                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                  className="h-14 w-full rounded-xl border border-[#C9DACE] bg-white px-4 outline-none transition placeholder:text-[#A4B0A8] focus:border-[#23613F] focus:ring-2 focus:ring-[#23613F]/10"
                />
                <div className="mt-3 mb-2 flex items-center justify-between">
                    <a href="/users/password/new" className="text-sm font-semibold text-[#23613F] hover:underline">Forgot password?</a>
                </div>
              </div>

              {error && (
                <p ref={errorRef} role="alert" tabIndex={-1} className="rounded-xl bg-[#FBEEEE] px-4 py-3 text-sm text-[#B42318]">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="h-14 w-full rounded-xl bg-[#214E35] font-semibold text-white transition hover:bg-[#173D28] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Signing in..." : "Sign in"}
              </button>
            </form>

            <p className="mt-8 text-center text-sm text-[#718078]">
                Don&apos;t have an account?{" "}
                <a href="/users/sign_up" className="font-semibold text-[#23613F] hover:underline">Create account</a>
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}

export default LoginPage;

import { useState, type SubmitEvent } from "react";
import { Link } from "react-router-dom";
import Brand from "../../components/branding/Brand";
import { API_URL } from "../../config";
import { formatApiError } from "../../lib/apiError";

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/password`, {
        method: "POST",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify({ user: { email } }),
      });

      if (response.ok) {
        setMessage("If this email is registered, password reset instructions have been sent. Please check your email!");
      } else {
        const data = await response.json().catch(() => null);

        setError(formatApiError(data, "We could not send the reset instructions. Please try again!"));
      }
    } catch {
      setError("Unable to connect to the server. Please try again!");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#EBEFEC] p-6 text-[#17211B]">
      <main className="w-full max-w-md rounded-[28px] border border-[#C8DACD] bg-white p-10 shadow-[0_24px_70px_rgba(32,78,53,0.10)]">
        <h1 className="text-3xl font-bold tracking-tight">
          <Brand />
        </h1>

        <p className="mt-8 text-xs font-semibold uppercase tracking-[3px] text-[#718278]">
          Account recovery
        </p>

        <h2 className="mt-4 text-3xl font-semibold tracking-tight">
          Forgot password?
        </h2>

        <p className="mt-3 text-sm leading-6 text-[#718078]">
          Enter your email and we will send you a password reset link.
        </p>

        <form className="mt-8" onSubmit={handleSubmit}>
          <label htmlFor="email" className="mb-2 block text-sm font-semibold">
            Email <span className="text-[#B42318]">*</span>
          </label>

          <input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
            required
            className="h-14 w-full rounded-xl border border-[#C9DACE] px-4 outline-none focus:border-[#23613F]"
          />

          {error && (
            <p className="mt-4 rounded-xl bg-[#FBEEEE] px-4 py-3 text-sm text-[#B42318]">
              {error}
            </p>
          )}

          {message && (
            <p className="mt-4 rounded-xl bg-[#EFF7F1] px-4 py-3 text-sm text-[#23613F]">
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-6 h-14 w-full rounded-xl bg-[#214E35] font-semibold text-white transition hover:bg-[#173D28] disabled:opacity-60"
          >
            {loading ? "Sending..." : "Send reset link"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[#718078]">
          <Link to="/users/sign_in" className="font-semibold text-[#23613F] hover:underline">
            Back to sign in
          </Link>
        </p>
      </main>
    </div>
  );
}

export default ForgotPasswordPage;

import { useState, type SubmitEvent } from "react";
import { Link } from "react-router-dom";
import Brand from "../../components/branding/Brand";
import { API_URL } from "../../config";
import { formatApiError } from "../../lib/apiError";

function SignupPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSignup(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (password !== passwordConfirmation) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/sign_up`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          user: { first_name: firstName, last_name: lastName, email, password, password_confirmation: passwordConfirmation,},
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        setError(
          formatApiError(data, "This email is already registered or the information is invalid!"),
        );
        return;
      }

      setMessage("Account created successfully. Please check your email to confirm your account!");
      setFirstName("");
      setLastName("");
      setEmail("");
      setPassword("");
      setPasswordConfirmation("");
    } catch {
      setError("Unable to connect to the server. Please try again.");
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
          Get started
        </p>

        <h2 className="mt-4 text-3xl font-semibold tracking-tight">
          Create an account
        </h2>

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

        <form onSubmit={handleSignup} className="mt-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="mb-2 block text-sm font-semibold">First Name <span className="text-[#B42318]">*</span></label>
              <input id="firstName" type="text" value={firstName} onChange={(event) => setFirstName(event.target.value)} required placeholder="John" className="h-14 w-full rounded-xl border border-[#C9DACE] px-4 outline-none focus:border-[#23613F]" />
            </div>

            <div>
              <label htmlFor="lastName" className="mb-2 block text-sm font-semibold">Last Name <span className="text-[#B42318]">*</span></label>
              <input id="lastName" type="text" value={lastName} onChange={(event) => setLastName(event.target.value)} required placeholder="Doe" className="h-14 w-full rounded-xl border border-[#C9DACE] px-4 outline-none focus:border-[#23613F]" />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-semibold">Email <span className="text-[#B42318]">*</span></label>
            <input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required placeholder="you@example.com" className="h-14 w-full rounded-xl border border-[#C9DACE] px-4 outline-none focus:border-[#23613F]" />
          </div>

          <div>
            <label htmlFor="password" className="mb-2 block text-sm font-semibold">Password <span className="text-[#B42318]">*</span></label>
            <input id="password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required placeholder="••••••••" className="h-14 w-full rounded-xl border border-[#C9DACE] px-4 outline-none focus:border-[#23613F]" />
          </div>

          <div>
            <label htmlFor="passwordConfirmation" className="mb-2 block text-sm font-semibold">Confirm Password <span className="text-[#B42318]">*</span></label>
            <input id="passwordConfirmation" type="password" value={passwordConfirmation} onChange={(event) => setPasswordConfirmation(event.target.value)} required placeholder="••••••••" className="h-14 w-full rounded-xl border border-[#C9DACE] px-4 outline-none focus:border-[#23613F]" />
          </div>

          <button type="submit" disabled={loading} className="mt-6 h-14 w-full rounded-xl bg-[#214E35] font-semibold text-white transition hover:bg-[#173D28] disabled:cursor-not-allowed disabled:opacity-60">
            {loading ? "Creating account..." : "Sign up"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[#718078]">
          Already have an account?{" "}
          <Link to="/users/sign_in" className="font-semibold text-[#23613F] hover:underline">
            Sign in
          </Link>
        </p>
      </main>
    </div>
  );
}

export default SignupPage;

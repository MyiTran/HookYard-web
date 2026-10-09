import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { API_URL } from "../../config";
import { formatApiError } from "../../lib/apiError";

function ConfirmAccountPage() {
  const [message, setMessage] = useState("Confirming your account...");
  const [success, setSuccess] = useState(false);
  const requested = useRef(false);
  const token = new URLSearchParams(window.location.search).get("confirmation_token");

  useEffect(() => {
    if (requested.current) return;

    requested.current = true;

    async function confirmAccount() {
      if (!token) {
        setMessage("This confirmation link is invalid or expired!");
        return;
      }

      try {
        const response = await fetch(`${API_URL}/auth/confirmation`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({ user: { confirmation_token: token } }),
        });

        const data = await response.json().catch(() => null);

        if (response.ok) {
          setSuccess(true);
          setMessage("Your account has been confirmed successfully.");
        } else {
          setMessage(
            formatApiError(data, "This confirmation link is invalid or expired!"),
          );
        }
      } catch {
        setMessage("Unable to connect to the server. Please try again!");
      }
    }

    confirmAccount();
  }, [token]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#EBEFEC] p-6 text-[#17211B]">
      <main className="w-full max-w-md rounded-[28px] border border-[#C8DACD] bg-white p-10 text-center shadow-[0_24px_70px_rgba(32,78,53,0.10)]">
        <h1 className="text-3xl font-bold tracking-tight">
          Hook<span className="text-[#23613F]">Yard</span>!
        </h1>

        <p className="mt-8 text-xs font-semibold uppercase tracking-[3px] text-[#718278]">
          Account confirmation
        </p>

        <h2 className="mt-4 text-3xl font-semibold tracking-tight">
          {success ? "Account confirmed" : "Confirming account"}
        </h2>

        <p className={success ? "mt-4 rounded-xl bg-[#EFF7F1] px-4 py-3 text-sm text-[#23613F]" : "mt-4 rounded-xl bg-[#FBEEEE] px-4 py-3 text-sm text-[#B42318]"}>
          {message}
        </p>

        <Link to="/users/sign_in" className="mt-7 block font-semibold text-[#23613F] hover:underline">
          Go to sign in
        </Link>
      </main>
    </div>
  );
}

export default ConfirmAccountPage;

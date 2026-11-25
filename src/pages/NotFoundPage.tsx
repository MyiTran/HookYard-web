import { Link } from "react-router-dom";
import Brand from "../components/branding/Brand";

function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#EBEFEC] p-6 text-[#17211B]">
      <main className="w-full max-w-md rounded-[28px] border border-[#C8DACD] bg-white p-10 text-center shadow-[0_24px_70px_rgba(32,78,53,0.10)]">
        <h1 className="text-3xl font-bold tracking-tight">
          <Brand />
        </h1>

        <p className="mt-8 text-xs font-semibold uppercase tracking-[3px] text-[#718278]">
          Error 404
        </p>

        <h2 className="mt-4 text-3xl font-semibold tracking-tight">Page not found</h2>

        <p className="mt-3 text-base leading-7 text-[#718078]">
          The page you are looking for does not exist or may have been moved.
        </p>

        <div className="mt-8 flex flex-col items-center gap-4">
          <Link
            to="/"
            className="inline-flex h-14 w-full items-center justify-center rounded-xl bg-[#214E35] font-semibold text-white transition hover:bg-[#173D28]"
          >
            Back to home
          </Link>

          <Link to="/users/sign_in" className="text-sm font-semibold text-[#23613F] hover:underline">
            Sign in
          </Link>
        </div>
      </main>
    </div>
  );
}

export default NotFoundPage;

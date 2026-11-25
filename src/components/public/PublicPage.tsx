import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import Brand from "../branding/Brand";

type PublicPageProps = {
  title: string;
  updated?: string;
  children: ReactNode;
};

function PublicPage({ title, updated, children }: PublicPageProps) {
  return (
    <div className="min-h-screen bg-[#EBEFEC] px-6 py-10 text-[#17211B]">
      <main className="mx-auto w-full max-w-3xl rounded-[28px] border border-[#C8DACD] bg-white p-8 shadow-[0_24px_70px_rgba(32,78,53,0.10)] sm:p-12">
        <header className="flex items-center justify-between gap-4 border-b border-[#E4EBE6] pb-6">
          <h1 className="text-3xl font-bold tracking-tight">
            <Brand />
          </h1>

          <Link to="/users/sign_in" className="text-sm font-semibold text-[#23613F] hover:underline">
            Sign in
          </Link>
        </header>

        <h2 className="mt-8 text-2xl font-semibold tracking-tight">{title}</h2>

        {updated && <p className="mt-2 text-xs font-medium text-[#8A9990]">Last updated: {updated}</p>}

        <div className="mt-6 space-y-6 text-[15px] leading-7 text-[#53665A]">{children}</div>
      </main>
    </div>
  );
}

export default PublicPage;

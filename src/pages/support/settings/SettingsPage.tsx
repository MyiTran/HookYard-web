import { Link, useOutletContext } from "react-router-dom";
import ChevronRightIcon from "../../../components/icons/ChevronRightIcon";
import SlidersIcon from "../../../components/icons/SlidersIcon";
import AppLayout from "../../../components/layout/AppLayout";
import Badge from "../../../components/ui/Badge";
import Button from "../../../components/ui/Button";
import { signOut } from "../../../lib/auth";
import type { CurrentUser } from "../../../types/user";

function SettingsPage() {
  const user = useOutletContext<CurrentUser>();

  return (
    <AppLayout user={user} title="Settings">
      <header className="mt-6">
        <h1 className="text-3xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-2 max-w-2xl text-sm font-medium text-[#53665A]">
          Manage your account and the plan your owned Projects run on.
        </p>
      </header>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <section className="rounded-[18px] border border-[#D8E3DB] bg-white p-5 shadow-[0_8px_30px_rgba(32,78,53,0.05)]">
          <h2 className="text-sm font-semibold tracking-tight text-[#1F2A24]">Account</h2>

          <dl className="mt-4 space-y-3">
            <div>
              <dt className="text-[10px] font-semibold uppercase tracking-[2px] text-[#8A9990]">Email</dt>
              <dd className="mt-1 truncate text-sm font-semibold text-[#1F2A24]">{user.email}</dd>
            </div>

            <div>
              <dt className="text-[10px] font-semibold uppercase tracking-[2px] text-[#8A9990]">Role</dt>
              <dd className="mt-1">
                {user.role ? (
                  <Badge tone="neutral">{user.role === "admin" ? "Admin" : "Support"}</Badge>
                ) : (
                  <span className="text-sm font-semibold text-[#1F2A24]">—</span>
                )}
              </dd>
            </div>
          </dl>

          <div className="mt-5 border-t border-[#E4EBE6] pt-4">
            <Button variant="dangerOutline" size="md" onClick={() => void signOut()}>
              Sign out
            </Button>
          </div>
        </section>

        <Link
          to="/settings/plan"
          className="group flex min-w-0 items-start justify-between gap-4 rounded-[18px] border border-[#D8E3DB] bg-white p-5 shadow-[0_8px_30px_rgba(32,78,53,0.05)] transition hover:border-[#23613F] hover:shadow-[0_12px_36px_rgba(32,78,53,0.1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#23613F]/30"
        >
          <div className="min-w-0">
            <span className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-[#EAF5EE] text-[#23613F]">
              <SlidersIcon className="h-5 w-5" />
            </span>

            <h2 className="mt-3 text-base font-semibold tracking-tight text-[#1F2A24]">Plan & usage</h2>
            <p className="mt-1 text-xs font-medium text-[#718078]">
              See endpoint and delivery usage, compare Free and Pro, and switch plans.
            </p>
          </div>

          <span className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#EFF5F1] text-[#23613F] transition group-hover:bg-[#214E35] group-hover:text-white">
            <ChevronRightIcon />
          </span>
        </Link>
      </div>
    </AppLayout>
  );
}

export default SettingsPage;

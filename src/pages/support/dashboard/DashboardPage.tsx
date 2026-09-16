import AppLayout from "../../../components/layout/AppLayout";
import type { CurrentUser } from "../../../types/user";

type DashboardPageProps = { user: CurrentUser; };

function SupportDashboardPage({ user }: DashboardPageProps) {
  return (
    <AppLayout user={user} title="Overview">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[2px] text-[#5D7063]">System overview</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight">Welcome back, {user.name}!</h2>
          <p className="mt-2 text-sm font-medium text-[#53665A]">Monitor webhook activity and delivery health</p>
        </div>

        <div className="flex items-center gap-3 rounded-full border border-[#CEDDD2] bg-white px-4 py-2 shadow-sm">
          <span className="h-2 w-2 rounded-full bg-[#43AD61]" />
          <span className="text-sm font-medium text-[#405348]">Platform operational</span>
        </div>
      </div>

      <section className="mt-8 min-h-[500px] rounded-[18px] border border-[#D8E3DB] bg-white p-8 shadow-[0_8px_30px_rgba(32,78,53,0.05)]">
        <h3 className="text-lg font-semibold">Support dashboard</h3>
        <p className="mt-2 text-sm font-medium text-[#607267]">Dashboard content will be added here.</p>
      </section>
    </AppLayout>
  );
}

export default SupportDashboardPage;

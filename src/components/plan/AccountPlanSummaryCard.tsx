import { formatDate } from "../../lib/dateFormat";
import { formatCount } from "../../lib/numberFormat";
import type { AccountPlan } from "../../types/plan";
import Badge from "../ui/Badge";
import PlanBadge from "./PlanBadge";
import UsageProgress from "./UsageProgress";

type AccountPlanSummaryCardProps = {
  account: AccountPlan;
};

function AccountPlanSummaryCard({ account }: AccountPlanSummaryCardProps) {
  const usage = account.usage;

  return (
    <section className="rounded-[18px] border border-[#D8E3DB] bg-white p-5 shadow-[0_8px_30px_rgba(32,78,53,0.05)] sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold tracking-tight text-[#1F2A24]">Your current plan</h2>
          <p className="mt-1 text-xs font-medium text-[#718078]">
            Applies to Projects you own. Projects you joined use their billing owner's plan.
          </p>
        </div>

        <PlanBadge plan={account.plan} />
      </div>

      {usage ? (
        <>
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <UsageProgress
              label="Owned Projects"
              used={usage.project_count}
              limit={account.project_limit}
              unit={usage.project_count === 1 ? "project" : "projects"}
            />

            <UsageProgress
              label="Deliveries this month"
              used={usage.deliveries_this_period}
              limit={account.monthly_delivery_limit}
              unit="deliveries"
            />
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[#E4EBE6] pt-4">
            <p className="text-xs font-medium text-[#53665A]">
              <span className="font-semibold text-[#1F2A24]">{formatCount(usage.deliveries_remaining)}</span>{" "}
              deliveries remaining this month
            </p>

            <p className="text-xs font-medium text-[#718078]">Resets on {formatDate(usage.period_ends_at)}</p>
          </div>
        </>
      ) : (
        <div className="mt-5 flex flex-wrap items-center gap-3 rounded-xl border border-[#E4EBE6] bg-[#F7FAF8] px-4 py-3">
          <Badge tone="neutral">Usage unavailable</Badge>
          <p className="text-xs font-medium text-[#718078]">
            Usage for your account could not be loaded. Limits update automatically once usage is available.
          </p>
        </div>
      )}
    </section>
  );
}

export default AccountPlanSummaryCard;

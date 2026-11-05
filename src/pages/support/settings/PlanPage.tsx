import { useEffect, useState, type ReactNode } from "react";
import { Link, useOutletContext } from "react-router-dom";
import AppLayout from "../../../components/layout/AppLayout";
import AccountPlanSummaryCard from "../../../components/plan/AccountPlanSummaryCard";
import PlanOptionCard from "../../../components/plan/PlanOptionCard";
import Button from "../../../components/ui/Button";
import ConfirmDialog from "../../../components/ui/ConfirmDialog";
import { useToast } from "../../../components/ui/toastContext";
import { changeAccountPlan, getAccount } from "../../../lib/accountApi";
import { planLabel } from "../../../lib/plan";
import type { AccountPlan, Plan } from "../../../types/plan";
import type { CurrentUser } from "../../../types/user";

type PlanActionProps = {
  plan: Plan;
  currentPlan: Plan;
  onSelect: (plan: Plan) => void;
};

function PlanAction({ plan, currentPlan, onSelect }: PlanActionProps) {
  if (plan === currentPlan) {
    return <p className="text-xs font-medium text-[#8A9990]">Your account is on the {planLabel(plan)} plan.</p>;
  }

  const upgrade = plan === "pro";

  return (
    <Button variant={upgrade ? "primary" : "secondary"} size="md" className="w-full" onClick={() => onSelect(plan)}>
      {upgrade ? "Upgrade to Pro" : "Switch to Free"}
    </Button>
  );
}

function PlanPage() {
  const user = useOutletContext<CurrentUser>();
  const { showToast } = useToast();

  const [account, setAccount] = useState<AccountPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [switchTarget, setSwitchTarget] = useState<Plan | null>(null);
  const [switching, setSwitching] = useState(false);
  const [switchError, setSwitchError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setLoadError("");

      const result = await getAccount();

      if (cancelled) return;

      if (result.ok) {
        setAccount(result.data);
      } else {
        setAccount(null);
        setLoadError(result.error);
      }

      setLoading(false);
    }

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleConfirmSwitch() {
    if (!switchTarget) return;

    setSwitching(true);
    setSwitchError("");

    const result = await changeAccountPlan(switchTarget);

    setSwitching(false);
    setSwitchTarget(null);

    if (!result.ok) {
      setSwitchError(result.error);
      return;
    }

    setAccount(result.data);
    showToast({ type: "success", message: `Your account is now on the ${planLabel(result.data.plan)} plan` });
  }

  const availablePlans = account?.available_plans ?? null;

  let body: ReactNode;

  if (loading) {
    body = <p className="mt-8 text-sm font-medium text-[#607267]">Loading plan and usage...</p>;
  } else if (loadError || !account) {
    body = (
      <p
        role="alert"
        className="mt-8 rounded-[18px] border border-[#F1D5D5] bg-[#FBEEEE] px-6 py-6 text-sm font-medium text-[#B42318]"
      >
        {loadError || "Your plan and usage could not be loaded. Please try again."}
      </p>
    );
  } else {
    body = (
      <div className="mt-6">
        <AccountPlanSummaryCard account={account} />

        {switchError && (
          <p role="alert" className="mt-4 rounded-xl bg-[#FBEEEE] px-4 py-3 text-sm text-[#B42318]">
            {switchError}
          </p>
        )}

        <section className="mt-8">
          <h2 className="text-sm font-semibold tracking-tight text-[#1F2A24]">Compare plans</h2>
          <p className="mt-1 text-xs font-medium text-[#718078]">
            Limits apply immediately when you switch. No payment is required in this environment.
          </p>

          {availablePlans && availablePlans.length > 0 ? (
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {availablePlans.map((option) => (
                <PlanOptionCard
                  key={option.plan}
                  plan={option.plan}
                  projectLimit={option.project_limit}
                  endpointLimit={option.endpoint_limit_per_project}
                  deliveryLimit={option.monthly_delivery_limit}
                  current={account.plan === option.plan}
                  action={
                    <PlanAction
                      plan={option.plan}
                      currentPlan={account.plan}
                      onSelect={(nextPlan) => {
                        setSwitchError("");
                        setSwitchTarget(nextPlan);
                      }}
                    />
                  }
                />
              ))}
            </div>
          ) : (
            <p
              role="status"
              className="mt-4 rounded-xl border border-[#E4EBE6] bg-[#F7FAF8] px-4 py-3 text-sm font-medium text-[#53665A]"
            >
              Plan options are unavailable right now. Refresh the page to try again.
            </p>
          )}
        </section>

        {switchTarget && (
          <ConfirmDialog
            title={switchTarget === "pro" ? "Upgrade to Pro" : "Switch to Free"}
            description={
              switchTarget === "pro"
                ? "Upgrading applies the Pro limits immediately. No payment is required in this environment."
                : "Switching to Free applies the Free limits immediately. Existing Projects, Endpoints, accepted deliveries, retries, and Circuit state stay unchanged; only future Project or Endpoint creation and event ingestion follow the Free limits."
            }
            confirmLabel={switchTarget === "pro" ? "Upgrade to Pro" : "Switch to Free"}
            pendingLabel={switchTarget === "pro" ? "Upgrading..." : "Switching..."}
            confirmVariant={switchTarget === "pro" ? "primary" : "danger"}
            loading={switching}
            onConfirm={handleConfirmSwitch}
            onCancel={() => setSwitchTarget(null)}
          />
        )}
      </div>
    );
  }

  return (
    <AppLayout user={user} title="Plan & usage">
      <Link to="/settings" className="text-sm font-semibold text-[#23613F] transition hover:underline">
        ← Settings
      </Link>

      <header className="mt-6">
        <h1 className="text-3xl font-semibold tracking-tight">Plan & usage</h1>
        <p className="mt-2 max-w-2xl text-sm font-medium text-[#53665A]">
          See your account plan and usage, and switch plans when you need more room. Projects you joined use their
          billing owner's plan.
        </p>
      </header>

      {body}
    </AppLayout>
  );
}

export default PlanPage;

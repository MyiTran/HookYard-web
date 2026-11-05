import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import AppLayout from "../../../components/layout/AppLayout";
import GroupRecovery from "../../../components/replay/GroupRecovery";
import RecoveryChoiceCard from "../../../components/replay/RecoveryChoiceCard";
import SingleDeliveryRecovery from "../../../components/replay/SingleDeliveryRecovery";
import Badge from "../../../components/ui/Badge";
import { getAccount } from "../../../lib/accountApi";
import type { Plan } from "../../../types/plan";
import type { CurrentUser } from "../../../types/user";

type RecoveryChoice = "single" | "group";

function ReplayPage() {
  const user = useOutletContext<CurrentUser>();

  const [choice, setChoice] = useState<RecoveryChoice | null>("single");
  const [openedChoices, setOpenedChoices] = useState<RecoveryChoice[]>(["single"]);
  const [plan, setPlan] = useState<Plan | null>(null);

  function toggleChoice(next: RecoveryChoice) {
    setChoice((current) => (current === next ? null : next));
    setOpenedChoices((current) => (current.includes(next) ? current : [...current, next]));
  }

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const result = await getAccount();

      if (cancelled || !result.ok) return;

      setPlan(result.data.plan);
    }

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  const groupLocked = plan === "free";
  const singleMounted = openedChoices.includes("single");
  const groupMounted = openedChoices.includes("group") && !groupLocked;

  return (
    <AppLayout user={user} title="Recover failed deliveries">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[2px] text-[#5D7063]">Workspace</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Recover failed deliveries</h1>
        <p className="mt-2 max-w-2xl text-sm font-medium text-[#53665A]">
          Resend deliveries that terminally failed. Replay one delivery or recover a filtered group.
        </p>
      </div>

      <div className="mt-6 space-y-4">
        <RecoveryChoiceCard
          panelId="singleRecoveryPanel"
          title="Replay one delivery"
          description="Find one failed delivery and send it again."
          availability="Available on all plans"
          open={choice === "single"}
          mounted={singleMounted}
          onToggle={() => toggleChoice("single")}
        >
          <SingleDeliveryRecovery />
        </RecoveryChoiceCard>

        <RecoveryChoiceCard
          panelId="groupRecoveryPanel"
          title="Recover failed deliveries in bulk"
          description="Preview and replay multiple failed deliveries that match your criteria."
          availability="Available on Pro"
          badge={<Badge tone="purple">Pro</Badge>}
          open={choice === "group" && !groupLocked}
          mounted={groupMounted}
          locked={groupLocked}
          lockedMessage="Bulk recovery is available on Pro. You can still replay one delivery at a time."
          plansTo="/settings/plan"
          onToggle={() => toggleChoice("group")}
        >
          <GroupRecovery />
        </RecoveryChoiceCard>
      </div>
    </AppLayout>
  );
}

export default ReplayPage;

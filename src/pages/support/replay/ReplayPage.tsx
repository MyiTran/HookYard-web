import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import AppLayout from "../../../components/layout/AppLayout";
import GroupRecovery from "../../../components/replay/GroupRecovery";
import RecoveryChoiceCard from "../../../components/replay/RecoveryChoiceCard";
import SingleDeliveryRecovery from "../../../components/replay/SingleDeliveryRecovery";
import Badge from "../../../components/ui/Badge";
import type { CurrentUser } from "../../../types/user";

type RecoveryChoice = "single" | "group";

function ReplayPage() {
  const user = useOutletContext<CurrentUser>();

  const [choice, setChoice] = useState<RecoveryChoice | null>("single");
  const [openedChoices, setOpenedChoices] = useState<RecoveryChoice[]>(["single"]);

  function toggleChoice(next: RecoveryChoice) {
    setChoice((current) => (current === next ? null : next));
    setOpenedChoices((current) => (current.includes(next) ? current : [...current, next]));
  }

  const singleMounted = openedChoices.includes("single");
  const groupMounted = openedChoices.includes("group");

  return (
    <AppLayout user={user} title="Recover deliveries">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[2px] text-[#5D7063]">Workspace</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Recover deliveries</h1>
        <p className="mt-2 max-w-2xl text-sm font-medium text-[#53665A]">Resend failed webhook deliveries.</p>
      </div>

      <div className="mt-6 space-y-4">
        <RecoveryChoiceCard
          panelId="singleRecoveryPanel"
          title="Replay one delivery"
          description="Find a failed delivery and send it again."
          open={choice === "single"}
          mounted={singleMounted}
          onToggle={() => toggleChoice("single")}
        >
          <SingleDeliveryRecovery />
        </RecoveryChoiceCard>

        <RecoveryChoiceCard
          panelId="groupRecoveryPanel"
          title="Bulk replay"
          description="Preview and resend matching failed deliveries."
          badge={<Badge tone="purple">Pro</Badge>}
          open={choice === "group"}
          mounted={groupMounted}
          onToggle={() => toggleChoice("group")}
        >
          <GroupRecovery />
        </RecoveryChoiceCard>
      </div>
    </AppLayout>
  );
}

export default ReplayPage;

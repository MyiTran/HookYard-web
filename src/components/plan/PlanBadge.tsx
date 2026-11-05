import { planLabel } from "../../lib/plan";
import type { Plan } from "../../types/plan";
import Badge from "../ui/Badge";

type PlanBadgeProps = {
  plan: Plan;
};

function PlanBadge({ plan }: PlanBadgeProps) {
  if (plan === "pro") {
    return (
      <Badge tone="green" dot>
        {planLabel(plan)}
      </Badge>
    );
  }

  return <Badge tone="neutral">{planLabel(plan)}</Badge>;
}

export default PlanBadge;

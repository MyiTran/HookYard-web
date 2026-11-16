import Badge from "../ui/Badge";

export const PLAN_LOCK_HELP =
  "This endpoint exceeds the current account plan limit. It remains active and existing deliveries continue normally.";

type EndpointPlanLockBadgeProps = {
  planLocked: boolean;
};

function EndpointPlanLockBadge({ planLocked }: EndpointPlanLockBadgeProps) {
  if (!planLocked) return null;

  return (
    <span title={PLAN_LOCK_HELP} className="inline-flex">
      <Badge tone="amber">Plan locked</Badge>
    </span>
  );
}

export default EndpointPlanLockBadge;

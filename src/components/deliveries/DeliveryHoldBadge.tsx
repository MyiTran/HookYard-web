import type { DeliveryHold } from "../../types/delivery";
import Badge from "../ui/Badge";

type DeliveryHoldBadgeProps = {
  hold?: DeliveryHold | null;
  className?: string;
};

function DeliveryHoldBadge({ hold, className = "" }: DeliveryHoldBadgeProps) {
  if (!hold) return null;

  return (
    <span className={className}>
      <Badge tone="amber" dot>
        Held
      </Badge>
    </span>
  );
}

export default DeliveryHoldBadge;

import type { AttemptStatus, MessageStatus } from "../../types/delivery";
import Badge from "../ui/Badge";

type BadgeTone = "green" | "purple" | "amber" | "red" | "blue" | "neutral";

type DeliveryStatusBadgeProps = {
  status: MessageStatus | AttemptStatus;
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  delivering: "Delivering",
  succeeded: "Succeeded",
  failed: "Failed",
};

const STATUS_TONES: Record<string, BadgeTone> = {
  pending: "neutral",
  delivering: "blue",
  succeeded: "green",
  failed: "red",
};

function DeliveryStatusBadge({ status }: DeliveryStatusBadgeProps) {
  return (
    <Badge tone={STATUS_TONES[status] ?? "neutral"} dot>
      {STATUS_LABELS[status] ?? status}
    </Badge>
  );
}

export default DeliveryStatusBadge;

import type { AttemptStatus, MessageStatus, RealtimeDeliveryStatus } from "../../types/delivery";
import Badge from "../ui/Badge";

type BadgeTone = "green" | "purple" | "amber" | "red" | "blue" | "neutral";

type DeliveryStatusBadgeProps = {
  status: MessageStatus | AttemptStatus | RealtimeDeliveryStatus;
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  delivering: "Delivering",
  processing: "Delivering",
  held: "Held",
  retry_scheduled: "Retry scheduled",
  succeeded: "Succeeded",
  failed: "Failed",
};

const STATUS_TONES: Record<string, BadgeTone> = {
  pending: "neutral",
  delivering: "blue",
  processing: "blue",
  held: "amber",
  retry_scheduled: "amber",
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

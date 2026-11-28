import { deliveryLifecycleLabel } from "../../lib/deliveryStatus";
import type { DeliveryMessageSummary, MessageStatus } from "../../types/delivery";

type DeliveryLifecycleTextProps = {
  message: Pick<
    DeliveryMessageSummary,
    "status" | "realtime_status" | "attempt_count" | "max_attempts" | "next_retry_at" | "retryable" | "replay"
  >;
  className?: string;
};

const TONE_CLASSES: Record<MessageStatus, string> = {
  pending: "text-[#9A6B1F]",
  delivering: "text-[#2563A8]",
  succeeded: "text-[#23613F]",
  failed: "text-[#B42318]",
};

function DeliveryLifecycleText({ message, className = "" }: DeliveryLifecycleTextProps) {
  const label = message.realtime_status === "held"
    ? "Held"
    : message.realtime_status === "retry_scheduled"
      ? "Retry scheduled"
      : deliveryLifecycleLabel(message);

  return (
    <span className={`font-semibold ${TONE_CLASSES[message.status]} ${className}`}>
      {label}
    </span>
  );
}

export default DeliveryLifecycleText;

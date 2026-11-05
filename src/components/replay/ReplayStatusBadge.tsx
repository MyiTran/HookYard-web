import { replayItemStatusLabel } from "../../lib/replayStatus";
import type { ReplayItemStatus } from "../../types/replay";
import Badge from "../ui/Badge";

type BadgeTone = "green" | "purple" | "amber" | "red" | "blue" | "neutral";

type ReplayStatusBadgeProps = {
  status: ReplayItemStatus;
  className?: string;
};

const STATUS_TONES: Record<ReplayItemStatus, BadgeTone> = {
  queued: "neutral",
  held: "amber",
  delivering: "blue",
  succeeded: "green",
  failed: "red",
  skipped: "neutral",
};

function ReplayStatusBadge({ status, className = "" }: ReplayStatusBadgeProps) {
  return (
    <span className={className}>
      <Badge tone={STATUS_TONES[status]} dot>
        {replayItemStatusLabel(status)}
      </Badge>
    </span>
  );
}

export default ReplayStatusBadge;

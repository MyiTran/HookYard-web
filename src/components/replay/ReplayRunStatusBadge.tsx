import { replayRunStatusLabel } from "../../lib/replayStatus";
import type { ReplayRunStatus } from "../../types/replay";
import Badge from "../ui/Badge";

type BadgeTone = "green" | "purple" | "amber" | "red" | "blue" | "neutral";

type ReplayRunStatusBadgeProps = {
  status: ReplayRunStatus;
};

const STATUS_TONES: Record<ReplayRunStatus, BadgeTone> = {
  queued: "neutral",
  running: "blue",
  completed: "green",
};

function ReplayRunStatusBadge({ status }: ReplayRunStatusBadgeProps) {
  return (
    <Badge tone={STATUS_TONES[status]} dot>
      {replayRunStatusLabel(status)}
    </Badge>
  );
}

export default ReplayRunStatusBadge;

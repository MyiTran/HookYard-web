import type { ProjectRealtimeStatus } from "../../hooks/useProjectRealtime";
import Badge from "./Badge";

type LiveStatusBadgeProps = {
  status: ProjectRealtimeStatus;
};

function LiveStatusBadge({ status }: LiveStatusBadgeProps) {
  const connected = status === "connected";

  return (
    <span role="status" aria-live="polite">
      <Badge tone={connected ? "green" : "amber"} dot>
        {connected ? "Live" : "Reconnecting…"}
      </Badge>
    </span>
  );
}

export default LiveStatusBadge;

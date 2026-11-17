import { formatDateTime } from "../../lib/dateFormat";
import { REPLAY_HELD_GUIDANCE, replayRunStateNote } from "../../lib/replayStatus";
import type { ProjectRealtimeStatus } from "../../hooks/useProjectRealtime";
import type { ReplayRun } from "../../types/replay";
import Badge from "../ui/Badge";
import Button from "../ui/Button";
import LiveStatusBadge from "../ui/LiveStatusBadge";
import ReplayRunStatusBadge from "./ReplayRunStatusBadge";
import ReplaySummaryGrid from "./ReplaySummaryGrid";

type ReplayRunPanelProps = {
  run: ReplayRun;
  waitingForRecovery: boolean;
  pollingPaused: boolean;
  refreshing: boolean;
  pollError: string;
  liveStatus?: ProjectRealtimeStatus;
  onRefresh: () => void;
};

function pollingNote(waitingForRecovery: boolean, pollingPaused: boolean, completed: boolean): string | null {
  if (completed) return null;

  if (!waitingForRecovery) return "This panel checks the run every few seconds until it completes.";

  if (pollingPaused) return "Automatic checks are paused. Nothing failed - use Refresh status to check again.";

  return "This panel checks the run every 30 seconds while the endpoint is protected.";
}

function ReplayRunPanel({
  run,
  waitingForRecovery,
  pollingPaused,
  refreshing,
  pollError,
  liveStatus,
  onRefresh,
}: ReplayRunPanelProps) {
  const completed = run.status === "completed";
  const note = pollingNote(waitingForRecovery, pollingPaused, completed);

  return (
    <section className="rounded-[18px] border border-[#D8E3DB] bg-white p-5 shadow-[0_8px_30px_rgba(32,78,53,0.05)]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-sm font-semibold tracking-tight text-[#1F2A24]">Bulk replay run</h2>
            <ReplayRunStatusBadge status={run.status} />
            {liveStatus && <LiveStatusBadge status={liveStatus} />}
            {waitingForRecovery && (
              <Badge tone="amber" dot>
                Waiting for endpoint recovery
              </Badge>
            )}
          </div>

          <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-medium text-[#8A9990]">
            <span className="break-all font-mono text-[11px] text-[#405348]">{run.id}</span>
            <span aria-hidden="true">•</span>
            <span>Started by {run.actor.name}</span>
            <span aria-hidden="true">•</span>
            <span>{formatDateTime(run.created_at)}</span>
          </p>
        </div>

        {waitingForRecovery && (
          <Button variant="secondary" size="sm" onClick={onRefresh} loading={refreshing}>
            {refreshing ? "Checking..." : "Refresh status"}
          </Button>
        )}
      </div>

      <ReplaySummaryGrid summary={run.summary} />

      <p className="mt-4 text-xs font-medium text-[#53665A]">{replayRunStateNote(run)}</p>

      {run.summary.held > 0 && (
        <p className="mt-3 rounded-xl border border-[#E8D5B5] bg-[#FBF7EC] px-4 py-3 text-xs font-semibold text-[#8A5D14]">
          {REPLAY_HELD_GUIDANCE}
        </p>
      )}

      {note && <p className="mt-2 text-xs font-medium text-[#8A9990]">{note}</p>}

      <p className="mt-3 text-xs font-medium text-[#8A9990]">
        Bulk runs report aggregate progress only. Open an individual delivery to inspect its replay outcome and attempt
        history.
      </p>

      {pollError && <p className="mt-3 text-xs font-semibold text-[#B42318]">{pollError}</p>}
    </section>
  );
}

export default ReplayRunPanel;

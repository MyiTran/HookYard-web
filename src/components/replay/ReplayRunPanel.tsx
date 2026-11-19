import { formatDateTime } from "../../lib/dateFormat";
import { REPLAY_HELD_GUIDANCE, replayRunFailureMessage, replayRunStateNote } from "../../lib/replayStatus";
import type { ReplayRun } from "../../types/replay";
import Badge from "../ui/Badge";
import Button from "../ui/Button";
import ReplayRunStatusBadge from "./ReplayRunStatusBadge";
import ReplaySummaryGrid from "./ReplaySummaryGrid";

type ReplayRunPanelProps = {
  run: ReplayRun;
  waitingForRecovery: boolean;
  pollingPaused: boolean;
  refreshing: boolean;
  pollError: string;
  onRefresh: () => void;
};

function pollingNote(waitingForRecovery: boolean, pollingPaused: boolean, terminal: boolean): string | null {
  if (terminal) return null;

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
  onRefresh,
}: ReplayRunPanelProps) {
  const completed = run.status === "completed";
  const failed = run.status === "failed";
  const terminal = completed || failed;
  const failureMessage = failed ? replayRunFailureMessage(run) : null;
  const note = pollingNote(waitingForRecovery, pollingPaused, terminal);

  return (
    <section className="rounded-[18px] border border-[#D8E3DB] bg-white p-5 shadow-[0_8px_30px_rgba(32,78,53,0.05)]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-sm font-semibold tracking-tight text-[#1F2A24]">Bulk replay run</h2>
            <ReplayRunStatusBadge status={run.status} />
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

      {!failed && <ReplaySummaryGrid summary={run.summary} />}

      {failed && failureMessage && (
        <p role="alert" className="mt-4 rounded-xl border border-[#F1D5D5] bg-[#FBEEEE] px-4 py-3 text-xs font-semibold text-[#B42318]">
          {failureMessage}
        </p>
      )}

      {!failed && <p className="mt-4 text-xs font-medium text-[#53665A]">{replayRunStateNote(run)}</p>}

      {!failed && run.summary.held > 0 && (
        <p className="mt-3 rounded-xl border border-[#E8D5B5] bg-[#FBF7EC] px-4 py-3 text-xs font-semibold text-[#8A5D14]">
          {REPLAY_HELD_GUIDANCE}
        </p>
      )}

      {note && <p className="mt-2 text-xs font-medium text-[#8A9990]">{note}</p>}

      {!failed && (
        <p className="mt-3 text-xs font-medium text-[#8A9990]">
          Bulk runs report aggregate progress only. Open an individual delivery to inspect its replay outcome and attempt
          history.
        </p>
      )}

      {pollError && <p className="mt-3 text-xs font-semibold text-[#B42318]">{pollError}</p>}
    </section>
  );
}

export default ReplayRunPanel;

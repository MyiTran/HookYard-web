import { useEffect, useRef, useState } from "react";
import { formatDateTime } from "../../lib/dateFormat";
import { REPLAY_HELD_POLL_INTERVAL_MS, REPLAY_POLL_INTERVAL_MS, replayMessage } from "../../lib/replayApi";
import { readReplayQuotaError, singleReplayQuotaMessage } from "../../lib/replayQuota";
import {
  REPLAY_ENDPOINT_PAUSED_MESSAGE,
  REPLAY_HELD_GUIDANCE,
  replayBlockedMessage,
  replayItemOutcomeLabel,
  replayRequestErrorMessage,
} from "../../lib/replayStatus";
import type { MessageReplay, ReplayItem, ReplayItemStatus, ReplayQuotaError, ReplayRun } from "../../types/replay";
import AlertTriangleIcon from "../icons/AlertTriangleIcon";
import Button from "../ui/Button";
import ReplayStatusBadge from "./ReplayStatusBadge";

type SingleReplayControlProps = {
  messageId: string;
  replay: MessageReplay;
  onReplayed: () => void;
};

type ReplayProgress = {
  status: ReplayItemStatus;
  requestedAt: string | null;
};

const PROGRESS_NOTES: Record<ReplayItemStatus, string> = {
  queued: "The replay is queued and will be delivered shortly.",
  held: REPLAY_HELD_GUIDANCE,
  delivering: "The replay is being delivered now. This panel updates until the attempt finishes.",
  succeeded: "The replay succeeded and this delivery is now complete.",
  failed: "The replay failed. Attempt evidence is kept in the delivery's attempt history.",
  skipped: "The replay was skipped, so nothing was sent.",
};

function isReplayInProgress(status: ReplayItemStatus): boolean {
  return status === "queued" || status === "held" || status === "delivering";
}

function replayProgress(replay: MessageReplay, requestedItem: ReplayItem | null): ReplayProgress | null {
  if (replay.blocked_reason === "endpoint_paused") return null;

  const lastOutcome = replay.last_outcome;

  if (requestedItem && requestedItem.id !== lastOutcome?.id) {
    return { status: requestedItem.status, requestedAt: requestedItem.created_at };
  }

  if (!replay.active) return null;

  if (!lastOutcome) return { status: "queued", requestedAt: null };

  if (!isReplayInProgress(lastOutcome.status)) return null;

  return { status: lastOutcome.status, requestedAt: lastOutcome.created_at };
}

function SingleReplayControl({ messageId, replay, onReplayed }: SingleReplayControlProps) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [quotaError, setQuotaError] = useState<ReplayQuotaError | null>(null);
  const [run, setRun] = useState<ReplayRun | null>(null);

  const requestedItem = run?.items?.[0] ?? null;
  const progress = replayProgress(replay, requestedItem);
  const lastOutcome = replay.last_outcome;
  const blockedMessage = replayBlockedMessage(replay.blocked_reason);
  const alreadySucceeded = replay.blocked_reason === "message_not_failed";
  const endpointPaused = replay.blocked_reason === "endpoint_paused";
  const quotaMessage = quotaError ? singleReplayQuotaMessage(quotaError) : null;

  const onReplayedRef = useRef(onReplayed);

  useEffect(() => {
    onReplayedRef.current = onReplayed;
  }, [onReplayed]);

  const activeReplayStatus = replay.active ? replay.last_outcome?.status ?? "queued" : null;
  const shouldPoll = activeReplayStatus !== null && isReplayInProgress(activeReplayStatus);
  const pollInterval =
    activeReplayStatus === "held" ? REPLAY_HELD_POLL_INTERVAL_MS : REPLAY_POLL_INTERVAL_MS;

  useEffect(() => {
    if (!shouldPoll) return;

    const interval = window.setInterval(() => {
      onReplayedRef.current();
    }, pollInterval);

    return () => window.clearInterval(interval);
  }, [shouldPoll, pollInterval]);

  async function handleReplay() {
    setPending(true);
    setError("");
    setQuotaError(null);

    const result = await replayMessage(messageId);

    setPending(false);

    if (!result.ok) {
      const nextQuotaError = readReplayQuotaError(result);

      if (nextQuotaError) {
        setQuotaError(nextQuotaError);
        return;
      }

      setError(replayRequestErrorMessage(result.error));
      return;
    }

    setRun(result.data);
    onReplayed();
  }

  return (
    <>
      {progress && (
        <div className="mt-4 rounded-xl border border-[#E4EBE6] bg-[#F7FAF8] px-4 py-3">
          <div className="flex flex-wrap items-center justify-between gap-3 sm:flex-nowrap">
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              <h3 className="text-sm font-semibold tracking-tight text-[#1F2A24]">Replay in progress</h3>
              <ReplayStatusBadge status={progress.status} />
            </div>

            <Button variant="secondary" size="sm" className="w-full shrink-0 sm:w-auto" onClick={onReplayed}>
              Refresh status
            </Button>
          </div>

          {progress.requestedAt && (
            <p className="mt-2 text-xs font-medium text-[#53665A]">
              Requested {formatDateTime(progress.requestedAt)}
            </p>
          )}

          <p
            className={`mt-1 text-xs font-medium ${
              progress.status === "held" ? "text-[#8A5D14]" : "text-[#53665A]"
            }`}
          >
            {PROGRESS_NOTES[progress.status]}
          </p>
        </div>
      )}

      {!progress && lastOutcome && (
        <div className="mt-4 rounded-xl border border-[#E4EBE6] bg-[#F7FAF8] px-4 py-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-semibold uppercase tracking-[2px] text-[#8A9990]">Last replay</span>
            <ReplayStatusBadge status={lastOutcome.status} />
            <span className="text-xs font-medium text-[#53665A]">
              Requested {formatDateTime(lastOutcome.created_at)}
            </span>
          </div>

          <p className="mt-2 text-xs font-semibold text-[#405348]">
            {replayItemOutcomeLabel(lastOutcome)}
            {lastOutcome.completed_at ? ` · ${formatDateTime(lastOutcome.completed_at)}` : ""}
          </p>

          {lastOutcome.status === "held" && (
            <p className="mt-1 text-xs font-medium text-[#8A5D14]">{REPLAY_HELD_GUIDANCE}</p>
          )}
        </div>
      )}

      {quotaMessage && (
        <div role="alert" className="mt-3">
          <p className="text-xs font-semibold text-[#B42318]">{quotaMessage.title}</p>

          {quotaMessage.context && (
            <p className="mt-1 text-xs font-medium text-[#8A9990]">{quotaMessage.context}</p>
          )}
        </div>
      )}

      {error && (
        <p
          role="alert"
          className={`mt-3 text-xs font-semibold ${
            error === REPLAY_ENDPOINT_PAUSED_MESSAGE ? "text-[#8A5D14]" : "text-[#B42318]"
          }`}
        >
          {error}
        </p>
      )}

      {!progress && (
        <div className="mt-4 border-t border-[#E4EBE6] pt-4">
          {replay.allowed ? (
            <Button variant="primary" size="md" onClick={handleReplay} loading={pending}>
              {pending ? "Requesting replay..." : "Replay delivery"}
            </Button>
          ) : endpointPaused ? (
            <div className="flex items-start gap-2 rounded-xl border border-[#E8D5B5] bg-[#FBF7EC] px-4 py-3">
              <span aria-hidden="true" className="mt-0.5 shrink-0 text-[#8A5D14]">
                <AlertTriangleIcon className="h-4 w-4" />
              </span>

              <p className="min-w-0 text-xs font-semibold leading-relaxed text-[#8A5D14]">
                {REPLAY_ENDPOINT_PAUSED_MESSAGE}
              </p>
            </div>
          ) : (
            <div>
              <p className={`text-xs font-medium ${alreadySucceeded ? "text-[#23613F]" : "text-[#8A5D14]"}`}>
                {blockedMessage}
              </p>

              {alreadySucceeded && (
                <p className="mt-1 text-xs font-medium text-[#8A9990]">
                  Original attempts stay in the attempt history.
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </>
  );
}

export default SingleReplayControl;

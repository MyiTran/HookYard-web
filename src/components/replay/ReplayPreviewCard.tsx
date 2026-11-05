import { useId } from "react";
import { formatDateTime } from "../../lib/dateFormat";
import { failureCategoryLabel } from "../../lib/deliveryStatus";
import { formatCount } from "../../lib/numberFormat";
import { replayLimitMessage, type ReplayLimit } from "../../lib/replayLimit";
import type { ReplayPreview } from "../../types/replay";
import AlertTriangleIcon from "../icons/AlertTriangleIcon";
import Badge from "../ui/Badge";
import Button from "../ui/Button";

type ReplayPreviewCardProps = {
  preview: ReplayPreview;
  planLocked: boolean;
  starting: boolean;
  limitWarning: ReplayLimit | null;
  onStart: () => void;
};

type CountProps = {
  label: string;
  value: number;
  tone?: "default" | "warning";
};

const COUNT_TONE_CLASSES = {
  default: "border-[#D8E3DB] bg-[#F7FAF8] text-[#1F2A24]",
  warning: "border-[#E0D3BC] bg-[#FBF7EC] text-[#8A5D14]",
};

function Count({ label, value, tone = "default" }: CountProps) {
  return (
    <div className={`rounded-xl border px-4 py-3 ${COUNT_TONE_CLASSES[tone]}`}>
      <p className="text-[10px] font-semibold uppercase tracking-[2px] opacity-70">{label}</p>
      <p className="mt-1 text-xl font-semibold tracking-tight">{formatCount(value)}</p>
    </div>
  );
}

function ReplayPreviewCard({ preview, planLocked, starting, limitWarning, onStart }: ReplayPreviewCardProps) {
  const limitId = useId();
  const reviewBlocked = limitWarning !== null;

  return (
    <section className="rounded-[18px] border border-[#D8E3DB] bg-white p-5 shadow-[0_8px_30px_rgba(32,78,53,0.05)]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold tracking-tight text-[#1F2A24]">Recovery preview</h2>
          <p className="mt-1 text-xs font-medium text-[#8A9990]">
            Preview is read-only. Nothing is sent until you confirm the replay.
          </p>
        </div>

        <Badge tone="neutral">Read-only</Badge>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <Count label="Requested" value={preview.requested_count} />
        <Count label="Eligible" value={preview.eligible_count} />
        <Count label="Blocked" value={preview.blocked_count} tone={preview.blocked_count > 0 ? "warning" : "default"} />
      </div>

      <div className="mt-5">
        <h3 className="text-[10px] font-semibold uppercase tracking-[2px] text-[#8A9990]">
          Sample of eligible deliveries
        </h3>

        {preview.sample.length === 0 ? (
          <p className="mt-2 text-sm font-medium text-[#607267]">
            No terminally failed deliveries match these filters.
          </p>
        ) : (
          <ul className="mt-2 divide-y divide-[#E4EBE6] overflow-hidden rounded-xl border border-[#E4EBE6]">
            {preview.sample.map((candidate) => (
              <li key={candidate.message_id} className="grid gap-1 px-4 py-3 sm:grid-cols-2 sm:items-center">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-[#1F2A24]" title={candidate.event_type}>
                    {candidate.event_type}
                  </p>
                  <p className="mt-0.5 truncate text-xs font-medium text-[#8A9990]" title={candidate.endpoint.name}>
                    {candidate.endpoint.name}
                  </p>
                </div>

                <div className="min-w-0 text-xs font-medium text-[#53665A] sm:text-right">
                  <p>{failureCategoryLabel(candidate.failure_category) ?? "Terminal failure"}</p>
                  <p className="mt-0.5 text-[#8A9990]">
                    Failed {formatDateTime(candidate.terminal_at)} · {candidate.message_id}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {planLocked && (
        <p className="mt-5 rounded-xl border border-[#E8D5B5] bg-[#FBF7EC] px-4 py-3 text-xs font-semibold text-[#8A5D14]">
          Bulk replay requires the Pro plan. Preview stays available, but confirming the replay needs an upgrade.
        </p>
      )}

      {limitWarning && (
        <div
          id={limitId}
          className="mt-5 flex items-start gap-2 rounded-xl border border-[#E8D5B5] bg-[#FBF7EC] px-4 py-3"
        >
          <span aria-hidden="true" className="mt-0.5 shrink-0 text-[#8A5D14]">
            <AlertTriangleIcon className="h-4 w-4" />
          </span>

          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[2px] text-[#8A5D14]">Recovery limit</p>

            <p className="mt-1 text-xs font-medium leading-relaxed text-[#8A5D14]">
              {replayLimitMessage(limitWarning)}
            </p>
          </div>
        </div>
      )}

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[#E4EBE6] pt-4">
        <p className="max-w-md text-xs font-medium text-[#8A9990]">
          The candidate set is frozen when you confirm. Blocked deliveries are never replayed.
        </p>

        <Button
          variant="primary"
          size="md"
          onClick={onStart}
          disabled={reviewBlocked || planLocked || starting}
          aria-describedby={reviewBlocked ? limitId : undefined}
          title={
            reviewBlocked
              ? "Narrow the filters to fit within one recovery run"
              : planLocked
                ? "Bulk replay requires the Pro plan"
                : undefined
          }
        >
          {starting ? "Starting replay..." : "Review and replay"}
        </Button>
      </div>
    </section>
  );
}

export default ReplayPreviewCard;

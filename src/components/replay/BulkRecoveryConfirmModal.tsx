import { useId } from "react";
import { formatCount } from "../../lib/numberFormat";
import type { ReplayPreview } from "../../types/replay";
import AlertTriangleIcon from "../icons/AlertTriangleIcon";
import CloseIcon from "../icons/CloseIcon";
import RefreshIcon from "../icons/RefreshIcon";
import Button from "../ui/Button";
import { useDialogFocusTrap } from "../ui/useDialogFocusTrap";

export type RecoveryScopeItem = {
  label: string;
  value: string;
};

type BulkRecoveryConfirmModalProps = {
  preview: ReplayPreview;
  scope: RecoveryScopeItem[];
  endpointPaused: boolean;
  endpointRecovering: boolean;
  loading: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

type SummaryTone = "green" | "amber" | "neutral";

const SUMMARY_TONE_CLASSES: Record<SummaryTone, string> = {
  green: "border-[#BBDCC6] bg-[#EAF5EE] text-[#173D28]",
  amber: "border-[#E8D5B5] bg-[#FBF7EC] text-[#8A5D14]",
  neutral: "border-[#D8E3DB] bg-[#EFF5F1] text-[#405348]",
};

const SCROLL_CLASS =
  "min-h-0 flex-1 overflow-y-auto px-5 pb-6 pt-5 sm:px-7 [scrollbar-width:thin] [scrollbar-color:#C2D4C7_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#C2D4C7] [&::-webkit-scrollbar-track]:bg-transparent";

const FIELD_LABEL = "text-[10px] font-semibold uppercase tracking-[2px] text-[#8A9990]";

function deliveryWord(count: number): string {
  return count === 1 ? "delivery" : "deliveries";
}

function availabilityCopy(blocked: number): string {
  if (blocked === 0) return "All matching deliveries are currently available for recovery.";
  if (blocked === 1) return "1 matching delivery is unavailable and will not be replayed.";

  return `${formatCount(blocked)} matching deliveries are unavailable and will not be replayed.`;
}

function SummaryBlock({ value, label, tone }: { value: number; label: string; tone: SummaryTone }) {
  return (
    <div className={`rounded-xl border px-4 py-4 ${SUMMARY_TONE_CLASSES[tone]}`}>
      <p className="text-3xl font-semibold leading-none tracking-tight">{formatCount(value)}</p>
      <p className="mt-2 text-xs font-semibold uppercase tracking-[2px] opacity-80">{label}</p>
    </div>
  );
}

function BulkRecoveryConfirmModal({
  preview,
  scope,
  endpointPaused,
  endpointRecovering,
  loading,
  onConfirm,
  onCancel,
}: BulkRecoveryConfirmModalProps) {
  const titleId = useId();
  const statusId = useId();
  const scopeId = useId();
  const hintId = useId();

  const { dialogRef, handleDialogKeyDown } = useDialogFocusTrap({ onClose: onCancel });

  const nothingEligible = preview.eligible_count === 0;
  const confirmBlocked = endpointPaused || nothingEligible;
  const confirmLabel = `Replay ${formatCount(preview.eligible_count)} ${deliveryWord(preview.eligible_count)}`;
  const blockedHint = endpointPaused
    ? "Confirm is unavailable because the selected endpoint is paused."
    : nothingEligible
      ? "Confirm is unavailable because no matching delivery can be replayed right now."
      : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-[#17211B]/55 sm:items-center sm:p-4"
      onMouseDown={onCancel}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={statusId}
        tabIndex={-1}
        onKeyDown={handleDialogKeyDown}
        onMouseDown={(event) => event.stopPropagation()}
        className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-[26px] border border-[#D8E3DB] bg-[#F7FAF8] shadow-[0_28px_80px_rgba(15,30,23,0.35)] sm:rounded-[26px]"
      >
        <div className="shrink-0 bg-[#214E35] px-5 pb-5 pt-5 text-white sm:px-7 sm:pb-6 sm:pt-6">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[2px] text-[#BFD8C6]">Bulk recovery</p>

              <h2 id={titleId} className="mt-1 text-xl font-semibold tracking-tight sm:text-2xl">
                Review recovery
              </h2>

              <p id={statusId} className="mt-1 text-sm font-medium text-[#CFE0D3]">
                Nothing has been sent yet.
              </p>
            </div>

            <button
              type="button"
              aria-label="Close recovery review"
              onClick={onCancel}
              className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-lg text-[#CFE0D3] transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
            >
              <CloseIcon />
            </button>
          </div>
        </div>

        <div className={SCROLL_CLASS}>
          <div className="grid gap-3 sm:grid-cols-2">
            <SummaryBlock value={preview.eligible_count} label="Deliveries to replay" tone="green" />
            <SummaryBlock
              value={preview.blocked_count}
              label="Unavailable"
              tone={preview.blocked_count > 0 ? "amber" : "neutral"}
            />
          </div>

          <p className="mt-3 text-sm font-medium text-[#53665A]">{availabilityCopy(preview.blocked_count)}</p>

          {endpointPaused && (
            <div className="mt-4 flex items-start gap-2 rounded-xl border border-[#F1D5D5] bg-[#FBEEEE] px-4 py-3">
              <span aria-hidden="true" className="mt-0.5 shrink-0 text-[#B42318]">
                <AlertTriangleIcon className="h-4 w-4" />
              </span>

              <p className="min-w-0 text-xs font-semibold leading-relaxed text-[#B42318]">
                This endpoint is paused. Resume it before recovering deliveries.
              </p>
            </div>
          )}

          {endpointRecovering && (
            <div className="mt-4 flex items-start gap-2 rounded-xl border border-[#D8E3DB] bg-[#F1F6F2] px-4 py-3">
              <span aria-hidden="true" className="mt-0.5 shrink-0 text-[#23613F]">
                <RefreshIcon className="h-4 w-4" />
              </span>

              <p className="min-w-0 text-xs font-semibold leading-relaxed text-[#405348]">
                This endpoint is recovering. Confirmed deliveries will wait until its health probe succeeds.
              </p>
            </div>
          )}

          {scope.length > 0 && (
            <section className="mt-5" aria-labelledby={scopeId}>
              <h3 id={scopeId} className={FIELD_LABEL}>
                Recovery scope
              </h3>

              <dl className="mt-2 grid gap-x-4 gap-y-3 rounded-xl border border-[#E4EBE6] bg-white px-4 py-3 sm:grid-cols-2">
                {scope.map((item) => (
                  <div key={item.label} className="min-w-0">
                    <dt className={FIELD_LABEL}>{item.label}</dt>
                    <dd className="mt-0.5 break-words text-sm font-semibold text-[#1F2A24]">{item.value}</dd>
                  </div>
                ))}
              </dl>
            </section>
          )}

          <div className="mt-5 flex items-start gap-2 rounded-xl border border-[#E8D5B5] bg-[#FBF7EC] px-4 py-3">
            <span aria-hidden="true" className="mt-0.5 shrink-0 text-[#8A5D14]">
              <AlertTriangleIcon className="h-4 w-4" />
            </span>

            <div className="min-w-0 text-xs font-medium leading-relaxed text-[#8A5D14]">
              <p className="font-semibold">
                Replay sends real webhook requests and cannot be undone. Availability is checked again when you
                confirm.
              </p>
              <p className="mt-1">
                The matching deliveries are captured at that moment, so anything that has become unavailable is
                left out.
              </p>
            </div>
          </div>
        </div>

        <div className="shrink-0 border-t border-[#E4EBE6] bg-white px-5 py-4 sm:px-7">
          {blockedHint && (
            <p id={hintId} className="mb-2.5 text-xs font-semibold text-[#8A5D14]">
              {blockedHint}
            </p>
          )}

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-end">
            <Button variant="secondary" size="lg" className="w-full sm:w-auto" onClick={onCancel}>
              Cancel
            </Button>

            <Button
              variant="primary"
              size="lg"
              className="w-full sm:w-auto"
              onClick={onConfirm}
              loading={loading}
              disabled={confirmBlocked}
              aria-describedby={blockedHint ? hintId : undefined}
            >
              {loading ? "Starting replay..." : confirmLabel}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BulkRecoveryConfirmModal;

import { useState, type ReactNode } from "react";
import { formatDateTime } from "../../lib/dateFormat";
import { attemptFailureHeadline } from "../../lib/deliveryStatus";
import { formatDuration } from "../../lib/durationFormat";
import type { DeliveryAttempt } from "../../types/delivery";
import ChevronDownIcon from "../icons/ChevronDownIcon";
import Button from "../ui/Button";
import CopyButton from "../ui/CopyButton";
import DeliveryStatusBadge from "./DeliveryStatusBadge";
import HttpStatusBadge from "./HttpStatusBadge";
import PayloadBlock from "./PayloadBlock";

type AttemptCardProps = {
  attempt: DeliveryAttempt;
};

type MetaItemProps = {
  label: string;
  children: ReactNode;
  className?: string;
};

type EvidenceNoteProps = {
  tone?: "muted" | "warning";
  children: ReactNode;
  className?: string;
};

const NOTE_CLASSES = {
  muted: "border-[#C9DACE] bg-[#F7FAF8] text-[#718078]",
  warning: "border-[#E0D3BC] bg-[#FBF7EC] text-[#9A6B1F]",
};

function MetaItem({ label, children, className = "" }: MetaItemProps) {
  return (
    <div className={`min-w-0 ${className}`}>
      <dt className="text-[10px] font-semibold uppercase tracking-[2px] text-[#8A9990]">{label}</dt>
      <dd className="mt-1 text-sm font-semibold text-[#1F2A24]">{children}</dd>
    </div>
  );
}

function EvidenceNote({ tone = "muted", children, className = "" }: EvidenceNoteProps) {
  return (
    <div className={`min-w-0 rounded-xl border border-dashed px-4 py-3 text-xs font-medium ${NOTE_CLASSES[tone]} ${className}`}>
      {children}
    </div>
  );
}

function RetentionNotice({ purgedAt }: { purgedAt: string }) {
  return (
    <div className="rounded-xl border border-[#E8D5B5] bg-[#FBF7EC] px-4 py-3 lg:col-span-2">
      <p className="text-xs font-semibold text-[#8A5D14]">
        Request and response bodies were removed by the retention policy on {formatDateTime(purgedAt)}.
      </p>
      <p className="mt-1 text-xs font-medium text-[#6B5A35]">
        Delivery outcome and evidence metadata are still available. Only the stored bodies were removed.
      </p>
    </div>
  );
}

function AttemptCard({ attempt }: AttemptCardProps) {
  const [showEvidence, setShowEvidence] = useState(false);
  const hasResponse = attempt.response_status !== null;
  const succeeded = attempt.status === "succeeded";
  const bodiesPurgedAt = attempt.bodies_purged_at;

  return (
    <article className="rounded-[16px] border border-[#D8E3DB] bg-white p-5 shadow-[0_8px_30px_rgba(32,78,53,0.04)]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <span
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
              succeeded ? "bg-[#EAF5EE] text-[#23613F]" : "bg-[#FBEEEE] text-[#B42318]"
            }`}
          >
            {attempt.attempt_number}
          </span>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm font-semibold tracking-tight text-[#1F2A24]">Attempt #{attempt.attempt_number}</h3>
              <DeliveryStatusBadge status={attempt.status} />
            </div>

            <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-medium text-[#8A9990]">
              <span>{formatDateTime(attempt.created_at)}</span>
              <span aria-hidden="true">•</span>
              <span>{formatDuration(attempt.duration_ms)}</span>
              <span aria-hidden="true">•</span>
              <span>Secret v{attempt.signing_secret_version}</span>
            </p>
          </div>
        </div>

        <HttpStatusBadge
          status={attempt.response_status}
          errorType={attempt.error_type}
          failureCategory={attempt.failure_category}
        />
      </div>

      {!hasResponse && (
        <div className="mt-4 rounded-xl bg-[#FBF1E4] px-4 py-3">
          <p className="text-sm font-semibold text-[#9A6B1F]">
            {attemptFailureHeadline(attempt.failure_category, attempt.error_type)}
          </p>

          {bodiesPurgedAt && (
            <p className="mt-1 text-xs font-medium text-[#9A6B1F]">
              Stored bodies for this attempt were removed by the retention policy.
            </p>
          )}
        </div>
      )}

      <dl className="mt-4 grid gap-x-6 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
        <MetaItem label="Request ID">
          <span className="flex min-w-0 flex-wrap items-center gap-1">
            <span className="break-all font-mono text-[11px] font-medium text-[#405348]">{attempt.request_id}</span>
            <CopyButton value={attempt.request_id} ariaLabel="Copy request ID" />
          </span>
        </MetaItem>

        <MetaItem label="Method">
          <span className="font-mono text-xs">{attempt.http_method}</span>
        </MetaItem>

        <MetaItem label="Signed at">{formatDateTime(attempt.signed_at)}</MetaItem>

        <MetaItem label="Request URL" className="sm:col-span-2 lg:col-span-3">
          <span className="break-all font-mono text-[11px] font-medium text-[#405348]">{attempt.request_url}</span>
        </MetaItem>
      </dl>

      <Button
        variant="secondary"
        size="sm"
        className="mt-4 w-full sm:w-auto"
        aria-expanded={showEvidence}
        onClick={() => setShowEvidence((visible) => !visible)}
      >
        <ChevronDownIcon className={`h-4 w-4 transition ${showEvidence ? "rotate-180" : ""}`} />
        {showEvidence ? "Hide request & response" : "Show request & response"}
      </Button>

      {showEvidence && (
        <div className="mt-4 grid gap-4 border-t border-[#E4EBE6] pt-4 lg:grid-cols-2">
          {bodiesPurgedAt && <RetentionNotice purgedAt={bodiesPurgedAt} />}

          <PayloadBlock label="Request headers" value={attempt.request_headers} isHeaders />

          {bodiesPurgedAt ? (
            <EvidenceNote>Request body was removed by the retention policy.</EvidenceNote>
          ) : (
            <PayloadBlock label="Request body" value={attempt.request_body} />
          )}

          {hasResponse ? (
            <>
              <PayloadBlock label="Response headers" value={attempt.response_headers} isHeaders />

              {bodiesPurgedAt ? (
                <EvidenceNote>Response body was removed by the retention policy.</EvidenceNote>
              ) : (
                <PayloadBlock label="Response body" value={attempt.response_body} />
              )}
            </>
          ) : (
            <EvidenceNote tone="warning" className="lg:col-span-2">
              No HTTP response was received.
            </EvidenceNote>
          )}
        </div>
      )}
    </article>
  );
}

export default AttemptCard;

import { useState, type ReactNode } from "react";
import { formatDateTime } from "../../lib/dateFormat";
import { formatDuration } from "../../lib/durationFormat";
import type { DeliveryAttempt } from "../../types/delivery";
import ChevronDownIcon from "../icons/ChevronDownIcon";
import Button from "../ui/Button";
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

function MetaItem({ label, children, className = "" }: MetaItemProps) {
  return (
    <div className={`min-w-0 ${className}`}>
      <dt className="text-[10px] font-semibold uppercase tracking-[2px] text-[#8A9990]">{label}</dt>
      <dd className="mt-1 text-sm font-semibold text-[#1F2A24]">{children}</dd>
    </div>
  );
}

function AttemptCard({ attempt }: AttemptCardProps) {
  const [showEvidence, setShowEvidence] = useState(false);

  const hasResponse = attempt.response_status !== null;

  return (
    <article className="rounded-[16px] border border-[#D8E3DB] bg-white p-5 shadow-[0_8px_30px_rgba(32,78,53,0.04)]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2.5">
            <h3 className="text-sm font-semibold tracking-tight text-[#1F2A24]">Attempt #{attempt.attempt_number}</h3>
            <DeliveryStatusBadge status={attempt.status} />
          </div>

          <p className="mt-1 text-xs font-medium text-[#8A9990]">
            Signed {formatDateTime(attempt.signed_at)}
          </p>
        </div>

        <HttpStatusBadge status={attempt.response_status} errorType={attempt.error_type} />
      </div>

      <dl className="mt-4 grid gap-x-6 gap-y-3 sm:grid-cols-2 lg:grid-cols-4">
        <MetaItem label="Duration">{formatDuration(attempt.duration_ms)}</MetaItem>
        <MetaItem label="Request ID">
          <span className="break-all font-mono text-[11px] font-medium text-[#405348]">{attempt.request_id}</span>
        </MetaItem>
        <MetaItem label="Secret version">{attempt.signing_secret_version}</MetaItem>
        <MetaItem label="Method">
          <span className="font-mono text-xs">{attempt.http_method}</span>
        </MetaItem>
        <MetaItem label="Request URL" className="sm:col-span-2 lg:col-span-4">
          <span className="break-all font-mono text-[11px] font-medium text-[#405348]">{attempt.request_url}</span>
        </MetaItem>
      </dl>

      {!hasResponse && (
        <div className="mt-4 rounded-xl bg-[#FBF1E4] px-4 py-3">
          <p className="text-sm font-semibold text-[#9A6B1F]">No HTTP response was received</p>

          {(attempt.error_type || attempt.error_message) && (
            <p className="mt-1 break-words text-xs font-medium text-[#9A6B1F]">
              {[attempt.error_type, attempt.error_message].filter(Boolean).join(" — ")}
            </p>
          )}
        </div>
      )}

      <Button
        variant="secondary"
        size="sm"
        className="mt-4 w-full sm:w-auto"
        onClick={() => setShowEvidence((visible) => !visible)}
      >
        <ChevronDownIcon className={`h-4 w-4 transition ${showEvidence ? "rotate-180" : ""}`} />
        {showEvidence ? "Hide request & response" : "Show request & response"}
      </Button>

      {showEvidence && (
        <div className="mt-4 grid gap-4 border-t border-[#E4EBE6] pt-4 lg:grid-cols-2">
          <PayloadBlock label="Request headers" value={attempt.request_headers} isHeaders />
          <PayloadBlock label="Request body" value={attempt.request_body} />

          {hasResponse ? (
            <>
              <PayloadBlock label="Response headers" value={attempt.response_headers} isHeaders />
              <PayloadBlock label="Response body" value={attempt.response_body} />
            </>
          ) : (
            <p className="rounded-xl border border-dashed border-[#E0D3BC] px-4 py-3 text-xs font-medium text-[#9A6B1F] lg:col-span-2">
              No response headers or body were captured because no HTTP response was received.
            </p>
          )}
        </div>
      )}
    </article>
  );
}

export default AttemptCard;

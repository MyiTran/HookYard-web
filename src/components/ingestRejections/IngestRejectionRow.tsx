import { formatDateTime } from "../../lib/dateFormat";
import { formatBytes, formatCount } from "../../lib/numberFormat";
import type { IngestRejection } from "../../types/ingestRejection";
import IngestRejectionReasonBadge from "./IngestRejectionReasonBadge";

type IngestRejectionRowProps = {
  rejection: IngestRejection;
};

export const INGEST_REJECTION_ROW_GRID_COLS =
  "lg:grid-cols-[minmax(0,11rem)_minmax(0,1.6fr)_minmax(0,1fr)_minmax(0,7rem)_minmax(0,8rem)]";

const MOBILE_LABEL_CLASS = "text-[10px] font-semibold uppercase tracking-[2px] text-[#8A9990] lg:hidden";

function IngestRejectionRow({ rejection }: IngestRejectionRowProps) {
  const keyCount = rejection.payload_keys.length;
  const receivedAt = formatDateTime(rejection.created_at);
  const endpointLabel = rejection.endpoint ? rejection.endpoint.name : "No endpoint matched";

  return (
    <article
      className={`grid gap-x-4 gap-y-2 px-5 py-3.5 transition hover:bg-[#F7FAF8] sm:grid-cols-2 ${INGEST_REJECTION_ROW_GRID_COLS} lg:items-center`}
    >
      <div className="min-w-0 sm:col-span-2 lg:col-span-1">
        <IngestRejectionReasonBadge reason={rejection.reason} />
        <p className="mt-1 truncate font-mono text-[11px] text-[#8A9990]" title={rejection.reason}>
          {rejection.reason}
        </p>
      </div>

      <div className="min-w-0 sm:col-span-2 lg:col-span-1">
        <p className="truncate text-sm font-semibold tracking-tight text-[#1F2A24]" title={rejection.event_type}>
          {rejection.event_type}
        </p>
        <p className="mt-0.5 truncate text-[11px] font-medium text-[#8A9990]" title={rejection.project.name}>
          {rejection.project.name}
        </p>
      </div>

      <div className="min-w-0">
        <p className={MOBILE_LABEL_CLASS}>Endpoint</p>
        <p className="truncate text-sm font-medium text-[#1F2A24]" title={endpointLabel}>
          {endpointLabel}
        </p>
      </div>

      <div className="min-w-0">
        <p className={MOBILE_LABEL_CLASS}>Payload</p>
        <p className="text-xs font-semibold text-[#405348]">
          {formatCount(keyCount)} {keyCount === 1 ? "key" : "keys"}
        </p>
        <p className="mt-0.5 text-[11px] font-medium text-[#8A9990]">{formatBytes(rejection.payload_bytes)}</p>
      </div>

      <div className="min-w-0 sm:col-span-2 lg:col-span-1">
        <p className={MOBILE_LABEL_CLASS}>Rejected</p>
        <p className="truncate text-xs font-medium text-[#405348]" title={receivedAt}>
          {receivedAt}
        </p>
      </div>
    </article>
  );
}

export default IngestRejectionRow;

import { Link } from "react-router-dom";
import { formatDateTime } from "../../lib/dateFormat";
import { formatDuration } from "../../lib/durationFormat";
import type { NavState } from "../../lib/navState";
import type { DeliveryMessageSummary } from "../../types/delivery";
import ChevronRightIcon from "../icons/ChevronRightIcon";
import DeliveryStatusBadge from "./DeliveryStatusBadge";
import HttpStatusBadge from "./HttpStatusBadge";

type DeliveryRowProps = {
  message: DeliveryMessageSummary;
  projectId: string;
  endpointId: string;
  endpointName: string;
  origin: NavState;
  page: number;
};

function DeliveryRow({ message, projectId, endpointId, endpointName, origin, page }: DeliveryRowProps) {
  const endpointPath = `/projects/${projectId}/endpoints/${endpointId}`;
  const backTo = page > 1 ? `${endpointPath}?deliveries_page=${page}` : endpointPath;

  const attemptLabel = `${message.attempt_count} ${message.attempt_count === 1 ? "attempt" : "attempts"}`;

  return (
    <Link
      to={`${endpointPath}/deliveries/${message.id}`}
      state={{
        from: backTo,
        fromLabel: endpointName,
        endpointFrom: origin.from,
        endpointFromLabel: origin.fromLabel,
      }}
      className="group flex items-center gap-4 px-5 py-4 transition hover:bg-[#F7FAF8]"
    >
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
          <DeliveryStatusBadge status={message.status} />
          <span className="min-w-0 truncate text-sm font-semibold tracking-tight text-[#1F2A24]" title={message.event_type}>
            {message.event_type}
          </span>
          <span
            className="hidden min-w-0 truncate font-mono text-xs text-[#8A9990] sm:inline"
            title={message.webhook_id}
          >
            {message.webhook_id}
          </span>
        </div>

        <p className="mt-1 truncate font-mono text-[11px] text-[#8A9990] sm:hidden" title={message.webhook_id}>
          {message.webhook_id}
        </p>

        <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs font-medium text-[#53665A]">
          <span>
            <span className="text-[#8A9990]">Received </span>
            {formatDateTime(message.created_at)}
          </span>

          <span>
            <span className="text-[#8A9990]">Latest attempt </span>
            {message.last_attempt_at ? formatDateTime(message.last_attempt_at) : "—"}
          </span>

          <span className="inline-flex items-center gap-1.5">
            <span className="text-[#8A9990]">Result </span>
            {message.attempt_count === 0 ? (
              <span className="text-[#8A9990]">No attempts yet</span>
            ) : message.status === "delivering" && message.last_response_status === null && !message.last_error_type ? (
              <span className="font-semibold text-[#2563A8]">In progress</span>
            ) : (
              <HttpStatusBadge status={message.last_response_status} errorType={message.last_error_type} />
            )}
          </span>

          <span>
            <span className="text-[#8A9990]">Attempts </span>
            {attemptLabel}
          </span>

          {message.last_duration_ms !== null && (
            <span className="text-[#8A9990]">{formatDuration(message.last_duration_ms)}</span>
          )}
        </div>
      </div>

      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#EFF5F1] text-[#23613F] transition group-hover:bg-[#214E35] group-hover:text-white">
        <ChevronRightIcon />
      </span>
    </Link>
  );
}

export default DeliveryRow;

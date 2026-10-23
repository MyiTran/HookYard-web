import { Link } from "react-router-dom";
import { formatDateTime } from "../../lib/dateFormat";
import { formatAttemptProgress } from "../../lib/deliveryStatus";
import { formatDuration } from "../../lib/durationFormat";
import type { GlobalDeliveryMessageSummary } from "../../types/delivery";
import ChevronRightIcon from "../icons/ChevronRightIcon";
import DeliveryLifecycleText from "./DeliveryLifecycleText";
import DeliveryStatusBadge from "./DeliveryStatusBadge";
import HttpStatusBadge from "./HttpStatusBadge";

type GlobalDeliveryRowProps = {
  message: GlobalDeliveryMessageSummary;
  backTo: string;
};

export const GLOBAL_DELIVERY_ROW_GRID_COLS =
  "lg:grid-cols-[7rem_minmax(0,1.6fr)_minmax(0,1.4fr)_8.5rem_6.5rem_minmax(0,8.5rem)_3rem]";

const MOBILE_LABEL_CLASS = "text-[10px] font-semibold uppercase tracking-[2px] text-[#8A9990] lg:hidden";

function GlobalDeliveryRow({ message, backTo }: GlobalDeliveryRowProps) {
  const inProgress =
    message.status === "delivering" && message.last_response_status === null && !message.last_error_type;
  const receivedAt = formatDateTime(message.created_at);
  const lastAttemptLabel = message.last_attempt_at
    ? `Last attempt ${formatDateTime(message.last_attempt_at)}`
    : "No attempts yet";

  return (
    <Link
      to={`/projects/${message.project.id}/endpoints/${message.endpoint.id}/deliveries/${message.id}`}
      state={{
        from: backTo,
        fromLabel: "Deliveries",
        section: "deliveries",
        endpointFrom: backTo,
        endpointFromLabel: "Deliveries",
      }}
      className={`group grid gap-x-4 gap-y-2 px-5 py-3.5 transition hover:bg-[#F7FAF8] sm:grid-cols-2 ${GLOBAL_DELIVERY_ROW_GRID_COLS} lg:items-center`}
    >
      <div className="flex items-start gap-2 sm:col-span-2 lg:col-span-1 lg:items-center">
        <div className="min-w-0">
          <DeliveryStatusBadge status={message.status} />
          <DeliveryLifecycleText message={message} className="mt-1 block text-[11px] leading-snug" />
        </div>

        <span className="ml-auto whitespace-nowrap text-xs font-medium text-[#718078] lg:hidden">{receivedAt}</span>

        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#EFF5F1] text-[#23613F] lg:hidden">
          <ChevronRightIcon className="h-3.5 w-3.5" />
        </span>
      </div>

      <div className="min-w-0 sm:col-span-2 lg:col-span-1">
        <p className="truncate text-sm font-semibold tracking-tight text-[#1F2A24]" title={message.event_type}>
          {message.event_type}
        </p>
        <p className="mt-0.5 truncate font-mono text-[11px] text-[#8A9990]" title={message.webhook_id}>
          {message.webhook_id}
        </p>
      </div>

      <div className="min-w-0">
        <p className={MOBILE_LABEL_CLASS}>Endpoint</p>
        <p className="truncate text-sm font-medium text-[#1F2A24]" title={message.endpoint.name}>
          {message.endpoint.name}
        </p>
        <p className="mt-0.5 truncate text-[11px] font-medium text-[#8A9990]" title={message.project.name}>
          {message.project.name}
        </p>
      </div>

      <div className="min-w-0">
        <p className={MOBILE_LABEL_CLASS}>Result</p>

        {message.attempt_count === 0 ? null : inProgress ? (
          <span className="text-xs font-semibold text-[#2563A8]">In progress</span>
        ) : (
          <HttpStatusBadge status={message.last_response_status} errorType={message.last_error_type} />
        )}

        {message.last_error_type && (
          <p className="mt-1 truncate text-[11px] font-medium text-[#9A6B1F]" title={message.last_error_type}>
            {message.last_error_type}
          </p>
        )}
      </div>

      <div className="min-w-0">
        <p className={MOBILE_LABEL_CLASS}>Attempts</p>
        <p className="text-xs font-semibold text-[#405348]">
          {message.attempt_count === 0
            ? "—"
            : formatAttemptProgress(message.attempt_count, message.max_attempts)}
        </p>
        {message.last_duration_ms !== null && (
          <p className="mt-0.5 text-[11px] font-medium text-[#8A9990]">{formatDuration(message.last_duration_ms)}</p>
        )}
      </div>

      <div className="hidden min-w-0 overflow-hidden lg:block">
        <p className="truncate text-xs font-medium text-[#405348]" title={receivedAt}>
          {receivedAt}
        </p>
        <p className="mt-0.5 truncate text-[11px] font-medium text-[#8A9990]" title={lastAttemptLabel}>
          {lastAttemptLabel}
        </p>
      </div>

      <div className="hidden min-w-0 justify-end lg:flex">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#EFF5F1] text-[#23613F] transition group-hover:bg-[#214E35] group-hover:text-white">
          <ChevronRightIcon className="h-3.5 w-3.5" />
        </span>
      </div>
    </Link>
  );
}

export default GlobalDeliveryRow;

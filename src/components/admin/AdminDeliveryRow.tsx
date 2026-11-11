import { Link } from "react-router-dom";
import { formatDateTime } from "../../lib/dateFormat";
import { failureCategoryLabel } from "../../lib/deliveryStatus";
import { formatDuration } from "../../lib/durationFormat";
import type { AdminDelivery } from "../../types/admin";
import DeliveryHoldBadge from "../deliveries/DeliveryHoldBadge";
import DeliveryStatusBadge from "../deliveries/DeliveryStatusBadge";
import HttpStatusBadge from "../deliveries/HttpStatusBadge";

type AdminDeliveryRowProps = {
  delivery: AdminDelivery;
};

export const ADMIN_DELIVERY_ROW_GRID_COLS =
  "grid-cols-1 sm:grid-cols-2 lg:grid-cols-[7rem_minmax(0,1.5fr)_minmax(0,1.2fr)_5.5rem_8rem_8rem]";

const MOBILE_LABEL_CLASS = "text-[10px] font-semibold uppercase tracking-[2px] text-[#8A9990] lg:hidden";

function AdminDeliveryRow({ delivery }: AdminDeliveryRowProps) {
  const failure = failureCategoryLabel(delivery.failure_category);

  return (
    <div className={`${ADMIN_DELIVERY_ROW_GRID_COLS} grid gap-x-4 gap-y-2 px-5 py-4`}>
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <DeliveryStatusBadge status={delivery.status} />
          <DeliveryHoldBadge hold={delivery.hold} />
        </div>
      </div>

      <div className="min-w-0">
        <p className={MOBILE_LABEL_CLASS}>Endpoint</p>
        <Link
          to={`/admin/endpoints/${delivery.endpoint.id}`}
          className="truncate text-sm font-semibold tracking-tight text-[#23613F] transition hover:underline"
        >
          {delivery.endpoint.name}
        </Link>
        <p className="mt-0.5 truncate text-xs font-medium text-[#8A9990]">
          <Link
            to={`/admin/projects/${delivery.project.id}`}
            className="transition hover:text-[#23613F] hover:underline"
          >
            {delivery.project.name}
          </Link>
        </p>
      </div>

      <div className="min-w-0">
        <p className={MOBILE_LABEL_CLASS}>Result</p>
        {delivery.attempt_count === 0 ? (
          <p className="text-sm font-medium text-[#8A9990]">—</p>
        ) : (
          <>
            <HttpStatusBadge status={delivery.last_response_status} failureCategory={delivery.failure_category} />
            <p className="mt-0.5 text-[11px] font-medium text-[#8A9990]">
              {formatDuration(delivery.last_duration_ms)}
            </p>
          </>
        )}
      </div>

      <div className="min-w-0">
        <p className={MOBILE_LABEL_CLASS}>Attempts</p>
        <p className="text-sm font-medium text-[#405348]">{delivery.attempt_count}</p>
      </div>

      <div className="min-w-0">
        <p className={MOBILE_LABEL_CLASS}>Failure</p>
        <p className="truncate text-sm font-medium text-[#405348]">{failure ?? "—"}</p>
      </div>

      <div className="min-w-0">
        <p className={MOBILE_LABEL_CLASS}>Received</p>
        <p className="text-sm font-medium text-[#405348]">{formatDateTime(delivery.created_at)}</p>
      </div>
    </div>
  );
}

export default AdminDeliveryRow;

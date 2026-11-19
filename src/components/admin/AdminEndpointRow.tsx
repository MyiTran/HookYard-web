import { Link } from "react-router-dom";
import { formatDateTime } from "../../lib/dateFormat";
import type { AdminEndpoint } from "../../types/admin";
import EndpointCircuitBadge from "../endpoints/EndpointCircuitBadge";
import EndpointStatusBadge from "../endpoints/EndpointStatusBadge";

type AdminEndpointRowProps = {
  endpoint: AdminEndpoint;
};

export const ADMIN_ENDPOINT_ROW_GRID_COLS =
  "grid-cols-1 sm:grid-cols-2 lg:grid-cols-[minmax(0,1.9fr)_minmax(0,1.1fr)_6.5rem_9.5rem_5.5rem_7rem]";

const MOBILE_LABEL_CLASS = "text-[10px] font-semibold uppercase tracking-[2px] text-[#8A9990] lg:hidden";

function AdminEndpointRow({ endpoint }: AdminEndpointRowProps) {
  const archived = Boolean(endpoint.archived_at);

  return (
    <Link
      to={`/admin/endpoints/${endpoint.id}`}
      className={`${ADMIN_ENDPOINT_ROW_GRID_COLS} grid items-center gap-x-4 gap-y-2 px-5 py-4 transition hover:bg-[#F7FAF8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#23613F]/30`}
    >
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold tracking-tight text-[#1F2A24]">{endpoint.name}</p>
        <p className="mt-0.5 truncate text-xs font-medium text-[#8A9990]" title={endpoint.url}>
          {endpoint.url}
        </p>
      </div>

      <div className="min-w-0">
        <p className={MOBILE_LABEL_CLASS}>Project</p>
        <p className="truncate text-sm font-medium text-[#405348]">{endpoint.project.name}</p>
      </div>

      <div className="min-w-0">
        <p className={MOBILE_LABEL_CLASS}>Status</p>
        <EndpointStatusBadge active={endpoint.active} archived={archived} />
      </div>

      <div className="min-w-0">
        <p className={MOBILE_LABEL_CLASS}>Circuit</p>
        <EndpointCircuitBadge circuit={{ state: endpoint.circuit_state }} archived={archived} showEnabled />
      </div>

      <div className="min-w-0">
        <p className={MOBILE_LABEL_CLASS}>Queued</p>
        <p className="text-sm font-medium text-[#405348]">{endpoint.queued_message_count}</p>
      </div>

      <div className="min-w-0">
        <p className={MOBILE_LABEL_CLASS}>Updated</p>
        <p className="text-sm font-medium text-[#405348]">{formatDateTime(endpoint.updated_at)}</p>
      </div>
    </Link>
  );
}

export default AdminEndpointRow;

import { Link } from "react-router-dom";
import ChevronRightIcon from "../icons/ChevronRightIcon";
import { formatDateTime } from "../../lib/dateFormat";
import type { Endpoint } from "../../types/endpoint";
import EndpointStatusBadge from "./EndpointStatusBadge";

type EndpointCardProps = {
  endpoint: Endpoint;
};

export const ENDPOINT_ROW_GRID_COLS =
  "grid-cols-2 lg:grid-cols-[minmax(0,2.3fr)_minmax(0,1.2fr)_0.9fr_1fr_2rem]";

function EndpointCard({ endpoint }: EndpointCardProps) {
  return (
    <Link
      to={`/projects/${endpoint.project.id}/endpoints/${endpoint.id}`}
      className={`${ENDPOINT_ROW_GRID_COLS} group grid cursor-pointer items-center gap-x-4 gap-y-2 px-5 py-4 transition hover:bg-[#F7FAF8] lg:py-3.5`}
    >
      <div className="min-w-0">
        <h3 className="truncate text-sm font-semibold tracking-tight text-[#1F2A24]">{endpoint.name}</h3>
        <p className="mt-0.5 truncate text-xs font-medium text-[#8A9990]">{endpoint.url}</p>
      </div>

      <div className="min-w-0 truncate text-sm font-medium text-[#405348]">
        <span className="mr-1 text-xs font-medium text-[#8A9990] lg:hidden">Project </span>
        {endpoint.project.name}
      </div>

      <div>
        <span className="mr-1 text-xs font-medium text-[#8A9990] lg:hidden">Status </span>
        <EndpointStatusBadge active={endpoint.active} archived={Boolean(endpoint.archived_at)} />
      </div>

      <div className="whitespace-nowrap text-xs font-medium text-[#8A9990]">
        <span className="lg:hidden">Updated </span>
        {formatDateTime(endpoint.updated_at)}
      </div>

      <div className="flex justify-end">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#EFF5F1] text-[#23613F] transition group-hover:bg-[#214E35] group-hover:text-white">
          <ChevronRightIcon />
        </span>
      </div>
    </Link>
  );
}

export default EndpointCard;

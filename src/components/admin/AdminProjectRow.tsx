import { Link } from "react-router-dom";
import { formatDateTime } from "../../lib/dateFormat";
import type { AdminProject } from "../../types/admin";
import PlanBadge from "../plan/PlanBadge";

type AdminProjectRowProps = {
  project: AdminProject;
};

export const ADMIN_PROJECT_ROW_GRID_COLS =
  "grid-cols-1 sm:grid-cols-2 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1.2fr)_6.5rem_8rem]";

const MOBILE_LABEL_CLASS = "text-[10px] font-semibold uppercase tracking-[2px] text-[#8A9990] lg:hidden";

function AdminProjectRow({ project }: AdminProjectRowProps) {
  return (
    <Link
      to={`/admin/projects/${project.id}`}
      className={`${ADMIN_PROJECT_ROW_GRID_COLS} grid items-center gap-x-4 gap-y-2 px-5 py-4 transition hover:bg-[#F7FAF8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#23613F]/30`}
    >
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold tracking-tight text-[#1F2A24]">{project.name}</p>
        <p className="mt-0.5 truncate font-mono text-[11px] text-[#8A9990]">{project.id}</p>
      </div>

      <div className="min-w-0">
        <p className={MOBILE_LABEL_CLASS}>Billing account</p>
        <p className="truncate text-sm font-medium text-[#405348]">{project.account?.email ?? "—"}</p>
      </div>

      <div className="min-w-0">
        <p className={MOBILE_LABEL_CLASS}>Plan</p>
        {project.plan ? <PlanBadge plan={project.plan} /> : <p className="text-sm font-medium text-[#8A9990]">—</p>}
      </div>

      <div className="min-w-0">
        <p className={MOBILE_LABEL_CLASS}>Created</p>
        <p className="text-sm font-medium text-[#405348]">{formatDateTime(project.created_at)}</p>
      </div>
    </Link>
  );
}

export default AdminProjectRow;

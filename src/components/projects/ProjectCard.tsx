import { Link } from "react-router-dom";
import { formatDate } from "../../lib/dateFormat";
import type { Project } from "../../types/project";
import RoleBadge from "./RoleBadge";

type ProjectCardProps = { project: Project };

function ProjectCard({ project }: ProjectCardProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-[18px] border border-[#D8E3DB] bg-white p-5 shadow-[0_8px_24px_rgba(32,78,53,0.05)] transition hover:border-[#B6CEBC]">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-3">
          <h3 className="truncate text-lg font-semibold tracking-tight">{project.name}</h3>
          {project.current_user_role && <RoleBadge role={project.current_user_role} />}
        </div>

        <p className="mt-1 text-sm font-medium text-[#718078]">Created {formatDate(project.created_at)}</p>
      </div>

      <Link
        to={`/projects/${project.id}`}
        className="inline-flex h-11 shrink-0 items-center rounded-xl bg-[#214E35] px-5 text-sm font-semibold text-white transition hover:bg-[#173D28]"
      >
        Open
      </Link>
    </div>
  );
}

export default ProjectCard;

import { Link } from "react-router-dom";
import ChevronRightIcon from "../icons/ChevronRightIcon";
import { formatDateTime } from "../../lib/dateFormat";
import type { Project } from "../../types/project";
import RoleBadge from "./RoleBadge";

type ProjectCardProps = {
  project: Project;
};

type ProjectStatTone = "blue" | "green" | "purple" | "red";

type ProjectStat = {
  label: string;
  tone: ProjectStatTone;
};

const STAT_TONES: Record<ProjectStatTone, string> = {
  blue: "text-[#1D5FA8]",
  green: "text-[#1E5A34]",
  purple: "text-[#5E3E96]",
  red: "text-[#9B2018]",
};

const PROJECT_STATS: ProjectStat[] = [
  { label: "Endpoints", tone: "blue" },
  { label: "Events", tone: "purple" },
  { label: "Success", tone: "green" },
  { label: "Failed", tone: "red" },
];

export const PROJECT_ROW_GRID_COLS =
  "grid-cols-2 lg:grid-cols-[minmax(0,1.7fr)_0.9fr_0.7fr_0.7fr_0.7fr_0.7fr_1fr_2rem]";

function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Link
      to={`/projects/${project.id}`}
      className={`${PROJECT_ROW_GRID_COLS} group grid cursor-pointer items-center gap-x-4 gap-y-2 px-5 py-4 transition hover:bg-[#F7FAF8] lg:py-3.5`}
    >
      <div className="min-w-0">
        <h3 className="truncate text-sm font-semibold tracking-tight text-[#1F2A24]">{project.name}</h3>
      </div>

      <div>
        {project.current_user_role ? (
          <RoleBadge role={project.current_user_role} />
        ) : (
          <span className="text-xs font-medium text-[#AEB9B2]">—</span>
        )}
      </div>

      {PROJECT_STATS.map((stat) => (
        <div key={stat.label} className="flex items-baseline gap-1.5 whitespace-nowrap text-xs">
          <span className={`font-medium lg:hidden ${STAT_TONES[stat.tone]}`}>{stat.label}</span>
          <span className="font-semibold text-[#AEB9B2]">—</span>
        </div>
      ))}

      <div className="whitespace-nowrap text-xs font-medium text-[#8A9990]">
        <span className="lg:hidden">Created </span>
        {formatDateTime(project.created_at)}
      </div>

      <div className="flex justify-end">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#EFF5F1] text-[#23613F] transition group-hover:bg-[#214E35] group-hover:text-white">
          <ChevronRightIcon />
        </span>
      </div>
    </Link>
  );
}

export default ProjectCard;

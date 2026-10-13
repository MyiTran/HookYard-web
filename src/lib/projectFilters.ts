import type { Project, ProjectMembershipRole } from "../types/project";

export type ProjectRoleFilter = "all" | ProjectMembershipRole;

export type ProjectSortOption = "newest" | "oldest" | "name";

export type ProjectFilters = {
  search: string;
  role: ProjectRoleFilter;
  sort: ProjectSortOption;
};

export const DEFAULT_PROJECT_FILTERS: ProjectFilters = {
  search: "",
  role: "all",
  sort: "newest",
};

function compareProjects(a: Project, b: Project, sort: ProjectSortOption): number {
  if (sort === "name") return a.name.localeCompare(b.name);

  const oldestFirst = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();

  return sort === "oldest" ? oldestFirst : -oldestFirst;
}

export function filterAndSortProjects(projects: Project[], filters: ProjectFilters): Project[] {
  const query = filters.search.trim().toLowerCase();

  const visible = projects.filter(
    (project) =>
      project.name.toLowerCase().includes(query) &&
      (filters.role === "all" || project.current_user_role === filters.role),
  );

  return visible.sort((a, b) => compareProjects(a, b, filters.sort));
}

import type { ProjectMembershipRole } from "../../types/project";
import FilterClearButton from "../filters/FilterClearButton";
import FilterSearchInput from "../filters/FilterSearchInput";
import FilterSelect from "../filters/FilterSelect";
import FilterToolbar from "../filters/FilterToolbar";

export type ProjectRoleFilter = "all" | ProjectMembershipRole;

export type ProjectSortOption = "created_desc" | "created_asc" | "name_asc";

export type ProjectFilters = {
  search: string;
  role: ProjectRoleFilter;
  sort: ProjectSortOption;
};

type ProjectFilterBarProps = {
  filters: ProjectFilters;
  onFiltersChange: (filters: ProjectFilters) => void;
  searchDraft: string;
  onSearchDraftChange: (value: string) => void;
  onSearchSubmit: () => void;
  onReset: () => void;
  isFiltered: boolean;
};

const ROLE_OPTIONS: { value: ProjectRoleFilter; label: string }[] = [
  { value: "all", label: "All roles" },
  { value: "owner", label: "Owner" },
  { value: "maintainer", label: "Maintainer" },
];

const SORT_OPTIONS: { value: ProjectSortOption; label: string }[] = [
  { value: "created_desc", label: "Recently created" },
  { value: "created_asc", label: "Oldest created" },
  { value: "name_asc", label: "Name A–Z" },
];

function ProjectFilterBar({
  filters,
  onFiltersChange,
  searchDraft,
  onSearchDraftChange,
  onSearchSubmit,
  onReset,
  isFiltered,
}: ProjectFilterBarProps) {
  return (
    <FilterToolbar onSubmit={onSearchSubmit}>
      <FilterSearchInput
        id="projectSearch"
        value={searchDraft}
        onChange={onSearchDraftChange}
        placeholder="Search projects"
        label="Search projects"
        className="w-full xl:w-auto xl:min-w-[12rem] xl:flex-1"
      />

      <FilterSelect
        id="projectRole"
        value={filters.role}
        onChange={(value) => onFiltersChange({ ...filters, role: value as ProjectRoleFilter })}
        options={ROLE_OPTIONS}
        ariaLabel="Filter by role"
        className="w-full sm:w-44"
      />

      <FilterSelect
        id="projectSort"
        value={filters.sort}
        onChange={(value) => onFiltersChange({ ...filters, sort: value as ProjectSortOption })}
        options={SORT_OPTIONS}
        ariaLabel="Sort projects"
        className="w-full sm:w-44"
      />

      {isFiltered && <FilterClearButton onClick={onReset} className="w-full sm:w-auto" />}
    </FilterToolbar>
  );
}

export default ProjectFilterBar;

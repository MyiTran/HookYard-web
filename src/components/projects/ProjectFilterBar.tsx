import { type SubmitEvent } from "react";
import type { ProjectMembershipRole } from "../../types/project";
import SearchIcon from "../icons/SearchIcon";
import FilterSelect from "../filters/FilterSelect";
import Button from "../ui/Button";

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

const FIELD_LABEL = "mb-2 block text-xs font-semibold uppercase tracking-[2px] text-[#718078]";

function ProjectFilterBar({
  filters,
  onFiltersChange,
  searchDraft,
  onSearchDraftChange,
  onSearchSubmit,
  onReset,
  isFiltered,
}: ProjectFilterBarProps) {
  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    onSearchSubmit();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-[18px] border border-[#D8E3DB] bg-white p-5 shadow-[0_8px_30px_rgba(32,78,53,0.05)]"
    >
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)_minmax(0,1fr)_auto] lg:items-end">
        <div>
          <label htmlFor="projectSearch" className={FIELD_LABEL}>
            Search projects
          </label>

          <div className="relative">
            <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9EADA3]" />

            <input
              id="projectSearch"
              type="search"
              value={searchDraft}
              onChange={(event) => onSearchDraftChange(event.target.value)}
              placeholder="Search by project name"
              className="h-11 w-full rounded-xl border border-[#C9DACE] bg-white pl-11 pr-4 text-sm outline-none transition placeholder:text-[#A4B0A8] focus:border-[#23613F] focus:ring-2 focus:ring-[#23613F]/10"
            />
          </div>
        </div>

        <div>
          <label htmlFor="projectRole" className={FIELD_LABEL}>
            Role
          </label>

          <FilterSelect
            id="projectRole"
            value={filters.role}
            onChange={(value) => onFiltersChange({ ...filters, role: value as ProjectRoleFilter })}
            options={ROLE_OPTIONS}
            ariaLabel="Filter by role"
          />
        </div>

        <div>
          <label htmlFor="projectSort" className={FIELD_LABEL}>
            Sort by
          </label>

          <FilterSelect
            id="projectSort"
            value={filters.sort}
            onChange={(value) => onFiltersChange({ ...filters, sort: value as ProjectSortOption })}
            options={SORT_OPTIONS}
            ariaLabel="Sort projects"
          />
        </div>

        <div className="flex gap-2">
          <Button type="submit" variant="primary" size="lg" className="flex-1 lg:flex-none">
            Search
          </Button>

          {isFiltered && (
            <Button type="button" variant="secondary" size="lg" onClick={onReset}>
              Reset
            </Button>
          )}
        </div>
      </div>
    </form>
  );
}

export default ProjectFilterBar;

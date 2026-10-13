import { type SubmitEvent } from "react";
import {
  DEFAULT_PROJECT_FILTERS,
  type ProjectFilters,
  type ProjectRoleFilter,
  type ProjectSortOption,
} from "../../lib/projectFilters";
import FilterSelect from "../filters/FilterSelect";
import Button from "../ui/Button";

type ProjectFilterBarProps = {
  filters: ProjectFilters;
  onFiltersChange: (filters: ProjectFilters) => void;
  searchDraft: string;
  onSearchDraftChange: (value: string) => void;
  onSearchSubmit: () => void;
  onReset: () => void;
};

const ROLE_OPTIONS: { value: ProjectRoleFilter; label: string }[] = [
  { value: "all", label: "All roles" },
  { value: "owner", label: "Owner" },
  { value: "maintainer", label: "Maintainer" },
];

const SORT_OPTIONS: { value: ProjectSortOption; label: string }[] = [
  { value: "newest", label: "Recently created" },
  { value: "oldest", label: "Oldest created" },
  { value: "name", label: "Name A–Z" },
];

const FIELD_LABEL = "mb-2 block text-xs font-semibold uppercase tracking-[2px] text-[#718078]";

function ProjectFilterBar({
  filters,
  onFiltersChange,
  searchDraft,
  onSearchDraftChange,
  onSearchSubmit,
  onReset,
}: ProjectFilterBarProps) {
  const isFiltered =
    filters.search !== DEFAULT_PROJECT_FILTERS.search ||
    filters.role !== DEFAULT_PROJECT_FILTERS.role ||
    filters.sort !== DEFAULT_PROJECT_FILTERS.sort;

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
            <svg
              className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9EADA3]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-4-4" />
            </svg>

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

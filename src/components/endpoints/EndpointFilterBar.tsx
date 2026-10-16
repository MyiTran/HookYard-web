import { type SubmitEvent } from "react";
import type { EndpointOrder } from "../../lib/endpointApi";
import type { Project } from "../../types/project";
import SearchIcon from "../icons/SearchIcon";
import FilterSelect from "../filters/FilterSelect";
import Button from "../ui/Button";

export type EndpointStatusFilter = "all" | "active" | "inactive" | "archived";

export type EndpointFilters = {
  search: string;
  projectId: string;
  status: EndpointStatusFilter;
  sort: EndpointOrder;
};

type EndpointFilterBarProps = {
  filters: EndpointFilters;
  onFiltersChange: (filters: EndpointFilters) => void;
  projects: Project[];
  searchDraft: string;
  onSearchDraftChange: (value: string) => void;
  onSearchSubmit: () => void;
  onReset: () => void;
  isFiltered: boolean;
};

const STATUS_OPTIONS: { value: EndpointStatusFilter; label: string }[] = [
  { value: "all", label: "All current" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "archived", label: "Archived" },
];

const SORT_OPTIONS: { value: EndpointOrder; label: string }[] = [
  { value: "created_desc", label: "Recently created" },
  { value: "created_asc", label: "Oldest created" },
  { value: "name_asc", label: "Name A–Z" },
];

const FIELD_LABEL = "mb-2 block text-xs font-semibold uppercase tracking-[2px] text-[#718078]";

function EndpointFilterBar({
  filters,
  onFiltersChange,
  projects,
  searchDraft,
  onSearchDraftChange,
  onSearchSubmit,
  onReset,
  isFiltered,
}: EndpointFilterBarProps) {
  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    onSearchSubmit();
  }

  const projectOptions = [
    { value: "", label: "All projects" },
    ...projects.map((project) => ({ value: project.id, label: project.name })),
  ];

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-[18px] border border-[#D8E3DB] bg-white p-5 shadow-[0_8px_30px_rgba(32,78,53,0.05)]"
    >
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_auto] lg:items-end">
        <div>
          <label htmlFor="endpointSearch" className={FIELD_LABEL}>
            Search endpoints
          </label>

          <div className="relative">
            <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9EADA3]" />

            <input
              id="endpointSearch"
              type="search"
              value={searchDraft}
              onChange={(event) => onSearchDraftChange(event.target.value)}
              placeholder="Search by name or URL"
              className="h-11 w-full rounded-xl border border-[#C9DACE] bg-white pl-11 pr-4 text-sm outline-none transition placeholder:text-[#A4B0A8] focus:border-[#23613F] focus:ring-2 focus:ring-[#23613F]/10"
            />
          </div>
        </div>

        <div>
          <label htmlFor="endpointProject" className={FIELD_LABEL}>
            Project
          </label>

          <FilterSelect
            id="endpointProject"
            value={filters.projectId}
            onChange={(value) => onFiltersChange({ ...filters, projectId: value })}
            options={projectOptions}
            ariaLabel="Filter by project"
          />
        </div>

        <div>
          <label htmlFor="endpointStatus" className={FIELD_LABEL}>
            Status
          </label>

          <FilterSelect
            id="endpointStatus"
            value={filters.status}
            onChange={(value) => onFiltersChange({ ...filters, status: value as EndpointStatusFilter })}
            options={STATUS_OPTIONS}
            ariaLabel="Filter by status"
          />
        </div>

        <div>
          <label htmlFor="endpointSort" className={FIELD_LABEL}>
            Sort by
          </label>

          <FilterSelect
            id="endpointSort"
            value={filters.sort}
            onChange={(value) => onFiltersChange({ ...filters, sort: value as EndpointOrder })}
            options={SORT_OPTIONS}
            ariaLabel="Sort endpoints"
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

export default EndpointFilterBar;

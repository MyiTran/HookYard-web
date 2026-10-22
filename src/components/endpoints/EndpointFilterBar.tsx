import type { EndpointOrder } from "../../lib/endpointApi";
import type { Project } from "../../types/project";
import FilterClearButton from "../filters/FilterClearButton";
import FilterSearchInput from "../filters/FilterSearchInput";
import FilterSelect from "../filters/FilterSelect";
import FilterToolbar from "../filters/FilterToolbar";

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
  const projectOptions = [
    { value: "", label: "All projects" },
    ...projects.map((project) => ({ value: project.id, label: project.name })),
  ];

  return (
    <FilterToolbar onSubmit={onSearchSubmit}>
      <FilterSearchInput
        id="endpointSearch"
        value={searchDraft}
        onChange={onSearchDraftChange}
        placeholder="Search endpoints"
        label="Search endpoints"
        className="w-full xl:w-auto xl:min-w-[11rem] xl:flex-1"
      />

      <FilterSelect
        id="endpointProject"
        value={filters.projectId}
        onChange={(value) => onFiltersChange({ ...filters, projectId: value })}
        options={projectOptions}
        ariaLabel="Filter by project"
        className="w-full sm:w-44"
      />

      <FilterSelect
        id="endpointStatus"
        value={filters.status}
        onChange={(value) => onFiltersChange({ ...filters, status: value as EndpointStatusFilter })}
        options={STATUS_OPTIONS}
        ariaLabel="Filter by status"
        className="w-full sm:w-40"
      />

      <FilterSelect
        id="endpointSort"
        value={filters.sort}
        onChange={(value) => onFiltersChange({ ...filters, sort: value as EndpointOrder })}
        options={SORT_OPTIONS}
        ariaLabel="Sort endpoints"
        className="w-full sm:w-44"
      />

      {isFiltered && <FilterClearButton onClick={onReset} className="w-full sm:w-auto" />}
    </FilterToolbar>
  );
}

export default EndpointFilterBar;

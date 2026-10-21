import type { SubmitEvent } from "react";
import type { Endpoint } from "../../types/endpoint";
import type { DeliveryFilters, DeliveryOrder, DeliveryStatusFilter } from "../../types/delivery";
import type { Project } from "../../types/project";
import FilterSelect from "../filters/FilterSelect";
import SearchIcon from "../icons/SearchIcon";
import Button from "../ui/Button";

type DeliveryFilterBarProps = {
  filters: DeliveryFilters;
  projects: Project[];
  endpoints: Endpoint[];
  searchDraft: string;
  eventTypeDraft: string;
  fromDraft: string;
  toDraft: string;
  onSearchDraftChange: (value: string) => void;
  onEventTypeDraftChange: (value: string) => void;
  onFromDraftChange: (value: string) => void;
  onToDraftChange: (value: string) => void;
  onFiltersChange: (filters: DeliveryFilters) => void;
  onSubmit: () => void;
  onReset: () => void;
  isFiltered: boolean;
};

const STATUS_OPTIONS: { value: DeliveryStatusFilter; label: string }[] = [
  { value: "all", label: "All statuses" },
  { value: "pending", label: "Pending" },
  { value: "delivering", label: "Delivering" },
  { value: "succeeded", label: "Succeeded" },
  { value: "failed", label: "Failed" },
];

const ORDER_OPTIONS: { value: DeliveryOrder; label: string }[] = [
  { value: "created_desc", label: "Newest first" },
  { value: "created_asc", label: "Oldest first" },
];

const FIELD_LABEL = "mb-2 block text-xs font-semibold uppercase tracking-[2px] text-[#718078]";

const TEXT_INPUT_CLASS =
  "h-11 w-full rounded-xl border border-[#C9DACE] bg-white px-4 text-sm outline-none transition placeholder:text-[#A4B0A8] focus:border-[#23613F] focus:ring-2 focus:ring-[#23613F]/10";

function DeliveryFilterBar({
  filters,
  projects,
  endpoints,
  searchDraft,
  eventTypeDraft,
  fromDraft,
  toDraft,
  onSearchDraftChange,
  onEventTypeDraftChange,
  onFromDraftChange,
  onToDraftChange,
  onFiltersChange,
  onSubmit,
  onReset,
  isFiltered,
}: DeliveryFilterBarProps) {
  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit();
  }

  const projectOptions = [
    { value: "", label: "All projects" },
    ...projects.map((project) => ({ value: project.id, label: project.name })),
  ];

  const endpointOptions = [
    { value: "", label: "All endpoints" },
    ...endpoints.map((endpoint) => ({ value: endpoint.id, label: endpoint.name })),
  ];

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-[18px] border border-[#D8E3DB] bg-white p-5 shadow-[0_8px_30px_rgba(32,78,53,0.05)]"
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="sm:col-span-2">
          <label htmlFor="deliverySearch" className={FIELD_LABEL}>
            Search
          </label>

          <div className="relative">
            <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9EADA3]" />

            <input
              id="deliverySearch"
              type="search"
              value={searchDraft}
              onChange={(event) => onSearchDraftChange(event.target.value)}
              placeholder="Search message, webhook or request ID"
              className={`${TEXT_INPUT_CLASS} pl-11`}
            />
          </div>
        </div>

        <div>
          <label htmlFor="deliveryProject" className={FIELD_LABEL}>
            Project
          </label>

          <FilterSelect
            id="deliveryProject"
            value={filters.projectId}
            onChange={(value) => onFiltersChange({ ...filters, projectId: value })}
            options={projectOptions}
            ariaLabel="Filter by project"
          />
        </div>

        <div>
          <label htmlFor="deliveryEndpoint" className={FIELD_LABEL}>
            Endpoint
          </label>

          <FilterSelect
            id="deliveryEndpoint"
            value={filters.endpointId}
            onChange={(value) => onFiltersChange({ ...filters, endpointId: value })}
            options={endpointOptions}
            ariaLabel="Filter by endpoint"
          />
        </div>

        <div>
          <label htmlFor="deliveryStatus" className={FIELD_LABEL}>
            Status
          </label>

          <FilterSelect
            id="deliveryStatus"
            value={filters.status}
            onChange={(value) => onFiltersChange({ ...filters, status: value as DeliveryStatusFilter })}
            options={STATUS_OPTIONS}
            ariaLabel="Filter by status"
          />
        </div>

        <div>
          <label htmlFor="deliveryEventType" className={FIELD_LABEL}>
            Event type
          </label>

          <input
            id="deliveryEventType"
            type="text"
            value={eventTypeDraft}
            onChange={(event) => onEventTypeDraftChange(event.target.value)}
            placeholder="e.g. order.created"
            className={TEXT_INPUT_CLASS}
          />
        </div>

        <div>
          <label htmlFor="deliveryFrom" className={FIELD_LABEL}>
            From
          </label>

          <input
            id="deliveryFrom"
            type="date"
            value={fromDraft}
            onChange={(event) => onFromDraftChange(event.target.value)}
            className={TEXT_INPUT_CLASS}
          />
        </div>

        <div>
          <label htmlFor="deliveryTo" className={FIELD_LABEL}>
            To
          </label>

          <input
            id="deliveryTo"
            type="date"
            value={toDraft}
            onChange={(event) => onToDraftChange(event.target.value)}
            className={TEXT_INPUT_CLASS}
          />
        </div>

        <div>
          <label htmlFor="deliveryOrder" className={FIELD_LABEL}>
            Order
          </label>

          <FilterSelect
            id="deliveryOrder"
            value={filters.order}
            onChange={(value) => onFiltersChange({ ...filters, order: value as DeliveryOrder })}
            options={ORDER_OPTIONS}
            ariaLabel="Order deliveries"
          />
        </div>

        <div className="flex items-end gap-2 sm:col-span-2 xl:col-span-2">
          <Button type="submit" variant="primary" size="lg" className="flex-1 sm:flex-none">
            Search
          </Button>

          {isFiltered && (
            <Button type="button" variant="secondary" size="lg" onClick={onReset}>
              Reset filters
            </Button>
          )}
        </div>
      </div>
    </form>
  );
}

export default DeliveryFilterBar;

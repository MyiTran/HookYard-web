import { useState } from "react";
import { readDeliverySearchKind } from "../../lib/deliveryApi";
import type {
  DeliveryFilterKey,
  DeliveryFilters,
  DeliveryOrder,
  DeliveryStatusFilter,
} from "../../types/delivery";
import type { Endpoint } from "../../types/endpoint";
import type { Project } from "../../types/project";
import FilterChipList, { type FilterChip } from "../filters/FilterChipList";
import FilterDateRange from "../filters/FilterDateRange";
import FilterSearchInput from "../filters/FilterSearchInput";
import FilterSelect from "../filters/FilterSelect";
import FilterToolbar from "../filters/FilterToolbar";
import ChevronDownIcon from "../icons/ChevronDownIcon";
import SlidersIcon from "../icons/SlidersIcon";
import Button from "../ui/Button";
import Modal from "../ui/Modal";

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
  onRemoveFilter: (key: DeliveryFilterKey) => void;
  isFiltered: boolean;
};

type AdvancedFilterFieldsProps = {
  idPrefix: string;
  layout: "row" | "stacked";
  filters: DeliveryFilters;
  eventTypeDraft: string;
  fromDraft: string;
  toDraft: string;
  onEventTypeDraftChange: (value: string) => void;
  onFromDraftChange: (value: string) => void;
  onToDraftChange: (value: string) => void;
  onFiltersChange: (filters: DeliveryFilters) => void;
};

const DEFAULT_STATUS: DeliveryStatusFilter = "all";
const DEFAULT_ORDER: DeliveryOrder = "created_desc";

const STATUS_OPTIONS: { value: DeliveryStatusFilter; label: string }[] = [
  { value: "all", label: "All statuses" },
  { value: "pending", label: "Pending" },
  { value: "delivering", label: "Delivering" },
  { value: "succeeded", label: "Succeeded" },
  { value: "failed", label: "Failed" },
  { value: "held_by_circuit", label: "Held by circuit" },
];

const ORDER_OPTIONS: { value: DeliveryOrder; label: string }[] = [
  { value: "created_desc", label: "Newest first" },
  { value: "created_asc", label: "Oldest first" },
];

const STATUS_LABELS: Record<DeliveryStatusFilter, string> = {
  all: "All statuses",
  pending: "Pending",
  delivering: "Delivering",
  succeeded: "Succeeded",
  failed: "Failed",
  held_by_circuit: "Held by circuit",
};

const TEXT_INPUT_CLASS =
  "h-11 w-full min-w-0 rounded-xl border border-[#C9DACE] bg-white px-3.5 text-sm outline-none transition placeholder:text-[#A4B0A8] focus:border-[#23613F] focus:ring-2 focus:ring-[#23613F]/10";

const FIELD_LABEL = "mb-1.5 block text-[10px] font-semibold uppercase tracking-[2px] text-[#8A9990]";

function searchChipLabel(search: string): string {
  const kind = readDeliverySearchKind(search);

  if (kind === "message") return `Message ID: ${search}`;
  if (kind === "request") return `Request ID: ${search}`;

  return `Search: ${search}`;
}

function buildChips(
  filters: DeliveryFilters,
  projects: Project[],
  endpoints: Endpoint[],
): FilterChip<DeliveryFilterKey>[] {
  const chips: FilterChip<DeliveryFilterKey>[] = [];

  if (filters.q) chips.push({ key: "q", label: searchChipLabel(filters.q) });
  if (filters.projectId) {
    const project = projects.find((item) => item.id === filters.projectId);
    chips.push({ key: "projectId", label: `Project: ${project?.name ?? filters.projectId}` });
  }
  if (filters.endpointId) {
    const endpoint = endpoints.find((item) => item.id === filters.endpointId);
    chips.push({ key: "endpointId", label: `Endpoint: ${endpoint?.name ?? filters.endpointId}` });
  }
  if (filters.status !== DEFAULT_STATUS) {
    chips.push({ key: "status", label: `Status: ${STATUS_LABELS[filters.status]}` });
  }
  if (filters.eventType) chips.push({ key: "eventType", label: `Event: ${filters.eventType}` });
  if (filters.from) chips.push({ key: "from", label: `From ${filters.from} UTC` });
  if (filters.to) chips.push({ key: "to", label: `To ${filters.to} UTC` });
  if (filters.order !== DEFAULT_ORDER) chips.push({ key: "order", label: "Oldest first" });

  return chips;
}

function AdvancedFilterFields({
  idPrefix,
  layout,
  filters,
  eventTypeDraft,
  fromDraft,
  toDraft,
  onEventTypeDraftChange,
  onFromDraftChange,
  onToDraftChange,
  onFiltersChange,
}: AdvancedFilterFieldsProps) {
  const isRow = layout === "row";
  const labelClass = isRow ? "sr-only" : FIELD_LABEL;

  return (
    <div className={isRow ? "flex flex-wrap items-center gap-2" : "space-y-4"}>
      <div className={isRow ? "w-full min-w-0 sm:w-auto sm:min-w-[12rem] sm:flex-1" : ""}>
        <label htmlFor={`${idPrefix}EventType`} className={labelClass}>
          Event type
        </label>

        <input
          id={`${idPrefix}EventType`}
          type="text"
          value={eventTypeDraft}
          onChange={(event) => onEventTypeDraftChange(event.target.value)}
          placeholder="Event type, e.g. order.created"
          className={TEXT_INPUT_CLASS}
        />
      </div>

      <FilterDateRange
        idPrefix={`${idPrefix}Range`}
        layout={layout}
        from={fromDraft}
        to={toDraft}
        onFromChange={onFromDraftChange}
        onToChange={onToDraftChange}
      />

      <div className={isRow ? "w-full sm:w-44" : ""}>
        <label htmlFor={`${idPrefix}Order`} className={labelClass}>
          Order
        </label>

        <FilterSelect
          id={`${idPrefix}Order`}
          value={filters.order}
          onChange={(value) => onFiltersChange({ ...filters, order: value as DeliveryOrder })}
          options={ORDER_OPTIONS}
          ariaLabel="Order deliveries"
          className="w-full"
        />
      </div>

      {isRow && (
        <Button type="submit" variant="secondary" size="md" className="w-full sm:ml-auto sm:w-auto">
          Apply filters
        </Button>
      )}
    </div>
  );
}

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
  onRemoveFilter,
  isFiltered,
}: DeliveryFilterBarProps) {
  const [showMore, setShowMore] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const projectOptions = [
    { value: "", label: "All projects" },
    ...projects.map((project) => ({ value: project.id, label: project.name })),
  ];

  const endpointOptions = [
    { value: "", label: "All endpoints" },
    ...endpoints.map((endpoint) => ({ value: endpoint.id, label: endpoint.name })),
  ];

  const chips = buildChips(filters, projects, endpoints);
  const advancedCount =
    (filters.eventType ? 1 : 0) +
    (filters.from ? 1 : 0) +
    (filters.to ? 1 : 0) +
    (filters.order !== DEFAULT_ORDER ? 1 : 0);

  function handleMobileApply() {
    onSubmit();
    setShowMobileFilters(false);
  }

  function handleMobileReset() {
    onReset();
    setShowMobileFilters(false);
  }

  const hasFooter = showMore || chips.length > 0;

  return (
    <>
      <FilterToolbar
        onSubmit={onSubmit}
        footer={
          hasFooter ? (
            <div className="space-y-3">
              {showMore && (
                <div id="deliveryAdvancedFilters" className="hidden xl:block">
                  <AdvancedFilterFields
                    idPrefix="delivery"
                    layout="row"
                    filters={filters}
                    eventTypeDraft={eventTypeDraft}
                    fromDraft={fromDraft}
                    toDraft={toDraft}
                    onEventTypeDraftChange={onEventTypeDraftChange}
                    onFromDraftChange={onFromDraftChange}
                    onToDraftChange={onToDraftChange}
                    onFiltersChange={onFiltersChange}
                  />
                </div>
              )}

              <FilterChipList chips={chips} onRemove={onRemoveFilter} onClear={onReset} />
            </div>
          ) : undefined
        }
      >
        <FilterSearchInput
          id="deliverySearch"
          value={searchDraft}
          onChange={onSearchDraftChange}
          placeholder="Search Message ID or Request ID"
          label="Search by message ID or request ID"
          className="w-full xl:w-auto xl:min-w-[13rem] xl:flex-1"
        />

        <div className="hidden items-center gap-2 xl:flex">
          <FilterSelect
            value={filters.projectId}
            onChange={(value) => onFiltersChange({ ...filters, projectId: value })}
            options={projectOptions}
            ariaLabel="Filter by project"
            className="w-36"
          />

          <FilterSelect
            value={filters.endpointId}
            onChange={(value) => onFiltersChange({ ...filters, endpointId: value })}
            options={endpointOptions}
            ariaLabel="Filter by endpoint"
            className="w-40"
          />

          <FilterSelect
            value={filters.status}
            onChange={(value) =>
              onFiltersChange({ ...filters, status: value as DeliveryStatusFilter })
            }
            options={STATUS_OPTIONS}
            ariaLabel="Filter by status or delivery state"
            className="w-40"
          />

          <Button
            variant="secondary"
            size="lg"
            className={`shrink-0 ${showMore ? "bg-[#EFF5F1]" : ""}`}
            onClick={() => setShowMore((visible) => !visible)}
            aria-expanded={showMore}
            aria-controls="deliveryAdvancedFilters"
          >
            <SlidersIcon className="h-4 w-4" />
            More filters
            {advancedCount > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#214E35] px-1 text-[10px] font-bold text-white">
                {advancedCount}
              </span>
            )}
            <ChevronDownIcon
              className={`h-3.5 w-3.5 transition-transform ${showMore ? "rotate-180" : ""}`}
            />
          </Button>
        </div>

        <div className="flex w-full items-center gap-2 xl:hidden">
          <Button
            variant="secondary"
            size="lg"
            className="flex-1"
            onClick={() => setShowMobileFilters(true)}
          >
            <SlidersIcon className="h-4 w-4" />
            Filters
            {advancedCount > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#214E35] px-1 text-[10px] font-bold text-white">
                {advancedCount}
              </span>
            )}
          </Button>
        </div>
      </FilterToolbar>

      {showMobileFilters && (
        <Modal
          title="Filter deliveries"
          onClose={() => setShowMobileFilters(false)}
          footer={
            <div className="flex items-center justify-between gap-3">
              <Button variant="ghost" size="md" onClick={handleMobileReset} disabled={!isFiltered}>
                Clear all
              </Button>

              <Button variant="primary" size="md" onClick={handleMobileApply}>
                Apply filters
              </Button>
            </div>
          }
        >
          <div className="space-y-4">
            <div>
              <label htmlFor="mobileDeliveryProject" className={FIELD_LABEL}>
                Project
              </label>

              <FilterSelect
                id="mobileDeliveryProject"
                value={filters.projectId}
                onChange={(value) => onFiltersChange({ ...filters, projectId: value })}
                options={projectOptions}
                ariaLabel="Filter by project"
                className="w-full"
              />
            </div>

            <div>
              <label htmlFor="mobileDeliveryEndpoint" className={FIELD_LABEL}>
                Endpoint
              </label>

              <FilterSelect
                id="mobileDeliveryEndpoint"
                value={filters.endpointId}
                onChange={(value) => onFiltersChange({ ...filters, endpointId: value })}
                options={endpointOptions}
                ariaLabel="Filter by endpoint"
                className="w-full"
              />
            </div>

            <div>
              <label htmlFor="mobileDeliveryStatus" className={FIELD_LABEL}>
                Status or delivery state
              </label>

              <FilterSelect
                id="mobileDeliveryStatus"
                value={filters.status}
                onChange={(value) =>
                  onFiltersChange({ ...filters, status: value as DeliveryStatusFilter })
                }
                options={STATUS_OPTIONS}
                ariaLabel="Filter by status or delivery state"
                className="w-full"
              />
            </div>

            <AdvancedFilterFields
              idPrefix="mobileDelivery"
              layout="stacked"
              filters={filters}
              eventTypeDraft={eventTypeDraft}
              fromDraft={fromDraft}
              toDraft={toDraft}
              onEventTypeDraftChange={onEventTypeDraftChange}
              onFromDraftChange={onFromDraftChange}
              onToDraftChange={onToDraftChange}
              onFiltersChange={onFiltersChange}
            />
          </div>
        </Modal>
      )}
    </>
  );
}

export default DeliveryFilterBar;

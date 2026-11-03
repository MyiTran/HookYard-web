import { useState } from "react";
import type { DeliveryOrder } from "../../types/delivery";
import type {
  IngestRejectionFilterKey,
  IngestRejectionFilters,
  IngestRejectionReasonFilter,
} from "../../types/ingestRejection";
import type { Project } from "../../types/project";
import FilterChipList, { type FilterChip } from "../filters/FilterChipList";
import FilterDateRange from "../filters/FilterDateRange";
import FilterSelect from "../filters/FilterSelect";
import FilterToolbar from "../filters/FilterToolbar";
import SlidersIcon from "../icons/SlidersIcon";
import Button from "../ui/Button";
import Modal from "../ui/Modal";

type IngestRejectionFilterBarProps = {
  filters: IngestRejectionFilters;
  projects: Project[];
  eventTypeDraft: string;
  fromDraft: string;
  toDraft: string;
  onEventTypeDraftChange: (value: string) => void;
  onFromDraftChange: (value: string) => void;
  onToDraftChange: (value: string) => void;
  onFiltersChange: (filters: IngestRejectionFilters) => void;
  onSubmit: () => void;
  onReset: () => void;
  onRemoveFilter: (key: IngestRejectionFilterKey) => void;
  isFiltered: boolean;
};

const DEFAULT_ORDER: DeliveryOrder = "created_desc";

const REASON_OPTIONS: { value: IngestRejectionReasonFilter; label: string }[] = [
  { value: "all", label: "All reasons" },
  { value: "queue_capacity_exceeded", label: "Queue capacity exceeded" },
  { value: "monthly_delivery_limit_exceeded", label: "Monthly delivery limit" },
];

const ORDER_OPTIONS: { value: DeliveryOrder; label: string }[] = [
  { value: "created_desc", label: "Newest first" },
  { value: "created_asc", label: "Oldest first" },
];

const FIELD_LABEL = "mb-1.5 block text-[10px] font-semibold uppercase tracking-[2px] text-[#8A9990]";

const TEXT_INPUT_CLASS =
  "h-11 w-full min-w-0 rounded-xl border border-[#C9DACE] bg-white px-3.5 text-sm outline-none transition placeholder:text-[#A4B0A8] focus:border-[#23613F] focus:ring-2 focus:ring-[#23613F]/10";

function buildChips(
  filters: IngestRejectionFilters,
  projects: Project[],
): FilterChip<IngestRejectionFilterKey>[] {
  const chips: FilterChip<IngestRejectionFilterKey>[] = [];

  if (filters.projectId) {
    const project = projects.find((item) => item.id === filters.projectId);
    chips.push({ key: "projectId", label: `Project: ${project?.name ?? filters.projectId}` });
  }
  if (filters.reason !== "all") {
    const label = REASON_OPTIONS.find((option) => option.value === filters.reason)?.label ?? filters.reason;
    chips.push({ key: "reason", label: `Reason: ${label}` });
  }
  if (filters.eventType) chips.push({ key: "eventType", label: `Event: ${filters.eventType}` });
  if (filters.from) chips.push({ key: "from", label: `From ${filters.from} UTC` });
  if (filters.to) chips.push({ key: "to", label: `To ${filters.to} UTC` });
  if (filters.order !== DEFAULT_ORDER) chips.push({ key: "order", label: "Oldest first" });

  return chips;
}

function IngestRejectionFilterBar({
  filters,
  projects,
  eventTypeDraft,
  fromDraft,
  toDraft,
  onEventTypeDraftChange,
  onFromDraftChange,
  onToDraftChange,
  onFiltersChange,
  onSubmit,
  onReset,
  onRemoveFilter,
  isFiltered,
}: IngestRejectionFilterBarProps) {
  const [showDrawer, setShowDrawer] = useState(false);

  const projectOptions = [
    { value: "", label: "All projects" },
    ...projects.map((project) => ({ value: project.id, label: project.name })),
  ];

  const chips = buildChips(filters, projects);
  const advancedCount =
    (filters.projectId ? 1 : 0) +
    (filters.from ? 1 : 0) +
    (filters.to ? 1 : 0) +
    (filters.order !== DEFAULT_ORDER ? 1 : 0);

  function handleDrawerApply() {
    onSubmit();
    setShowDrawer(false);
  }

  function handleDrawerReset() {
    onReset();
    setShowDrawer(false);
  }

  return (
    <>
      <FilterToolbar
        onSubmit={onSubmit}
        footer={
          chips.length > 0 ? <FilterChipList chips={chips} onRemove={onRemoveFilter} onClear={onReset} /> : undefined
        }
      >
        <div className="w-full min-w-0 xl:w-auto xl:min-w-[12rem] xl:flex-1">
          <label htmlFor="ingestRejectionEventType" className="sr-only">
            Event type
          </label>

          <input
            id="ingestRejectionEventType"
            type="text"
            value={eventTypeDraft}
            onChange={(event) => onEventTypeDraftChange(event.target.value)}
            placeholder="Event type, e.g. order.created"
            className={TEXT_INPUT_CLASS}
          />
        </div>

        <FilterSelect
          value={filters.reason}
          onChange={(value) =>
            onFiltersChange({ ...filters, reason: value as IngestRejectionReasonFilter })
          }
          options={REASON_OPTIONS}
          ariaLabel="Filter by rejection reason"
          className="w-full sm:w-44"
        />

        <div className="hidden items-center gap-2 xl:flex">
          <FilterDateRange
            idPrefix="ingestRejection"
            layout="row"
            from={fromDraft}
            to={toDraft}
            onFromChange={onFromDraftChange}
            onToChange={onToDraftChange}
          />

          <FilterSelect
            value={filters.order}
            onChange={(value) => onFiltersChange({ ...filters, order: value as DeliveryOrder })}
            options={ORDER_OPTIONS}
            ariaLabel="Order ingest rejections"
            className="w-40"
          />

          <Button type="submit" variant="secondary" size="lg" className="shrink-0">
            Apply
          </Button>
        </div>

        <div className="flex w-full items-center gap-2 xl:hidden">
          <Button variant="secondary" size="lg" className="flex-1" onClick={() => setShowDrawer(true)}>
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

      {showDrawer && (
        <Modal
          title="Filter ingest rejections"
          onClose={() => setShowDrawer(false)}
          footer={
            <div className="flex items-center justify-between gap-3">
              <Button variant="ghost" size="md" onClick={handleDrawerReset} disabled={!isFiltered}>
                Clear all
              </Button>

              <Button variant="primary" size="md" onClick={handleDrawerApply}>
                Apply filters
              </Button>
            </div>
          }
        >
          <div className="space-y-4">
            <div>
              <label htmlFor="ingestRejectionProject" className={FIELD_LABEL}>
                Project
              </label>

              <FilterSelect
                id="ingestRejectionProject"
                value={filters.projectId}
                onChange={(value) => onFiltersChange({ ...filters, projectId: value })}
                options={projectOptions}
                ariaLabel="Filter by project"
                className="w-full"
              />
            </div>

            <FilterDateRange
              idPrefix="mobileIngestRejection"
              layout="stacked"
              from={fromDraft}
              to={toDraft}
              onFromChange={onFromDraftChange}
              onToChange={onToDraftChange}
            />

            <div>
              <label htmlFor="ingestRejectionOrder" className={FIELD_LABEL}>
                Order
              </label>

              <FilterSelect
                id="ingestRejectionOrder"
                value={filters.order}
                onChange={(value) => onFiltersChange({ ...filters, order: value as DeliveryOrder })}
                options={ORDER_OPTIONS}
                ariaLabel="Order ingest rejections"
                className="w-full"
              />
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}

export default IngestRejectionFilterBar;

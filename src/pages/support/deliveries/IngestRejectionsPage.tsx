import { useEffect, useState } from "react";
import { useOutletContext, useSearchParams } from "react-router-dom";
import DeliveryLogTabs from "../../../components/deliveries/DeliveryLogTabs";
import IngestRejectionFilterBar from "../../../components/ingestRejections/IngestRejectionFilterBar";
import IngestRejectionRow, {
  INGEST_REJECTION_ROW_GRID_COLS,
} from "../../../components/ingestRejections/IngestRejectionRow";
import ActivityIcon from "../../../components/icons/ActivityIcon";
import AppLayout from "../../../components/layout/AppLayout";
import Button from "../../../components/ui/Button";
import Pagination from "../../../components/ui/Pagination";
import { readDateParam } from "../../../lib/dateRange";
import {
  getIngestRejections,
  INGEST_REJECTIONS_PAGE_SIZE,
  INGEST_REJECTIONS_PAGE_SIZES,
} from "../../../lib/ingestRejectionApi";
import { getProjects } from "../../../lib/projectApi";
import { readPageParam, setSearchParam } from "../../../lib/searchParams";
import type { DeliveryOrder } from "../../../types/delivery";
import type {
  IngestRejection,
  IngestRejectionFilterKey,
  IngestRejectionFilters,
  IngestRejectionReasonFilter,
} from "../../../types/ingestRejection";
import type { PaginationMeta } from "../../../types/pagination";
import type { Project } from "../../../types/project";
import type { CurrentUser } from "../../../types/user";

const DEFAULT_REASON: IngestRejectionReasonFilter = "all";
const DEFAULT_ORDER: DeliveryOrder = "created_desc";

const REASON_VALUES: IngestRejectionReasonFilter[] = [
  "all",
  "queue_capacity_exceeded",
  "monthly_delivery_limit_exceeded",
];

const ORDER_VALUES: DeliveryOrder[] = ["created_desc", "created_asc"];

function readReason(value: string | null): IngestRejectionReasonFilter {
  return REASON_VALUES.includes(value as IngestRejectionReasonFilter)
    ? (value as IngestRejectionReasonFilter)
    : DEFAULT_REASON;
}

function readOrder(value: string | null): DeliveryOrder {
  return ORDER_VALUES.includes(value as DeliveryOrder) ? (value as DeliveryOrder) : DEFAULT_ORDER;
}

function readPageSize(value: string | null): number {
  const parsed = Number(value);

  return INGEST_REJECTIONS_PAGE_SIZES.includes(parsed) ? parsed : INGEST_REJECTIONS_PAGE_SIZE;
}

function readFilters(params: URLSearchParams): IngestRejectionFilters {
  return {
    projectId: params.get("project_id") ?? "",
    reason: readReason(params.get("reason")),
    eventType: params.get("event_type") ?? "",
    from: readDateParam(params.get("from")),
    to: readDateParam(params.get("to")),
    order: readOrder(params.get("order")),
  };
}

function buildFilterParams(filters: IngestRejectionFilters, pageSize: number): URLSearchParams {
  const params = new URLSearchParams();

  setSearchParam(params, "project_id", filters.projectId);
  if (filters.reason !== DEFAULT_REASON) params.set("reason", filters.reason);
  setSearchParam(params, "event_type", filters.eventType);
  setSearchParam(params, "from", filters.from);
  setSearchParam(params, "to", filters.to);
  if (filters.order !== DEFAULT_ORDER) params.set("order", filters.order);
  if (pageSize !== INGEST_REJECTIONS_PAGE_SIZE) params.set("page_size", String(pageSize));

  return params;
}

function IngestRejectionsPage() {
  const user = useOutletContext<CurrentUser>();
  const [searchParams, setSearchParams] = useSearchParams();

  const filters = readFilters(searchParams);
  const page = readPageParam(searchParams.get("page"));
  const pageSize = readPageSize(searchParams.get("page_size"));

  const [rejections, setRejections] = useState<IngestRejection[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadToken, setReloadToken] = useState(0);

  const [projects, setProjects] = useState<Project[]>([]);

  const [eventTypeDraft, setEventTypeDraft] = useState(filters.eventType);
  const [fromDraft, setFromDraft] = useState(filters.from);
  const [toDraft, setToDraft] = useState(filters.to);

  const draftSignature = `${filters.eventType}|${filters.from}|${filters.to}`;
  const [syncedSignature, setSyncedSignature] = useState(draftSignature);

  if (draftSignature !== syncedSignature) {
    setSyncedSignature(draftSignature);
    setEventTypeDraft(filters.eventType);
    setFromDraft(filters.from);
    setToDraft(filters.to);
  }

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const result = await getProjects({ perPage: 100 });

      if (cancelled || !result.ok) return;

      setProjects(result.data.data);
    }

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);

      const result = await getIngestRejections({
        projectId: filters.projectId || undefined,
        reason: filters.reason === "all" ? undefined : filters.reason,
        eventType: filters.eventType || undefined,
        from: filters.from || undefined,
        to: filters.to || undefined,
        order: filters.order,
        page,
        perPage: pageSize,
      });

      if (cancelled) return;

      if (!result.ok) {
        setError(result.error);
        setRejections([]);
        setMeta(null);
        setLoading(false);
        return;
      }

      const lastPage = Math.max(1, result.data.meta.last_page);

      if (page > lastPage) {
        setSearchParams(
          (previous) => {
            const params = new URLSearchParams(previous);

            setSearchParam(params, "page", lastPage > 1 ? String(lastPage) : "");

            return params;
          },
          { replace: true },
        );
        return;
      }

      setError("");
      setMeta(result.data.meta);
      setRejections(result.data.data);
      setLoading(false);
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [
    filters.projectId,
    filters.reason,
    filters.eventType,
    filters.from,
    filters.to,
    filters.order,
    page,
    pageSize,
    reloadToken,
    setSearchParams,
  ]);

  function applyFilters(next: IngestRejectionFilters) {
    setSearchParams(buildFilterParams(next, pageSize));
  }

  function handleRemoveFilter(key: IngestRejectionFilterKey) {
    const next: IngestRejectionFilters = { ...filters };

    switch (key) {
      case "projectId":
        next.projectId = "";
        break;
      case "reason":
        next.reason = DEFAULT_REASON;
        break;
      case "eventType":
        next.eventType = "";
        setEventTypeDraft("");
        break;
      case "from":
        next.from = "";
        setFromDraft("");
        break;
      case "to":
        next.to = "";
        setToDraft("");
        break;
      case "order":
        next.order = DEFAULT_ORDER;
        break;
    }

    applyFilters(next);
  }

  function handleApplyDrafts() {
    applyFilters({
      ...filters,
      eventType: eventTypeDraft.trim(),
      from: fromDraft,
      to: toDraft,
    });
  }

  function handleReset() {
    setEventTypeDraft("");
    setFromDraft("");
    setToDraft("");

    const params = new URLSearchParams();

    if (pageSize !== INGEST_REJECTIONS_PAGE_SIZE) params.set("page_size", String(pageSize));
    setSearchParams(params);
  }

  function handlePageChange(nextPage: number) {
    const params = new URLSearchParams(searchParams);

    setSearchParam(params, "page", nextPage > 1 ? String(nextPage) : "");
    setSearchParams(params);
  }

  function handlePageSizeChange(nextPageSize: number) {
    const params = new URLSearchParams(searchParams);

    if (nextPageSize !== INGEST_REJECTIONS_PAGE_SIZE) params.set("page_size", String(nextPageSize));
    else params.delete("page_size");

    params.delete("page");
    setSearchParams(params);
  }

  const isFiltered =
    filters.projectId !== "" ||
    filters.reason !== DEFAULT_REASON ||
    filters.eventType !== "" ||
    filters.from !== "" ||
    filters.to !== "" ||
    filters.order !== DEFAULT_ORDER;

  return (
    <AppLayout user={user} title="Ingest rejections">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[2px] text-[#5D7063]">Workspace</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Ingest rejections</h1>
          <p className="mt-2 max-w-2xl text-sm font-medium text-[#53665A]">
            Events rejected before delivery Messages were created.
            <span className="mt-1 block text-xs font-medium text-[#8A9990]">
              HookYard stores only the payload key names and size. Payload values are never kept.
            </span>
          </p>
        </div>

        {meta && meta.total_count > 0 && (
          <p className="shrink-0 rounded-full bg-[#EFF5F1] px-3.5 py-1.5 text-xs font-semibold text-[#405348]">
            {meta.total_count} {meta.total_count === 1 ? "rejection" : "rejections"}
          </p>
        )}
      </div>

      <DeliveryLogTabs />

      <div className="mt-4">
        <IngestRejectionFilterBar
          filters={filters}
          projects={projects}
          eventTypeDraft={eventTypeDraft}
          fromDraft={fromDraft}
          toDraft={toDraft}
          onEventTypeDraftChange={setEventTypeDraft}
          onFromDraftChange={setFromDraft}
          onToDraftChange={setToDraft}
          onFiltersChange={applyFilters}
          onSubmit={handleApplyDrafts}
          onReset={handleReset}
          onRemoveFilter={handleRemoveFilter}
          isFiltered={isFiltered}
        />
      </div>

      <section className="mt-6">
        {loading && rejections.length === 0 ? (
          <p role="status" className="text-sm font-medium text-[#607267]">
            Loading ingest rejections...
          </p>
        ) : error ? (
          <div className="rounded-[18px] border border-[#F1D5D5] bg-[#FBEEEE] px-6 py-6">
            <p className="text-sm font-medium text-[#B42318]">{error}</p>

            <Button
              variant="secondary"
              size="sm"
              className="mt-3"
              onClick={() => setReloadToken((token) => token + 1)}
            >
              Try again
            </Button>
          </div>
        ) : rejections.length === 0 ? (
          <div className="rounded-[18px] border border-dashed border-[#C2D4C7] bg-white px-6 py-14 text-center shadow-[0_8px_30px_rgba(32,78,53,0.05)]">
            <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-[#EFF5F1] text-[#5D7063]">
              <ActivityIcon className="h-5 w-5" />
            </span>

            <h2 className="mt-3 text-lg font-semibold tracking-tight">
              {isFiltered ? "No rejections match your filters" : "No rejected events"}
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm font-medium text-[#607267]">
              {isFiltered
                ? "Try a different reason, event type, or UTC date range."
                : "Events appear here when they are rejected before a delivery is created, for example when an endpoint queue is full or the monthly delivery limit is reached."}
            </p>

            {isFiltered && (
              <Button variant="secondary" size="md" className="mt-5" onClick={handleReset}>
                Clear all filters
              </Button>
            )}
          </div>
        ) : (
          <div
            aria-busy={loading}
            className={`overflow-hidden rounded-[18px] border border-[#D8E3DB] bg-white shadow-[0_8px_30px_rgba(32,78,53,0.05)] transition ${
              loading ? "opacity-60" : "opacity-100"
            }`}
          >
            <div
              className={`${INGEST_REJECTION_ROW_GRID_COLS} hidden gap-x-4 border-b border-[#E4EBE6] px-5 py-3 text-[10px] font-semibold uppercase tracking-[2px] text-[#8A9990] lg:grid`}
            >
              <span>Reason</span>
              <span>Event</span>
              <span>Endpoint</span>
              <span>Payload</span>
              <span>Rejected</span>
            </div>

            <div className="divide-y divide-[#E4EBE6]">
              {rejections.map((rejection) => (
                <IngestRejectionRow key={rejection.id} rejection={rejection} />
              ))}
            </div>
          </div>
        )}

        {!loading && !error && meta && meta.total_count > 0 && (
          <div className="mt-4">
            <Pagination
              page={page}
              totalPages={meta.last_page}
              totalCount={meta.total_count}
              pageSize={meta.page_size}
              pageSizeOptions={INGEST_REJECTIONS_PAGE_SIZES}
              onPageSizeChange={handlePageSizeChange}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </section>
    </AppLayout>
  );
}

export default IngestRejectionsPage;

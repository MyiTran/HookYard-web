import { useEffect, useState } from "react";
import { useOutletContext, useSearchParams } from "react-router-dom";
import DeliveryFilterBar from "../../../components/deliveries/DeliveryFilterBar";
import GlobalDeliveryRow, {
  GLOBAL_DELIVERY_ROW_GRID_COLS,
} from "../../../components/deliveries/GlobalDeliveryRow";
import AppLayout from "../../../components/layout/AppLayout";
import ActivityIcon from "../../../components/icons/ActivityIcon";
import Button from "../../../components/ui/Button";
import Pagination from "../../../components/ui/Pagination";
import { DELIVERIES_PAGE_SIZE, DELIVERIES_PAGE_SIZES, getDeliveries } from "../../../lib/deliveryApi";
import { getEndpoints } from "../../../lib/endpointApi";
import { getProjects } from "../../../lib/projectApi";
import type {
  DeliveryFilterKey,
  DeliveryFilters,
  DeliveryOrder,
  DeliveryStatusFilter,
  GlobalDeliveryMessageSummary,
} from "../../../types/delivery";
import type { Endpoint } from "../../../types/endpoint";
import type { PaginationMeta } from "../../../types/pagination";
import type { Project } from "../../../types/project";
import type { CurrentUser } from "../../../types/user";

const DEFAULT_STATUS: DeliveryStatusFilter = "all";
const DEFAULT_ORDER: DeliveryOrder = "created_desc";

const STATUS_VALUES: DeliveryStatusFilter[] = ["all", "pending", "delivering", "succeeded", "failed"];
const ORDER_VALUES: DeliveryOrder[] = ["created_desc", "created_asc"];

function readStatus(value: string | null): DeliveryStatusFilter {
  return STATUS_VALUES.includes(value as DeliveryStatusFilter) ? (value as DeliveryStatusFilter) : DEFAULT_STATUS;
}

function readOrder(value: string | null): DeliveryOrder {
  return ORDER_VALUES.includes(value as DeliveryOrder) ? (value as DeliveryOrder) : DEFAULT_ORDER;
}

function readDate(value: string | null): string {
  return value && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : "";
}

function readPage(value: string | null): number {
  if (!value || !/^\d+$/.test(value)) return 1;

  const parsed = Number(value);

  return parsed > 1 ? parsed : 1;
}

function readPageSize(value: string | null): number {
  const parsed = Number(value);

  return DELIVERIES_PAGE_SIZES.includes(parsed) ? parsed : DELIVERIES_PAGE_SIZE;
}

function setPageParam(params: URLSearchParams, page: number): void {
  if (page > 1) params.set("page", String(page));
  else params.delete("page");
}

function readFilters(params: URLSearchParams): DeliveryFilters {
  const deliveryState = params.get("delivery_state");
  const status: DeliveryStatusFilter =
    deliveryState === "held_by_circuit" ? "held_by_circuit" : readStatus(params.get("status"));

  return {
    q: params.get("q") ?? "",
    projectId: params.get("project_id") ?? "",
    endpointId: params.get("endpoint_id") ?? "",
    status,
    eventType: params.get("event_type") ?? "",
    from: readDate(params.get("from")),
    to: readDate(params.get("to")),
    order: readOrder(params.get("order")),
  };
}

function buildFilterParams(filters: DeliveryFilters, pageSize: number): URLSearchParams {
  const params = new URLSearchParams();

  if (filters.q) params.set("q", filters.q);
  if (filters.projectId) params.set("project_id", filters.projectId);
  if (filters.endpointId) params.set("endpoint_id", filters.endpointId);
  if (filters.status === "held_by_circuit") params.set("delivery_state", filters.status);
  else if (filters.status !== DEFAULT_STATUS) params.set("status", filters.status);
  if (filters.eventType) params.set("event_type", filters.eventType);
  if (filters.from) params.set("from", filters.from);
  if (filters.to) params.set("to", filters.to);
  if (filters.order !== DEFAULT_ORDER) params.set("order", filters.order);
  if (pageSize !== DELIVERIES_PAGE_SIZE) params.set("page_size", String(pageSize));

  return params;
}

function DeliveriesPage() {
  const user = useOutletContext<CurrentUser>();
  const [searchParams, setSearchParams] = useSearchParams();

  const filters = readFilters(searchParams);
  const page = readPage(searchParams.get("page"));
  const pageSize = readPageSize(searchParams.get("page_size"));

  const [deliveries, setDeliveries] = useState<GlobalDeliveryMessageSummary[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadToken, setReloadToken] = useState(0);

  const [projects, setProjects] = useState<Project[]>([]);
  const [endpoints, setEndpoints] = useState<Endpoint[]>([]);

  const [searchDraft, setSearchDraft] = useState(filters.q);
  const [eventTypeDraft, setEventTypeDraft] = useState(filters.eventType);
  const [fromDraft, setFromDraft] = useState(filters.from);
  const [toDraft, setToDraft] = useState(filters.to);

  const draftSignature = `${filters.q}|${filters.eventType}|${filters.from}|${filters.to}`;
  const [syncedSignature, setSyncedSignature] = useState(draftSignature);

  if (draftSignature !== syncedSignature) {
    setSyncedSignature(draftSignature);
    setSearchDraft(filters.q);
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
      const result = await getEndpoints({
        projectId: filters.projectId || undefined,
        order: "name_asc",
        perPage: 100,
      });

      if (cancelled || !result.ok) return;

      setEndpoints(result.data.data);
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [filters.projectId]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);

      const result = await getDeliveries({
        q: filters.q || undefined,
        projectId: filters.projectId || undefined,
        endpointId: filters.endpointId || undefined,
        status: filters.status === "all" || filters.status === "held_by_circuit" ? undefined : filters.status,
        deliveryState: filters.status === "held_by_circuit" ? filters.status : undefined,
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
        setDeliveries([]);
        setMeta(null);
        setLoading(false);
        return;
      }

      const lastPage = Math.max(1, result.data.meta.last_page);

      if (page > lastPage) {
        setSearchParams(
          (previous) => {
            const params = new URLSearchParams(previous);
            setPageParam(params, lastPage);

            return params;
          },
          { replace: true },
        );
        return;
      }

      setError("");
      setMeta(result.data.meta);
      setDeliveries(result.data.data);
      setLoading(false);
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [
    filters.q,
    filters.projectId,
    filters.endpointId,
    filters.status,
    filters.eventType,
    filters.from,
    filters.to,
    filters.order,
    page,
    pageSize,
    reloadToken,
    setSearchParams,
  ]);

  function applyFilters(next: DeliveryFilters) {
    const projectChanged = next.projectId !== filters.projectId;
    const normalized = projectChanged ? { ...next, endpointId: "" } : next;

    setSearchParams(buildFilterParams(normalized, pageSize));
  }

  function handleRemoveFilter(key: DeliveryFilterKey) {
    const next: DeliveryFilters = { ...filters };

    switch (key) {
      case "q":
        next.q = "";
        setSearchDraft("");
        break;
      case "projectId":
        next.projectId = "";
        next.endpointId = "";
        break;
      case "endpointId":
        next.endpointId = "";
        break;
      case "status":
        next.status = DEFAULT_STATUS;
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

  function handleSearchSubmit() {
    applyFilters({
      ...filters,
      q: searchDraft.trim(),
      eventType: eventTypeDraft.trim(),
      from: fromDraft,
      to: toDraft,
    });
  }

  function handleReset() {
    setSearchDraft("");
    setEventTypeDraft("");
    setFromDraft("");
    setToDraft("");

    const params = new URLSearchParams();

    if (pageSize !== DELIVERIES_PAGE_SIZE) params.set("page_size", String(pageSize));
    setSearchParams(params);
  }

  function handlePageChange(nextPage: number) {
    const params = new URLSearchParams(searchParams);

    setPageParam(params, nextPage);
    setSearchParams(params);
  }

  function handlePageSizeChange(nextPageSize: number) {
    const params = new URLSearchParams(searchParams);

    if (nextPageSize !== DELIVERIES_PAGE_SIZE) params.set("page_size", String(nextPageSize));
    else params.delete("page_size");

    params.delete("page");
    setSearchParams(params);
  }

  const isFiltered =
    filters.q !== "" ||
    filters.projectId !== "" ||
    filters.endpointId !== "" ||
    filters.status !== DEFAULT_STATUS ||
    filters.eventType !== "" ||
    filters.from !== "" ||
    filters.to !== "" ||
    filters.order !== DEFAULT_ORDER;

  const backTo = `/deliveries${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;

  return (
    <AppLayout user={user} title="Deliveries">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[2px] text-[#5D7063]">Workspace</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Deliveries</h1>
          <p className="mt-2 text-sm font-medium text-[#53665A]">
            Every webhook message across the projects you can access.
          </p>
        </div>

        {meta && meta.total_count > 0 && (
          <p className="shrink-0 rounded-full bg-[#EFF5F1] px-3.5 py-1.5 text-xs font-semibold text-[#405348]">
            {meta.total_count} {meta.total_count === 1 ? "delivery" : "deliveries"}
          </p>
        )}
      </div>

      <div className="mt-8">
        <DeliveryFilterBar
          filters={filters}
          projects={projects}
          endpoints={endpoints}
          searchDraft={searchDraft}
          eventTypeDraft={eventTypeDraft}
          fromDraft={fromDraft}
          toDraft={toDraft}
          onSearchDraftChange={setSearchDraft}
          onEventTypeDraftChange={setEventTypeDraft}
          onFromDraftChange={setFromDraft}
          onToDraftChange={setToDraft}
          onFiltersChange={applyFilters}
          onSubmit={handleSearchSubmit}
          onReset={handleReset}
          onRemoveFilter={handleRemoveFilter}
          isFiltered={isFiltered}
        />
      </div>

      <section className="mt-6">
        {loading && deliveries.length === 0 ? (
          <p className="text-sm font-medium text-[#607267]">Loading deliveries...</p>
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
        ) : deliveries.length === 0 ? (
          <div className="rounded-[18px] border border-dashed border-[#C2D4C7] bg-white px-6 py-14 text-center shadow-[0_8px_30px_rgba(32,78,53,0.05)]">
            <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-[#EFF5F1] text-[#5D7063]">
              <ActivityIcon className="h-5 w-5" />
            </span>

            <h2 className="mt-3 text-lg font-semibold tracking-tight">
              {isFiltered ? "No deliveries match your filters" : "No deliveries yet"}
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm font-medium text-[#607267]">
              {isFiltered
                ? "Try a different search, status, or date range."
                : "Deliveries appear once an endpoint receives matching events."}
            </p>

            {isFiltered && (
              <Button variant="secondary" size="md" className="mt-5" onClick={handleReset}>
                Reset filters
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
              className={`${GLOBAL_DELIVERY_ROW_GRID_COLS} hidden gap-x-4 border-b border-[#E4EBE6] px-5 py-3 text-[10px] font-semibold uppercase tracking-[2px] text-[#8A9990] lg:grid`}
            >
              <span>Status</span>
              <span>Event</span>
              <span>Endpoint</span>
              <span>Result</span>
              <span>Attempts</span>
              <span>Received</span>
              <span />
            </div>

            <div className="divide-y divide-[#E4EBE6]">
              {deliveries.map((message) => (
                <GlobalDeliveryRow key={message.id} message={message} backTo={backTo} />
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
              pageSizeOptions={DELIVERIES_PAGE_SIZES}
              onPageSizeChange={handlePageSizeChange}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </section>
    </AppLayout>
  );
}

export default DeliveriesPage;

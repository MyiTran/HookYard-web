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
import { DELIVERIES_PAGE_SIZE, getDeliveries } from "../../../lib/deliveryApi";
import { getEndpoints } from "../../../lib/endpointApi";
import { getProjects } from "../../../lib/projectApi";
import type {
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
  const parsed = Number(value);

  return Number.isInteger(parsed) && parsed > 1 ? parsed : 1;
}

function readFilters(params: URLSearchParams): DeliveryFilters {
  return {
    q: params.get("q") ?? "",
    projectId: params.get("project_id") ?? "",
    endpointId: params.get("endpoint_id") ?? "",
    status: readStatus(params.get("status")),
    eventType: params.get("event_type") ?? "",
    from: readDate(params.get("from")),
    to: readDate(params.get("to")),
    order: readOrder(params.get("order")),
  };
}

function buildFilterParams(filters: DeliveryFilters): URLSearchParams {
  const params = new URLSearchParams();

  if (filters.q) params.set("q", filters.q);
  if (filters.projectId) params.set("project_id", filters.projectId);
  if (filters.endpointId) params.set("endpoint_id", filters.endpointId);
  if (filters.status !== DEFAULT_STATUS) params.set("status", filters.status);
  if (filters.eventType) params.set("event_type", filters.eventType);
  if (filters.from) params.set("from", filters.from);
  if (filters.to) params.set("to", filters.to);
  if (filters.order !== DEFAULT_ORDER) params.set("order", filters.order);

  return params;
}

function DeliveriesPage() {
  const user = useOutletContext<CurrentUser>();
  const [searchParams, setSearchParams] = useSearchParams();

  const filters = readFilters(searchParams);
  const page = readPage(searchParams.get("page"));

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
        status: filters.status === "all" ? undefined : filters.status,
        eventType: filters.eventType || undefined,
        from: filters.from || undefined,
        to: filters.to || undefined,
        order: filters.order,
        page,
        perPage: DELIVERIES_PAGE_SIZE,
      });

      if (cancelled) return;

      if (!result.ok) {
        setError(result.error);
        setDeliveries([]);
        setMeta(null);
        setLoading(false);
        return;
      }

      setError("");
      setMeta(result.data.meta);

      if (page > result.data.meta.last_page) {
        setLoading(false);
        return;
      }

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
    reloadToken,
  ]);

  useEffect(() => {
    if (!meta || page <= meta.last_page) return;

    const params = new URLSearchParams(searchParams);

    if (meta.last_page > 1) params.set("page", String(meta.last_page));
    else params.delete("page");

    setSearchParams(params, { replace: true });
  }, [meta, page, searchParams, setSearchParams]);

  function applyFilters(next: DeliveryFilters) {
    const projectChanged = next.projectId !== filters.projectId;
    const normalized = projectChanged ? { ...next, endpointId: "" } : next;

    setSearchParams(buildFilterParams(normalized));
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
    setSearchParams(new URLSearchParams());
  }

  function handlePageChange(nextPage: number) {
    const params = new URLSearchParams(searchParams);

    if (nextPage > 1) params.set("page", String(nextPage));
    else params.delete("page");

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

  const totalPages = meta?.last_page ?? 1;
  const isClamping = Boolean(meta && page > meta.last_page);
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
          isFiltered={isFiltered}
        />
      </div>

      <section className="mt-6">
        {(loading || isClamping) && deliveries.length === 0 ? (
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
            aria-busy={loading || isClamping}
            className={`overflow-hidden rounded-[18px] border border-[#D8E3DB] bg-white shadow-[0_8px_30px_rgba(32,78,53,0.05)] transition ${
              loading || isClamping ? "opacity-60" : "opacity-100"
            }`}
          >
            <div
              className={`${GLOBAL_DELIVERY_ROW_GRID_COLS} hidden gap-x-4 border-b border-[#E4EBE6] px-5 py-3 text-[10px] font-semibold uppercase tracking-[2px] text-[#8A9990] lg:grid`}
            >
              <span>Status</span>
              <span>Event</span>
              <span>Endpoint</span>
              <span>Project</span>
              <span>Result</span>
              <span>Attempts</span>
              <span>Created</span>
              <span />
            </div>

            <div className="divide-y divide-[#E4EBE6]">
              {deliveries.map((message) => (
                <GlobalDeliveryRow key={message.id} message={message} backTo={backTo} />
              ))}
            </div>
          </div>
        )}

        {!error && meta && meta.total_count > 0 && (
          <div className="mt-4">
            <Pagination
              page={Math.min(page, totalPages)}
              totalPages={totalPages}
              totalCount={meta.total_count}
              pageSize={meta.page_size}
              disabled={loading || isClamping}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </section>
    </AppLayout>
  );
}

export default DeliveriesPage;

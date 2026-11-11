import { useEffect, useState } from "react";
import { useOutletContext, useSearchParams } from "react-router-dom";
import AdminContextChip from "../../../components/admin/AdminContextChip";
import AdminDeliveryRow, { ADMIN_DELIVERY_ROW_GRID_COLS } from "../../../components/admin/AdminDeliveryRow";
import FilterClearButton from "../../../components/filters/FilterClearButton";
import FilterDateRange from "../../../components/filters/FilterDateRange";
import FilterSelect from "../../../components/filters/FilterSelect";
import FilterToolbar from "../../../components/filters/FilterToolbar";
import AppLayout from "../../../components/layout/AppLayout";
import Pagination from "../../../components/ui/Pagination";
import { getAdminAccount, getAdminDeliveries, getAdminEndpoint, getAdminProject } from "../../../lib/adminApi";
import { readDateParam } from "../../../lib/dateRange";
import { readPageParam, setSearchParam } from "../../../lib/searchParams";
import type { AdminDelivery } from "../../../types/admin";
import type { PaginationMeta } from "../../../types/pagination";
import type { CurrentUser } from "../../../types/user";

type DeliveryStatusFilter = "all" | "pending" | "delivering" | "succeeded" | "failed";
type FailureCategoryFilter = "all" | "destination_rejected" | "interrupted" | "timeout" | "network" | "http_error";
type DeliverySort = "created_desc" | "created_asc";

const STATUS_VALUES: DeliveryStatusFilter[] = ["all", "pending", "delivering", "succeeded", "failed"];
const FAILURE_VALUES: FailureCategoryFilter[] = ["all", "destination_rejected", "interrupted", "timeout", "network", "http_error"];
const SORT_VALUES: DeliverySort[] = ["created_desc", "created_asc"];

const STATUS_OPTIONS = [
  { value: "all", label: "All statuses" },
  { value: "pending", label: "Pending" },
  { value: "delivering", label: "Delivering" },
  { value: "succeeded", label: "Succeeded" },
  { value: "failed", label: "Failed" },
];

const FAILURE_OPTIONS = [
  { value: "all", label: "Any failure category" },
  { value: "destination_rejected", label: "Destination rejected" },
  { value: "interrupted", label: "Attempt interrupted" },
  { value: "timeout", label: "Timeout" },
  { value: "network", label: "Network error" },
  { value: "http_error", label: "HTTP error" },
];

const SORT_OPTIONS = [
  { value: "created_desc", label: "Newest first" },
  { value: "created_asc", label: "Oldest first" },
];

function readStatus(value: string | null): DeliveryStatusFilter {
  return STATUS_VALUES.includes(value as DeliveryStatusFilter) ? (value as DeliveryStatusFilter) : "all";
}

function readFailure(value: string | null): FailureCategoryFilter {
  return FAILURE_VALUES.includes(value as FailureCategoryFilter) ? (value as FailureCategoryFilter) : "all";
}

function readSort(value: string | null): DeliverySort {
  return SORT_VALUES.includes(value as DeliverySort) ? (value as DeliverySort) : "created_desc";
}

function AdminDeliveriesPage() {
  const user = useOutletContext<CurrentUser>();
  const [searchParams, setSearchParams] = useSearchParams();

  const status = readStatus(searchParams.get("status"));
  const failureCategory = readFailure(searchParams.get("failure_category"));
  const accountId = searchParams.get("account_id") ?? "";
  const projectId = searchParams.get("project_id") ?? "";
  const endpointId = searchParams.get("endpoint_id") ?? "";
  const from = readDateParam(searchParams.get("from"));
  const to = readDateParam(searchParams.get("to"));
  const sort = readSort(searchParams.get("order"));
  const page = readPageParam(searchParams.get("page"));

  const [deliveries, setDeliveries] = useState<AdminDelivery[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [accountName, setAccountName] = useState("");
  const [projectName, setProjectName] = useState("");
  const [endpointName, setEndpointName] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadAccountName() {
      setAccountName("");

      if (!accountId) return;

      const result = await getAdminAccount(accountId);

      if (!cancelled && result.ok) {
        setAccountName(result.data.name);
      }
    }

    loadAccountName();

    return () => {
      cancelled = true;
    };
  }, [accountId]);

  useEffect(() => {
    let cancelled = false;

    async function loadProjectName() {
      setProjectName("");

      if (!projectId) return;

      const result = await getAdminProject(projectId);

      if (!cancelled && result.ok) {
        setProjectName(result.data.name);
      }
    }

    loadProjectName();

    return () => {
      cancelled = true;
    };
  }, [projectId]);

  useEffect(() => {
    let cancelled = false;

    async function loadEndpointName() {
      setEndpointName("");

      if (!endpointId) return;

      const result = await getAdminEndpoint(endpointId);

      if (!cancelled && result.ok) {
        setEndpointName(result.data.name);
      }
    }

    loadEndpointName();

    return () => {
      cancelled = true;
    };
  }, [endpointId]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);

      const result = await getAdminDeliveries({
        accountId: accountId || undefined,
        status: status === "all" ? undefined : status,
        failureCategory: failureCategory === "all" ? undefined : failureCategory,
        projectId: projectId || undefined,
        endpointId: endpointId || undefined,
        from: from || undefined,
        to: to || undefined,
        order: sort,
        page,
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
            setSearchParam(params, "page", lastPage > 1 ? String(lastPage) : "");

            return params;
          },
          { replace: true },
        );
        return;
      }

      setDeliveries(result.data.data);
      setMeta(result.data.meta);
      setError("");
      setLoading(false);
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [status, failureCategory, accountId, projectId, endpointId, from, to, sort, page, setSearchParams]);

  function applyFilters(next: {
    status: DeliveryStatusFilter;
    failureCategory: FailureCategoryFilter;
    from: string;
    to: string;
    sort: DeliverySort;
  }) {
    setError("");
    const params = new URLSearchParams(searchParams);

    params.delete("page");
    setSearchParam(params, "status", next.status === "all" ? "" : next.status);
    setSearchParam(params, "failure_category", next.failureCategory === "all" ? "" : next.failureCategory);
    setSearchParam(params, "from", next.from);
    setSearchParam(params, "to", next.to);
    setSearchParam(params, "order", next.sort === "created_desc" ? "" : next.sort);

    setSearchParams(params);
  }

  function clearContext(key: "account_id" | "project_id" | "endpoint_id") {
    const params = new URLSearchParams(searchParams);
    params.delete("page");
    params.delete(key);
    setSearchParams(params);
  }

  function handleReset() {
    setSearchParams(new URLSearchParams());
  }

  function handlePageChange(nextPage: number) {
    const params = new URLSearchParams(searchParams);
    setSearchParam(params, "page", nextPage > 1 ? String(nextPage) : "");
    setSearchParams(params);
  }

  const isFiltered =
    status !== "all" ||
    failureCategory !== "all" ||
    accountId !== "" ||
    projectId !== "" ||
    endpointId !== "" ||
    from !== "" ||
    to !== "" ||
    sort !== "created_desc";

  return (
    <AppLayout user={user} title="Deliveries">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[2px] text-[#5D7063]">Admin</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Deliveries</h1>
        <p className="mt-2 text-sm font-medium text-[#53665A]">Read-only view of recent outbound delivery attempts.</p>
      </div>

      <section className="mt-8">
        {loading && deliveries.length === 0 && !isFiltered ? (
          <p className="text-sm font-medium text-[#607267]">Loading deliveries...</p>
        ) : error ? (
          <div className="rounded-[18px] border border-[#F1D5D5] bg-[#FBEEEE] px-6 py-8 text-sm font-medium text-[#B42318]">
            {error}
          </div>
        ) : (
          <>
            {(accountId || projectId || endpointId) && (
              <div className="mb-3 flex flex-wrap gap-2">
                {accountId && (
                  <AdminContextChip
                    label={accountName ? `Account: ${accountName}` : `Account: ${accountId}`}
                    onClear={() => clearContext("account_id")}
                  />
                )}

                {projectId && (
                  <AdminContextChip
                    label={projectName ? `Project: ${projectName}` : `Project: ${projectId}`}
                    onClear={() => clearContext("project_id")}
                  />
                )}

                {endpointId && (
                  <AdminContextChip
                    label={endpointName ? `Endpoint: ${endpointName}` : `Endpoint: ${endpointId}`}
                    onClear={() => clearContext("endpoint_id")}
                  />
                )}
              </div>
            )}

            <FilterToolbar onSubmit={() => applyFilters({ status, failureCategory, from, to, sort })}>
              <FilterSelect
                value={status}
                onChange={(value) => applyFilters({ status: value as DeliveryStatusFilter, failureCategory, from, to, sort })}
                options={STATUS_OPTIONS}
                ariaLabel="Filter by status"
                className="sm:w-36"
              />

              <FilterSelect
                value={failureCategory}
                onChange={(value) => applyFilters({ status, failureCategory: value as FailureCategoryFilter, from, to, sort })}
                options={FAILURE_OPTIONS}
                ariaLabel="Filter by failure category"
                className="sm:w-44"
              />

              <FilterDateRange
                idPrefix="admin-delivery"
                layout="row"
                from={from}
                to={to}
                onFromChange={(value) => applyFilters({ status, failureCategory, from: value, to, sort })}
                onToChange={(value) => applyFilters({ status, failureCategory, from, to: value, sort })}
              />

              <FilterSelect
                value={sort}
                onChange={(value) => applyFilters({ status, failureCategory, from, to, sort: value as DeliverySort })}
                options={SORT_OPTIONS}
                ariaLabel="Sort deliveries"
                className="sm:w-40"
              />

              <FilterClearButton onClick={handleReset} />
            </FilterToolbar>

            {loading ? (
              <p className="mt-5 text-sm font-medium text-[#607267]">Loading deliveries...</p>
            ) : deliveries.length === 0 ? (
              <p className="mt-8 rounded-[18px] border border-dashed border-[#C2D4C7] bg-white px-6 py-10 text-center text-sm font-medium text-[#607267]">
                No deliveries match your filters.
              </p>
            ) : (
              <div className="mt-5 overflow-hidden rounded-[18px] border border-[#D8E3DB] bg-white shadow-[0_8px_30px_rgba(32,78,53,0.05)]">
                <div
                  className={`${ADMIN_DELIVERY_ROW_GRID_COLS} hidden gap-x-4 border-b border-[#E4EBE6] px-5 py-3 text-[10px] font-semibold uppercase tracking-[2px] text-[#8A9990] lg:grid`}
                >
                  <span>Status</span>
                  <span>Endpoint</span>
                  <span>Result</span>
                  <span>Attempts</span>
                  <span>Failure</span>
                  <span>Received</span>
                </div>

                <div className="divide-y divide-[#E4EBE6]">
                  {deliveries.map((delivery) => (
                    <AdminDeliveryRow key={delivery.id} delivery={delivery} />
                  ))}
                </div>
              </div>
            )}

            {!loading && meta && (
              <div className="mt-4">
                <Pagination
                  page={page}
                  totalPages={meta.last_page}
                  totalCount={meta.total_count}
                  pageSize={meta.page_size}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </>
        )}
      </section>
    </AppLayout>
  );
}

export default AdminDeliveriesPage;

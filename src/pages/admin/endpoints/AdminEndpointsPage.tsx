import { useEffect, useState } from "react";
import { useOutletContext, useSearchParams } from "react-router-dom";
import AdminContextChip from "../../../components/admin/AdminContextChip";
import AdminEndpointRow, { ADMIN_ENDPOINT_ROW_GRID_COLS } from "../../../components/admin/AdminEndpointRow";
import FilterClearButton from "../../../components/filters/FilterClearButton";
import FilterSearchInput from "../../../components/filters/FilterSearchInput";
import FilterSelect from "../../../components/filters/FilterSelect";
import FilterToolbar from "../../../components/filters/FilterToolbar";
import AppLayout from "../../../components/layout/AppLayout";
import Pagination from "../../../components/ui/Pagination";
import { getAdminEndpoints, getAdminProject } from "../../../lib/adminApi";
import { readPageParam, setSearchParam } from "../../../lib/searchParams";
import type { AdminEndpoint } from "../../../types/admin";
import type { PaginationMeta } from "../../../types/pagination";
import type { CurrentUser } from "../../../types/user";

type EndpointStatusFilter = "all" | "active" | "paused" | "archived";
type CircuitFilter = "all" | "enabled" | "circuit_open" | "disabled";
type EndpointSort = "created_desc" | "created_asc" | "name_asc";

const STATUS_VALUES: EndpointStatusFilter[] = ["all", "active", "paused", "archived"];
const CIRCUIT_VALUES: CircuitFilter[] = ["all", "enabled", "circuit_open", "disabled"];
const SORT_VALUES: EndpointSort[] = ["created_desc", "created_asc", "name_asc"];

const STATUS_OPTIONS = [
  { value: "all", label: "All statuses" },
  { value: "active", label: "Active" },
  { value: "paused", label: "Paused" },
  { value: "archived", label: "Archived" },
];

const CIRCUIT_OPTIONS = [
  { value: "all", label: "Any circuit state" },
  { value: "enabled", label: "Enabled" },
  { value: "circuit_open", label: "Circuit open" },
  { value: "disabled", label: "Disabled" },
];

const SORT_OPTIONS = [
  { value: "created_desc", label: "Newest first" },
  { value: "created_asc", label: "Oldest first" },
  { value: "name_asc", label: "Name A–Z" },
];

function readStatus(value: string | null): EndpointStatusFilter {
  return STATUS_VALUES.includes(value as EndpointStatusFilter) ? (value as EndpointStatusFilter) : "all";
}

function readCircuit(value: string | null): CircuitFilter {
  return CIRCUIT_VALUES.includes(value as CircuitFilter) ? (value as CircuitFilter) : "all";
}

function readSort(value: string | null): EndpointSort {
  return SORT_VALUES.includes(value as EndpointSort) ? (value as EndpointSort) : "created_desc";
}

function AdminEndpointsPage() {
  const user = useOutletContext<CurrentUser>();
  const [searchParams, setSearchParams] = useSearchParams();

  const searchQuery = searchParams.get("q") ?? "";
  const projectId = searchParams.get("project_id") ?? "";
  const status = readStatus(searchParams.get("status"));
  const circuit = readCircuit(searchParams.get("circuit_state"));
  const sort = readSort(searchParams.get("order"));
  const page = readPageParam(searchParams.get("page"));

  const [endpoints, setEndpoints] = useState<AdminEndpoint[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [projectName, setProjectName] = useState("");

  const [searchDraft, setSearchDraft] = useState(searchQuery);
  const [syncedSearch, setSyncedSearch] = useState(searchQuery);

  if (searchQuery !== syncedSearch) {
    setSyncedSearch(searchQuery);
    setSearchDraft(searchQuery);
  }

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

    async function load() {
      setLoading(true);

      const result = await getAdminEndpoints({
        q: searchQuery || undefined,
        projectId: projectId || undefined,
        circuitState: circuit === "all" ? undefined : circuit,
        active: status === "active" ? true : status === "paused" ? false : undefined,
        archived: status === "archived" ? true : undefined,
        order: sort,
        page,
      });

      if (cancelled) return;

      if (!result.ok) {
        setError(result.error);
        setEndpoints([]);
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

      setEndpoints(result.data.data);
      setMeta(result.data.meta);
      setError("");
      setLoading(false);
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [searchQuery, projectId, status, circuit, sort, page, setSearchParams]);

  function applyFilters(next: { search: string; status: EndpointStatusFilter; circuit: CircuitFilter; sort: EndpointSort }) {
    setError("");
    const params = new URLSearchParams(searchParams);

    params.delete("page");
    setSearchParam(params, "q", next.search);
    setSearchParam(params, "status", next.status === "all" ? "" : next.status);
    setSearchParam(params, "circuit_state", next.circuit === "all" ? "" : next.circuit);
    setSearchParam(params, "order", next.sort === "created_desc" ? "" : next.sort);

    setSearchParams(params);
  }

  function handleSearchSubmit() {
    applyFilters({ search: searchDraft.trim(), status, circuit, sort });
  }

  function handleClearProjectContext() {
    const params = new URLSearchParams(searchParams);
    params.delete("page");
    params.delete("project_id");
    setSearchParams(params);
  }

  function handleReset() {
    setSearchDraft("");
    setSearchParams(new URLSearchParams());
  }

  function handlePageChange(nextPage: number) {
    const params = new URLSearchParams(searchParams);
    setSearchParam(params, "page", nextPage > 1 ? String(nextPage) : "");
    setSearchParams(params);
  }

  const isFiltered = searchQuery !== "" || projectId !== "" || status !== "all" || circuit !== "all" || sort !== "created_desc";

  return (
    <AppLayout user={user} title="Endpoints">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[2px] text-[#5D7063]">Admin</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Endpoints</h1>
        <p className="mt-2 text-sm font-medium text-[#53665A]">Read-only view of every endpoint across all projects.</p>
      </div>

      <section className="mt-8">
        {loading && endpoints.length === 0 && !isFiltered ? (
          <p className="text-sm font-medium text-[#607267]">Loading endpoints...</p>
        ) : error ? (
          <div className="rounded-[18px] border border-[#F1D5D5] bg-[#FBEEEE] px-6 py-8 text-sm font-medium text-[#B42318]">
            {error}
          </div>
        ) : (
          <>
            {projectId && (
              <div className="mb-3">
                <AdminContextChip
                  label={projectName ? `Project: ${projectName}` : `Project: ${projectId}`}
                  onClear={handleClearProjectContext}
                />
              </div>
            )}

            <FilterToolbar onSubmit={handleSearchSubmit}>
              <FilterSearchInput
                id="admin-endpoint-search"
                value={searchDraft}
                onChange={setSearchDraft}
                placeholder="Search name or URL"
                label="Search endpoints"
                className="w-full sm:w-80"
              />

              <FilterSelect
                value={status}
                onChange={(value) => applyFilters({ search: searchQuery, status: value as EndpointStatusFilter, circuit, sort })}
                options={STATUS_OPTIONS}
                ariaLabel="Filter by status"
                className="sm:w-36"
              />

              <FilterSelect
                value={circuit}
                onChange={(value) => applyFilters({ search: searchQuery, status, circuit: value as CircuitFilter, sort })}
                options={CIRCUIT_OPTIONS}
                ariaLabel="Filter by circuit state"
                className="sm:w-44"
              />

              <FilterSelect
                value={sort}
                onChange={(value) => applyFilters({ search: searchQuery, status, circuit, sort: value as EndpointSort })}
                options={SORT_OPTIONS}
                ariaLabel="Sort endpoints"
                className="sm:w-40"
              />

              <FilterClearButton onClick={handleReset} />
            </FilterToolbar>

            {loading ? (
              <p className="mt-5 text-sm font-medium text-[#607267]">Loading endpoints...</p>
            ) : endpoints.length === 0 ? (
              <p className="mt-8 rounded-[18px] border border-dashed border-[#C2D4C7] bg-white px-6 py-10 text-center text-sm font-medium text-[#607267]">
                No endpoints match your filters.
              </p>
            ) : (
              <div className="mt-5 overflow-hidden rounded-[18px] border border-[#D8E3DB] bg-white shadow-[0_8px_30px_rgba(32,78,53,0.05)]">
                <div
                  className={`${ADMIN_ENDPOINT_ROW_GRID_COLS} hidden gap-x-4 border-b border-[#E4EBE6] px-5 py-3 text-[10px] font-semibold uppercase tracking-[2px] text-[#8A9990] lg:grid`}
                >
                  <span>Endpoint</span>
                  <span>Project</span>
                  <span>Status</span>
                  <span>Circuit</span>
                  <span>Queued</span>
                  <span>Updated</span>
                </div>

                <div className="divide-y divide-[#E4EBE6]">
                  {endpoints.map((endpoint) => (
                    <AdminEndpointRow key={endpoint.id} endpoint={endpoint} />
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

export default AdminEndpointsPage;

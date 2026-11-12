import { useEffect, useState } from "react";
import { useOutletContext, useSearchParams } from "react-router-dom";
import AdminContextChip from "../../../components/admin/AdminContextChip";
import AdminProjectRow, { ADMIN_PROJECT_ROW_GRID_COLS } from "../../../components/admin/AdminProjectRow";
import FilterClearButton from "../../../components/filters/FilterClearButton";
import FilterSearchInput from "../../../components/filters/FilterSearchInput";
import FilterSelect from "../../../components/filters/FilterSelect";
import FilterToolbar from "../../../components/filters/FilterToolbar";
import AppLayout from "../../../components/layout/AppLayout";
import Pagination from "../../../components/ui/Pagination";
import { getAdminAccount, getAdminProjects } from "../../../lib/adminApi";
import { readPageParam, setSearchParam } from "../../../lib/searchParams";
import type { AdminProject } from "../../../types/admin";
import type { PaginationMeta } from "../../../types/pagination";
import type { Plan } from "../../../types/plan";
import type { CurrentUser } from "../../../types/user";

type ProjectPlanFilter = "all" | Plan;
type ProjectSort = "created_desc" | "created_asc" | "name_asc";

const PLAN_VALUES: ProjectPlanFilter[] = ["all", "free", "pro"];
const SORT_VALUES: ProjectSort[] = ["created_desc", "created_asc", "name_asc"];

const PLAN_OPTIONS = [
  { value: "all", label: "All plans" },
  { value: "free", label: "Free" },
  { value: "pro", label: "Pro" },
];

const SORT_OPTIONS = [
  { value: "created_desc", label: "Newest first" },
  { value: "created_asc", label: "Oldest first" },
  { value: "name_asc", label: "Name A–Z" },
];

function readPlan(value: string | null): ProjectPlanFilter {
  return PLAN_VALUES.includes(value as ProjectPlanFilter) ? (value as ProjectPlanFilter) : "all";
}

function readSort(value: string | null): ProjectSort {
  return SORT_VALUES.includes(value as ProjectSort) ? (value as ProjectSort) : "created_desc";
}

function AdminProjectsPage() {
  const user = useOutletContext<CurrentUser>();
  const [searchParams, setSearchParams] = useSearchParams();

  const searchQuery = searchParams.get("q") ?? "";
  const accountId = searchParams.get("account_id") ?? "";
  const plan = readPlan(searchParams.get("plan"));
  const sort = readSort(searchParams.get("order"));
  const page = readPageParam(searchParams.get("page"));

  const [projects, setProjects] = useState<AdminProject[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [accountName, setAccountName] = useState("");

  const [searchDraft, setSearchDraft] = useState(searchQuery);
  const [syncedSearch, setSyncedSearch] = useState(searchQuery);

  if (searchQuery !== syncedSearch) {
    setSyncedSearch(searchQuery);
    setSearchDraft(searchQuery);
  }

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

    async function load() {
      setLoading(true);

      const result = await getAdminProjects({
        q: searchQuery || undefined,
        accountId: accountId || undefined,
        plan: plan === "all" ? undefined : plan,
        order: sort,
        page,
      });

      if (cancelled) return;

      if (!result.ok) {
        setError(result.error);
        setProjects([]);
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

      setProjects(result.data.data);
      setMeta(result.data.meta);
      setError("");
      setLoading(false);
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [searchQuery, accountId, plan, sort, page, setSearchParams]);

  function applyFilters(next: { search: string; plan: ProjectPlanFilter; sort: ProjectSort }) {
    setError("");
    const params = new URLSearchParams(searchParams);

    params.delete("page");
    setSearchParam(params, "q", next.search);
    setSearchParam(params, "plan", next.plan === "all" ? "" : next.plan);
    setSearchParam(params, "order", next.sort === "created_desc" ? "" : next.sort);

    setSearchParams(params);
  }

  function handleSearchSubmit() {
    applyFilters({ search: searchDraft.trim(), plan, sort });
  }

  function handleClearAccountContext() {
    const params = new URLSearchParams(searchParams);
    params.delete("page");
    params.delete("account_id");
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

  const isFiltered = searchQuery !== "" || accountId !== "" || plan !== "all" || sort !== "created_desc";
  const accountChipLabel = accountName ? `Projects billed to ${accountName}` : `Account: ${accountId}`;

  return (
    <AppLayout user={user} title="Projects">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[2px] text-[#5D7063]">Admin</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Projects</h1>
        <p className="mt-2 text-sm font-medium text-[#53665A]">
          Platform-wide projects. Open a project for billing context and endpoint summary.
        </p>
      </div>

      <section className="mt-8">
        {loading && projects.length === 0 && !isFiltered ? (
          <p className="text-sm font-medium text-[#607267]">Loading projects...</p>
        ) : error ? (
          <div className="rounded-[18px] border border-[#F1D5D5] bg-[#FBEEEE] px-6 py-8 text-sm font-medium text-[#B42318]">
            {error}
          </div>
        ) : (
          <>
            {accountId && (
              <div className="mb-3">
                <AdminContextChip label={accountChipLabel} onClear={handleClearAccountContext} />
              </div>
            )}

            <FilterToolbar onSubmit={handleSearchSubmit}>
              <FilterSearchInput
                id="admin-project-search"
                value={searchDraft}
                onChange={setSearchDraft}
                placeholder="Search projects"
                label="Search projects"
                className="w-full sm:w-80"
              />

              <FilterSelect
                value={plan}
                onChange={(value) => applyFilters({ search: searchQuery, plan: value as ProjectPlanFilter, sort })}
                options={PLAN_OPTIONS}
                ariaLabel="Filter by plan"
                className="sm:w-36"
              />

              <FilterSelect
                value={sort}
                onChange={(value) => applyFilters({ search: searchQuery, plan, sort: value as ProjectSort })}
                options={SORT_OPTIONS}
                ariaLabel="Sort projects"
                className="sm:w-40"
              />

              <FilterClearButton onClick={handleReset} />
            </FilterToolbar>

            {loading ? (
              <p className="mt-5 text-sm font-medium text-[#607267]">Loading projects...</p>
            ) : projects.length === 0 ? (
              <p className="mt-8 rounded-[18px] border border-dashed border-[#C2D4C7] bg-white px-6 py-10 text-center text-sm font-medium text-[#607267]">
                No projects match your filters.
              </p>
            ) : (
              <div className="mt-5 overflow-hidden rounded-[18px] border border-[#D8E3DB] bg-white shadow-[0_8px_30px_rgba(32,78,53,0.05)]">
                <div
                  className={`${ADMIN_PROJECT_ROW_GRID_COLS} hidden gap-x-4 border-b border-[#E4EBE6] px-5 py-3 text-[10px] font-semibold uppercase tracking-[2px] text-[#8A9990] lg:grid`}
                >
                  <span>Project</span>
                  <span>Billing account</span>
                  <span>Plan</span>
                  <span>Created</span>
                </div>

                <div className="divide-y divide-[#E4EBE6]">
                  {projects.map((project) => (
                    <AdminProjectRow key={project.id} project={project} />
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

export default AdminProjectsPage;

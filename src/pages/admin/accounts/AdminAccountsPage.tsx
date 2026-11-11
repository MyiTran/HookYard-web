import { useEffect, useState } from "react";
import { useOutletContext, useSearchParams } from "react-router-dom";
import AdminAccountRow, { ADMIN_ACCOUNT_ROW_GRID_COLS } from "../../../components/admin/AdminAccountRow";
import FilterClearButton from "../../../components/filters/FilterClearButton";
import FilterSearchInput from "../../../components/filters/FilterSearchInput";
import FilterSelect from "../../../components/filters/FilterSelect";
import FilterToolbar from "../../../components/filters/FilterToolbar";
import AppLayout from "../../../components/layout/AppLayout";
import Pagination from "../../../components/ui/Pagination";
import { getAdminSupportAccounts } from "../../../lib/adminApi";
import { readPageParam, setSearchParam } from "../../../lib/searchParams";
import type { AdminSupportAccount } from "../../../types/admin";
import type { PaginationMeta } from "../../../types/pagination";
import type { Plan } from "../../../types/plan";
import type { CurrentUser } from "../../../types/user";

type AccountRoleFilter = "all" | "admin" | "support" | "none";
type AccountActiveFilter = "all" | "confirmed" | "unconfirmed";
type AccountPlanFilter = "all" | Plan;
type AccountSort = "created_desc" | "created_asc" | "email_asc";

const ROLE_VALUES: AccountRoleFilter[] = ["all", "admin", "support", "none"];
const ACTIVE_VALUES: AccountActiveFilter[] = ["all", "confirmed", "unconfirmed"];
const PLAN_VALUES: AccountPlanFilter[] = ["all", "free", "pro"];
const SORT_VALUES: AccountSort[] = ["created_desc", "created_asc", "email_asc"];

const ROLE_OPTIONS = [
  { value: "all", label: "All roles" },
  { value: "admin", label: "Admin" },
  { value: "support", label: "Support" },
  { value: "none", label: "No role" },
];

const ACTIVE_OPTIONS = [
  { value: "all", label: "Any confirmation" },
  { value: "confirmed", label: "Confirmed" },
  { value: "unconfirmed", label: "Unconfirmed" },
];

const PLAN_OPTIONS = [
  { value: "all", label: "All plans" },
  { value: "free", label: "Free" },
  { value: "pro", label: "Pro" },
];

const SORT_OPTIONS = [
  { value: "created_desc", label: "Newest first" },
  { value: "created_asc", label: "Oldest first" },
  { value: "email_asc", label: "Email A–Z" },
];

function readRole(value: string | null): AccountRoleFilter {
  return ROLE_VALUES.includes(value as AccountRoleFilter) ? (value as AccountRoleFilter) : "all";
}

function readActive(value: string | null): AccountActiveFilter {
  return ACTIVE_VALUES.includes(value as AccountActiveFilter) ? (value as AccountActiveFilter) : "all";
}

function readPlan(value: string | null): AccountPlanFilter {
  return PLAN_VALUES.includes(value as AccountPlanFilter) ? (value as AccountPlanFilter) : "all";
}

function readSort(value: string | null): AccountSort {
  return SORT_VALUES.includes(value as AccountSort) ? (value as AccountSort) : "created_desc";
}

function AdminAccountsPage() {
  const user = useOutletContext<CurrentUser>();
  const [searchParams, setSearchParams] = useSearchParams();

  const searchQuery = searchParams.get("q") ?? "";
  const role = readRole(searchParams.get("role"));
  const active = readActive(searchParams.get("active"));
  const plan = readPlan(searchParams.get("plan"));
  const sort = readSort(searchParams.get("order"));
  const page = readPageParam(searchParams.get("page"));

  const [accounts, setAccounts] = useState<AdminSupportAccount[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchDraft, setSearchDraft] = useState(searchQuery);
  const [syncedSearch, setSyncedSearch] = useState(searchQuery);

  if (searchQuery !== syncedSearch) {
    setSyncedSearch(searchQuery);
    setSearchDraft(searchQuery);
  }

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);

      const result = await getAdminSupportAccounts({
        q: searchQuery || undefined,
        role: role === "all" ? undefined : role,
        plan: plan === "all" ? undefined : plan,
        active: active === "all" ? undefined : active === "confirmed",
        order: sort,
        page,
      });

      if (cancelled) return;

      if (!result.ok) {
        setError(result.error);
        setAccounts([]);
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

      setAccounts(result.data.data);
      setMeta(result.data.meta);
      setError("");
      setLoading(false);
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [searchQuery, role, active, plan, sort, page, setSearchParams]);

  function applyFilters(next: { search: string; role: AccountRoleFilter; active: AccountActiveFilter; plan: AccountPlanFilter; sort: AccountSort }) {
    setError("");
    const params = new URLSearchParams(searchParams);

    params.delete("page");
    setSearchParam(params, "q", next.search);
    setSearchParam(params, "role", next.role === "all" ? "" : next.role);
    setSearchParam(params, "active", next.active === "all" ? "" : next.active);
    setSearchParam(params, "plan", next.plan === "all" ? "" : next.plan);
    setSearchParam(params, "order", next.sort === "created_desc" ? "" : next.sort);

    setSearchParams(params);
  }

  function handleSearchSubmit() {
    applyFilters({ search: searchDraft.trim(), role, active, plan, sort });
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

  const isFiltered = searchQuery !== "" || role !== "all" || active !== "all" || plan !== "all" || sort !== "created_desc";

  return (
    <AppLayout user={user} title="Accounts">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[2px] text-[#5D7063]">Admin</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Accounts</h1>
        <p className="mt-2 text-sm font-medium text-[#53665A]">
          Platform accounts. Open an account to see its owned projects and plan.
        </p>
      </div>

      <section className="mt-8">
        {loading && accounts.length === 0 && !isFiltered ? (
          <p className="text-sm font-medium text-[#607267]">Loading accounts...</p>
        ) : error ? (
          <div className="rounded-[18px] border border-[#F1D5D5] bg-[#FBEEEE] px-6 py-8 text-sm font-medium text-[#B42318]">
            {error}
          </div>
        ) : (
          <>
            <FilterToolbar onSubmit={handleSearchSubmit}>
              <FilterSearchInput
                id="admin-account-search"
                value={searchDraft}
                onChange={setSearchDraft}
                placeholder="Search name or email"
                label="Search accounts"
                className="w-full sm:w-80"
              />

              <FilterSelect
                value={role}
                onChange={(value) => applyFilters({ search: searchQuery, role: value as AccountRoleFilter, active, plan, sort })}
                options={ROLE_OPTIONS}
                ariaLabel="Filter by role"
                className="sm:w-36"
              />

              <FilterSelect
                value={active}
                onChange={(value) => applyFilters({ search: searchQuery, role, active: value as AccountActiveFilter, plan, sort })}
                options={ACTIVE_OPTIONS}
                ariaLabel="Filter by confirmation"
                className="sm:w-40"
              />

              <FilterSelect
                value={plan}
                onChange={(value) => applyFilters({ search: searchQuery, role, active, plan: value as AccountPlanFilter, sort })}
                options={PLAN_OPTIONS}
                ariaLabel="Filter by plan"
                className="sm:w-36"
              />

              <FilterSelect
                value={sort}
                onChange={(value) => applyFilters({ search: searchQuery, role, active, plan, sort: value as AccountSort })}
                options={SORT_OPTIONS}
                ariaLabel="Sort accounts"
                className="sm:w-40"
              />

              <FilterClearButton onClick={handleReset} />
            </FilterToolbar>

            {loading ? (
              <p className="mt-5 text-sm font-medium text-[#607267]">Loading accounts...</p>
            ) : accounts.length === 0 ? (
              <p className="mt-8 rounded-[18px] border border-dashed border-[#C2D4C7] bg-white px-6 py-10 text-center text-sm font-medium text-[#607267]">
                No accounts match your filters.
              </p>
            ) : (
              <div className="mt-5 overflow-hidden rounded-[18px] border border-[#D8E3DB] bg-white shadow-[0_8px_30px_rgba(32,78,53,0.05)]">
                <div
                  className={`${ADMIN_ACCOUNT_ROW_GRID_COLS} hidden gap-x-4 border-b border-[#E4EBE6] px-5 py-3 text-[10px] font-semibold uppercase tracking-[2px] text-[#8A9990] lg:grid`}
                >
                  <span>Account</span>
                  <span>Roles</span>
                  <span>Plan</span>
                  <span>Confirmed</span>
                  <span>Sign-ins</span>
                  <span>Last sign in</span>
                </div>

                <div className="divide-y divide-[#E4EBE6]">
                  {accounts.map((account) => (
                    <AdminAccountRow key={account.id} account={account} />
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

export default AdminAccountsPage;

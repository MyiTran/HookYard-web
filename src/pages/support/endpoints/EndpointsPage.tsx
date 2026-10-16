import { useEffect, useState } from "react";
import { useNavigate, useOutletContext, useSearchParams } from "react-router-dom";
import EndpointCard, { ENDPOINT_ROW_GRID_COLS } from "../../../components/endpoints/EndpointCard";
import EndpointFilterBar, {
  type EndpointFilters,
  type EndpointStatusFilter,
} from "../../../components/endpoints/EndpointFilterBar";
import EndpointFormModal, { type EndpointFormValues } from "../../../components/endpoints/EndpointFormModal";
import SigningSecretDialog from "../../../components/endpoints/SigningSecretDialog";
import AppLayout from "../../../components/layout/AppLayout";
import Button from "../../../components/ui/Button";
import Pagination from "../../../components/ui/Pagination";
import { useToast } from "../../../components/ui/toastContext";
import { createEndpoint, getEndpoints, type EndpointOrder } from "../../../lib/endpointApi";
import { getProjects } from "../../../lib/projectApi";
import type { Endpoint } from "../../../types/endpoint";
import type { PaginationMeta } from "../../../types/pagination";
import type { Project } from "../../../types/project";
import type { CurrentUser } from "../../../types/user";

const DEFAULT_STATUS: EndpointStatusFilter = "all";
const DEFAULT_ORDER: EndpointOrder = "created_desc";

const STATUS_VALUES: EndpointStatusFilter[] = ["all", "active", "inactive", "archived"];
const ORDER_VALUES: EndpointOrder[] = ["created_desc", "created_asc", "name_asc"];

function readStatus(value: string | null): EndpointStatusFilter {
  return STATUS_VALUES.includes(value as EndpointStatusFilter) ? (value as EndpointStatusFilter) : DEFAULT_STATUS;
}

function readOrder(value: string | null): EndpointOrder {
  return ORDER_VALUES.includes(value as EndpointOrder) ? (value as EndpointOrder) : DEFAULT_ORDER;
}

function setParam(params: URLSearchParams, key: string, value: string) {
  if (value) params.set(key, value);
  else params.delete(key);
}

function EndpointsPage() {
  const user = useOutletContext<CurrentUser>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const searchQuery = searchParams.get("q") ?? "";
  const projectId = searchParams.get("project_id") ?? "";
  const status = readStatus(searchParams.get("status"));
  const sort = readOrder(searchParams.get("sort"));
  const page = Math.max(1, Number(searchParams.get("page")) || 1);

  const filters: EndpointFilters = { search: searchQuery, projectId, status, sort };

  const [projects, setProjects] = useState<Project[]>([]);
  const [endpoints, setEndpoints] = useState<Endpoint[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [searchDraft, setSearchDraft] = useState(searchQuery);
  const [syncedSearch, setSyncedSearch] = useState(searchQuery);
  const [reloadToken, setReloadToken] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [created, setCreated] = useState<{ projectId: string; id: string; secret: string } | null>(null);

  if (searchQuery !== syncedSearch) {
    setSyncedSearch(searchQuery);
    setSearchDraft(searchQuery);
  }

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);

      const result = await getEndpoints({
        q: searchQuery || undefined,
        projectId: projectId || undefined,
        active: status === "active" ? true : status === "inactive" ? false : undefined,
        archived: status === "archived" ? true : undefined,
        order: sort,
        page,
      });

      if (cancelled) return;

      if (result.ok) {
        setEndpoints(result.data.data);
        setMeta(result.data.meta);
        setError("");
      } else {
        setError(result.error);
      }

      setLoading(false);
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [searchQuery, projectId, status, sort, page, reloadToken]);

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

  const ownedProjects = projects.filter((project) => project.current_user_role === "owner");

  function applyFilters(next: EndpointFilters) {
    setError("");
    const params = new URLSearchParams(searchParams);

    params.delete("page");
    setParam(params, "q", next.search);
    setParam(params, "project_id", next.projectId);
    setParam(params, "status", next.status === DEFAULT_STATUS ? "" : next.status);
    setParam(params, "sort", next.sort === DEFAULT_ORDER ? "" : next.sort);

    setSearchParams(params);
  }

  function handlePageChange(nextPage: number) {
    const params = new URLSearchParams(searchParams);
    setParam(params, "page", nextPage > 1 ? String(nextPage) : "");

    setSearchParams(params);
  }

  async function handleCreate(values: EndpointFormValues) {
    const { projectId: createProjectId, ...input } = values;
    const result = await createEndpoint(createProjectId, input);

    if (result.ok) {
      setReloadToken((token) => token + 1);
      showToast({ type: "success", message: "Endpoint created successfully" });
      setCreated({ projectId: createProjectId, id: result.data.id, secret: result.data.signing_secret });
    }

    return result;
  }

  function handleSearchSubmit() {
    applyFilters({ ...filters, search: searchDraft.trim() });
  }

  function handleReset() {
    setSearchDraft("");
    setSearchParams(new URLSearchParams());
  }

  const isFiltered =
    searchQuery !== "" || projectId !== "" || status !== DEFAULT_STATUS || sort !== DEFAULT_ORDER;

  const initialProjectId =
    ownedProjects.find((project) => project.id === projectId)?.id ?? ownedProjects[0]?.id ?? "";

  const totalPages = meta?.last_page ?? 1;

  return (
    <AppLayout user={user} title="Endpoints">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[2px] text-[#5D7063]">Workspace</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Endpoints</h1>
          <p className="mt-2 text-sm font-medium text-[#53665A]">
            Every destination that receives webhooks for your projects.
          </p>
        </div>

        {ownedProjects.length > 0 && (
          <Button variant="primary" size="xl" className="shrink-0" onClick={() => setShowCreate(true)}>
            Create endpoint
          </Button>
        )}
      </div>

      <section className="mt-8">
        {loading && endpoints.length === 0 && !isFiltered ? (
          <p className="text-sm font-medium text-[#607267]">Loading endpoints...</p>
        ) : error ? (
          <div className="rounded-[18px] border border-[#F1D5D5] bg-[#FBEEEE] px-6 py-8 text-sm font-medium text-[#B42318]">
            {error}
          </div>
        ) : endpoints.length === 0 && !isFiltered ? (
          <div className="rounded-[18px] border border-dashed border-[#C2D4C7] bg-white px-6 py-14 text-center shadow-[0_8px_30px_rgba(32,78,53,0.05)]">
            <h2 className="text-lg font-semibold tracking-tight">No endpoints yet</h2>
            <p className="mx-auto mt-2 max-w-md text-sm font-medium text-[#607267]">
              Endpoints define where HookYard delivers each project's webhooks. Create your first one to get
              started.
            </p>

            {ownedProjects.length > 0 && (
              <Button variant="primary" size="xl" className="mt-6" onClick={() => setShowCreate(true)}>
                Create endpoint
              </Button>
            )}
          </div>
        ) : (
          <>
            <EndpointFilterBar
              filters={filters}
              onFiltersChange={applyFilters}
              projects={projects}
              searchDraft={searchDraft}
              onSearchDraftChange={setSearchDraft}
              onSearchSubmit={handleSearchSubmit}
              onReset={handleReset}
              isFiltered={isFiltered}
            />

            {loading ? (
              <p className="mt-5 text-sm font-medium text-[#607267]">Loading endpoints...</p>
            ) : endpoints.length === 0 ? (
              <p className="mt-8 rounded-[18px] border border-dashed border-[#C2D4C7] bg-white px-6 py-10 text-center text-sm font-medium text-[#607267]">
                No endpoints match your filters.
              </p>
            ) : (
              <div className="mt-5 overflow-hidden rounded-[18px] border border-[#D8E3DB] bg-white shadow-[0_8px_30px_rgba(32,78,53,0.05)]">
                <div
                  className={`${ENDPOINT_ROW_GRID_COLS} hidden gap-x-4 border-b border-[#E4EBE6] px-5 py-3 text-[10px] font-semibold uppercase tracking-[2px] text-[#8A9990] lg:grid`}
                >
                  <span>Endpoint</span>
                  <span>Project</span>
                  <span>Status</span>
                  <span>Updated</span>
                  <span />
                </div>

                <div className="divide-y divide-[#E4EBE6]">
                  {endpoints.map((endpoint) => (
                    <EndpointCard key={endpoint.id} endpoint={endpoint} />
                  ))}
                </div>
              </div>
            )}

            {!loading && meta && (
              <div className="mt-4">
                <Pagination
                  page={page}
                  totalPages={totalPages}
                  totalCount={meta.total_count}
                  pageSize={meta.page_size}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </>
        )}
      </section>

      {showCreate && (
        <EndpointFormModal
          title="Create endpoint"
          submitLabel="Create endpoint"
          projects={ownedProjects}
          initialValues={{ projectId: initialProjectId, name: "", url: "", description: "", active: true, event_types: ["*"] }}
          lockProject={false}
          onSubmit={handleCreate}
          onClose={() => setShowCreate(false)}
        />
      )}

      {created && (
        <SigningSecretDialog
          secret={created.secret}
          onClose={() => {
            const pending = created;
            setCreated(null);
            navigate(`/projects/${pending.projectId}/endpoints/${pending.id}`);
          }}
        />
      )}
    </AppLayout>
  );
}

export default EndpointsPage;

import { useCallback, useEffect, useState } from "react";
import { useOutletContext, useSearchParams } from "react-router-dom";
import AppLayout from "../../../components/layout/AppLayout";
import MyInvitationsList from "../../../components/projects/MyInvitationsList";
import ProjectCard, { PROJECT_ROW_GRID_COLS } from "../../../components/projects/ProjectCard";
import ProjectFilterBar, {
  type ProjectFilters,
  type ProjectRoleFilter,
  type ProjectSortOption,
} from "../../../components/projects/ProjectFilterBar";
import ProjectFormModal from "../../../components/projects/ProjectFormModal";
import Button from "../../../components/ui/Button";
import Pagination from "../../../components/ui/Pagination";
import { useToast } from "../../../components/ui/toastContext";
import { useNotifications } from "../../../hooks/notificationsContext";
import {
  acceptInvitation,
  createProject,
  declineInvitation,
  getProjects,
  listMyInvitations,
  type ProjectQueryParams,
} from "../../../lib/projectApi";
import { readPageParam, setSearchParam } from "../../../lib/searchParams";
import type { PaginationMeta } from "../../../types/pagination";
import type { Project, ProjectInvitation } from "../../../types/project";
import type { CurrentUser } from "../../../types/user";

const DEFAULT_PROJECT_FILTERS: ProjectFilters = {
  search: "",
  role: "all",
  sort: "created_desc",
};

const ROLE_VALUES: ProjectRoleFilter[] = ["all", "owner", "maintainer"];
const SORT_VALUES: ProjectSortOption[] = ["created_desc", "created_asc", "name_asc"];

function readRole(value: string | null): ProjectRoleFilter {
  return ROLE_VALUES.includes(value as ProjectRoleFilter)
    ? (value as ProjectRoleFilter)
    : DEFAULT_PROJECT_FILTERS.role;
}

function readSort(value: string | null): ProjectSortOption {
  return SORT_VALUES.includes(value as ProjectSortOption)
    ? (value as ProjectSortOption)
    : DEFAULT_PROJECT_FILTERS.sort;
}

function toProjectQuery(filters: ProjectFilters, page: number): ProjectQueryParams {
  return {
    search: filters.search || undefined,
    role: filters.role === "all" ? undefined : filters.role,
    order: filters.sort,
    page,
  };
}

function ProjectsPage() {
  const user = useOutletContext<CurrentUser>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [projects, setProjects] = useState<Project[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [reloadToken, setReloadToken] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [inviteError, setInviteError] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [invitations, setInvitations] = useState<ProjectInvitation[]>([]);
  const [showCreate, setShowCreate] = useState(false);

  const searchQuery = searchParams.get("q") ?? "";
  const role = readRole(searchParams.get("role"));
  const sort = readSort(searchParams.get("sort"));
  const page = readPageParam(searchParams.get("page"));

  const filters: ProjectFilters = { search: searchQuery, role, sort };

  const [searchDraft, setSearchDraft] = useState(searchQuery);
  const [syncedSearch, setSyncedSearch] = useState(searchQuery);

  if (searchQuery !== syncedSearch) {
    setSyncedSearch(searchQuery);
    setSearchDraft(searchQuery);
  }

  const { changeVersion, reloadNotifications } = useNotifications();
  const { showToast } = useToast();

  const loadInvitations = useCallback(async () => {
    const result = await listMyInvitations();

    if (result.ok) setInvitations(result.data);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);

      const result = await getProjects(toProjectQuery({ search: searchQuery, role, sort }, page));

      if (cancelled) return;

      if (!result.ok) {
        setError(result.error);
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
  }, [searchQuery, role, sort, page, reloadToken, changeVersion, setSearchParams]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      await loadInvitations();

      if (cancelled) return;
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [changeVersion, loadInvitations]);

  function applyFilters(next: ProjectFilters) {
    setError("");
    const params = new URLSearchParams(searchParams);

    params.delete("page");
    setSearchParam(params, "q", next.search);
    setSearchParam(params, "role", next.role === DEFAULT_PROJECT_FILTERS.role ? "" : next.role);
    setSearchParam(params, "sort", next.sort === DEFAULT_PROJECT_FILTERS.sort ? "" : next.sort);

    setSearchParams(params);
  }

  function handlePageChange(nextPage: number) {
    const params = new URLSearchParams(searchParams);

    setSearchParam(params, "page", nextPage > 1 ? String(nextPage) : "");
    setSearchParams(params);
  }

  async function handleCreate(name: string) {
    const result = await createProject(name);

    if (result.ok) {
      setReloadToken((token) => token + 1);
      showToast({ type: "success", message: "Project created successfully" });
    }

    return result;
  }

  async function handleInvitationAction(invitation: ProjectInvitation, action: "accept" | "decline") {
    setInviteError("");
    setProcessingId(invitation.id);

    const result =
      action === "accept" ? await acceptInvitation(invitation.id) : await declineInvitation(invitation.id);

    if (!result.ok) {
      setInviteError(result.error);
      setProcessingId(null);
      return;
    }

    await reloadNotifications();
    showToast({
      type: "success",
      message: action === "accept" ? "Invitation accepted" : "Invitation declined",
    });
    setProcessingId(null);
  }

  function handleSearchSubmit() {
    applyFilters({ ...filters, search: searchDraft.trim() });
  }

  function handleReset() {
    setSearchDraft("");
    setSearchParams(new URLSearchParams());
  }

  const isFiltered =
    filters.search !== DEFAULT_PROJECT_FILTERS.search ||
    filters.role !== DEFAULT_PROJECT_FILTERS.role ||
    filters.sort !== DEFAULT_PROJECT_FILTERS.sort;

  return (
    <AppLayout user={user} title="Projects">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[2px] text-[#5D7063]">Workspace</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Projects</h1>
          <p className="mt-2 text-sm font-medium text-[#53665A]">
            Create projects, invite teammates and manage who can maintain each webhook workspace.
          </p>
        </div>

        <Button variant="primary" size="xl" className="shrink-0" onClick={() => setShowCreate(true)}>
          Create project
        </Button>
      </div>

      {invitations.length > 0 && (
        <section className="mt-8">
          <h2 className="text-xs font-semibold uppercase tracking-[2px] text-[#5D7063]">Pending invitations</h2>

          {inviteError && (
            <p className="mt-3 rounded-xl bg-[#FBEEEE] px-4 py-3 text-sm text-[#B42318]">{inviteError}</p>
          )}

          <div className="mt-3">
            <MyInvitationsList
              invitations={invitations}
              processingId={processingId}
              onInvitationAction={handleInvitationAction}
            />
          </div>
        </section>
      )}

      <section className="mt-8">
        {loading && projects.length === 0 && !isFiltered ? (
          <p className="text-sm font-medium text-[#607267]">Loading projects...</p>
        ) : error ? (
          <div className="rounded-[18px] border border-[#F1D5D5] bg-[#FBEEEE] px-6 py-8 text-sm font-medium text-[#B42318]">
            {error}
          </div>
        ) : projects.length === 0 && !isFiltered ? (
          <div className="rounded-[18px] border border-dashed border-[#C2D4C7] bg-white px-6 py-14 text-center shadow-[0_8px_30px_rgba(32,78,53,0.05)]">
            <h3 className="text-lg font-semibold tracking-tight">No projects yet</h3>
            <p className="mx-auto mt-2 max-w-md text-sm font-medium text-[#607267]">
              Projects keep endpoints, deliveries and teammates together. Create your first one to get started.
            </p>

            <Button variant="primary" size="xl" className="mt-6" onClick={() => setShowCreate(true)}>
              Create project
            </Button>
          </div>
        ) : (
          <>
            <ProjectFilterBar
              filters={filters}
              onFiltersChange={applyFilters}
              searchDraft={searchDraft}
              onSearchDraftChange={setSearchDraft}
              onSearchSubmit={handleSearchSubmit}
              onReset={handleReset}
              isFiltered={isFiltered}
            />

            {loading ? (
              <p className="mt-5 text-sm font-medium text-[#607267]">Loading projects...</p>
            ) : projects.length === 0 ? (
              <p className="mt-8 rounded-[18px] border border-dashed border-[#C2D4C7] bg-white px-6 py-10 text-center text-sm font-medium text-[#607267]">
                No projects match your filters.
              </p>
            ) : (
              <div className="mt-5 overflow-hidden rounded-[18px] border border-[#D8E3DB] bg-white shadow-[0_8px_30px_rgba(32,78,53,0.05)]">
                <div
                  className={`${PROJECT_ROW_GRID_COLS} hidden gap-x-4 border-b border-[#E4EBE6] px-5 py-3 text-[10px] font-semibold uppercase tracking-[2px] text-[#8A9990] lg:grid`}
                >
                  <span>Project</span>
                  <span>Role</span>
                  <span>Endpoints</span>
                  <span>Events</span>
                  <span>Success</span>
                  <span>Failed</span>
                  <span>Created</span>
                  <span />
                </div>

                <div className="divide-y divide-[#E4EBE6]">
                  {projects.map((project) => (
                    <ProjectCard key={project.id} project={project} />
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

      {showCreate && (
        <ProjectFormModal
          title="Create project"
          submitLabel="Create project"
          initialName=""
          onSubmit={handleCreate}
          onClose={() => setShowCreate(false)}
        />
      )}
    </AppLayout>
  );
}

export default ProjectsPage;

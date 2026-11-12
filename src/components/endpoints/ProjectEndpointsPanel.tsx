import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createEndpoint, listProjectEndpoints } from "../../lib/endpointApi";
import type { Endpoint } from "../../types/endpoint";
import type { PaginationMeta } from "../../types/pagination";
import type { Project } from "../../types/project";
import Button from "../ui/Button";
import Pagination from "../ui/Pagination";
import { useToast } from "../ui/toastContext";
import EndpointCircuitBadge from "./EndpointCircuitBadge";
import EndpointFormModal, { type EndpointFormValues } from "./EndpointFormModal";
import EndpointStatusBadge from "./EndpointStatusBadge";
import SigningSecretDialog from "./SigningSecretDialog";

type ProjectEndpointsPanelProps = {
  project: Project;
};

type CreatedEndpointSecret = {
  id: string;
  secret: string;
};

const PROJECT_ENDPOINTS_PAGE_SIZE = 5;

function ProjectEndpointsPanel({ project }: ProjectEndpointsPanelProps) {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [endpoints, setEndpoints] = useState<Endpoint[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [created, setCreated] = useState<CreatedEndpointSecret | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);

      const result = await listProjectEndpoints(project.id, page, PROJECT_ENDPOINTS_PAGE_SIZE);

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
  }, [project.id, page]);

  async function handleCreate(values: EndpointFormValues) {
    const { projectId, ...input } = values;
    const result = await createEndpoint(projectId, input);

    if (result.ok) {
      showToast({ type: "success", message: "Endpoint created successfully" });
      setCreated({ id: result.data.id, secret: result.data.signing_secret });
    }

    return result;
  }

  const isOwner = project.current_user_role === "owner";

  return (
    <section className="min-w-0 rounded-[18px] border border-[#D8E3DB] bg-white p-5 shadow-[0_8px_30px_rgba(32,78,53,0.05)] lg:col-span-2">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-sm font-semibold tracking-tight text-[#1F2A24]">Endpoints</h2>

        {isOwner && (
          <Button variant="primary" size="sm" onClick={() => setShowCreate(true)}>
            Create endpoint
          </Button>
        )}
      </div>

      {loading ? (
        <p className="mt-4 text-sm font-medium text-[#607267]">Loading endpoints...</p>
      ) : error ? (
        <p className="mt-4 rounded-xl bg-[#FBEEEE] px-4 py-3 text-sm text-[#B42318]">{error}</p>
      ) : endpoints.length === 0 ? (
        <div className="mt-4 rounded-[14px] border border-dashed border-[#D8E3DB] px-5 py-8 text-center">
          <p className="text-sm font-semibold text-[#1F2A24]">No endpoints yet</p>
          <p className="mt-1 text-xs font-medium text-[#8A9990]">
            Endpoints define where HookYard delivers this project's webhooks.
          </p>
        </div>
      ) : (
        <>
          <div className="mt-3 divide-y divide-[#E4EBE6]">
            {endpoints.map((endpoint) => (
              <Link
                key={endpoint.id}
                to={`/projects/${project.id}/endpoints/${endpoint.id}`}
                state={{ from: `/projects/${project.id}`, fromLabel: project.name }}
                className="flex min-w-0 items-center justify-between gap-4 py-3 transition hover:opacity-80"
              >
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold text-[#1F2A24]">{endpoint.name}</span>
                  <span className="block truncate text-xs font-medium text-[#8A9990]">{endpoint.url}</span>
                </span>

                <span className="flex min-w-0 flex-wrap items-center justify-end gap-2">
                  <EndpointStatusBadge active={endpoint.active} archived={Boolean(endpoint.archived_at)} />
                  <EndpointCircuitBadge circuit={endpoint.circuit} archived={Boolean(endpoint.archived_at)} />
                </span>
              </Link>
            ))}
          </div>

          {meta && (
            <div className="mt-4 border-t border-[#E4EBE6] pt-4">
              <Pagination
                page={page}
                totalPages={meta.last_page}
                totalCount={meta.total_count}
                pageSize={meta.page_size}
                onPageChange={setPage}
              />
            </div>
          )}
        </>
      )}

      {showCreate && (
        <EndpointFormModal
          title="Create endpoint"
          submitLabel="Create endpoint"
          projects={[project]}
          initialValues={{ projectId: project.id, name: "", url: "", description: "", active: true, event_types: ["*"] }}
          lockProject
          onSubmit={handleCreate}
          onClose={() => setShowCreate(false)}
        />
      )}

      {created && (
        <SigningSecretDialog
          secret={created.secret}
          onClose={() => {
            setCreated(null);
            navigate(`/projects/${project.id}/endpoints/${created.id}`, {
              state: { from: `/projects/${project.id}`, fromLabel: project.name },
            });
          }}
        />
      )}
    </section>
  );
}

export default ProjectEndpointsPanel;

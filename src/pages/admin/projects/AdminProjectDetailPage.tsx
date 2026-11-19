import { useEffect, useState } from "react";
import { Link, useNavigate, useOutletContext, useParams } from "react-router-dom";
import AdminBreadcrumbs from "../../../components/admin/AdminBreadcrumbs";
import AppLayout from "../../../components/layout/AppLayout";
import Badge from "../../../components/ui/Badge";
import Button from "../../../components/ui/Button";
import PlanBadge from "../../../components/plan/PlanBadge";
import { getAdminAccount, getAdminEndpoints, getAdminProject } from "../../../lib/adminApi";
import { formatDateTime } from "../../../lib/dateFormat";
import type { AdminEndpoint, AdminProjectDetail } from "../../../types/admin";
import type { CurrentUser } from "../../../types/user";

function AdminProjectDetailPage() {
  const user = useOutletContext<CurrentUser>();
  const { projectId } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState<AdminProjectDetail | null>(null);
  const [endpoints, setEndpoints] = useState<AdminEndpoint[]>([]);
  const [billingIsAdmin, setBillingIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setNotFound(false);
      setError("");
      setBillingIsAdmin(false);

      if (!projectId) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      const [projectResult, endpointsResult] = await Promise.all([
        getAdminProject(projectId),
        getAdminEndpoints({ projectId, perPage: 100, order: "name_asc" }),
      ]);

      if (cancelled) return;

      if (!projectResult.ok) {
        setProject(null);
        setNotFound(projectResult.status === 403 || projectResult.status === 404);
        setError(projectResult.status === 403 || projectResult.status === 404 ? "" : projectResult.error);
        setLoading(false);
        return;
      }

      setProject(projectResult.data);
      setEndpoints(endpointsResult.ok ? endpointsResult.data.data : []);

      if (projectResult.data.account) {
        const accountResult = await getAdminAccount(projectResult.data.account.id);

        if (!cancelled && accountResult.ok) {
          setBillingIsAdmin(accountResult.data.roles.includes("admin"));
        }
      }

      setLoading(false);
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [projectId]);

  if (loading) {
    return (
      <AppLayout user={user} title="Project">
        <div className="space-y-4">
          <span className="block h-4 w-48 animate-pulse rounded bg-[#E4EBE6]" />
          <span className="block h-9 w-72 animate-pulse rounded bg-[#E4EBE6]" />
          <div className="grid gap-4 lg:grid-cols-2">
            <span className="block h-40 animate-pulse rounded-[18px] bg-[#E4EBE6]" />
            <span className="block h-40 animate-pulse rounded-[18px] bg-[#E4EBE6]" />
          </div>
        </div>
      </AppLayout>
    );
  }

  if (notFound) {
    return (
      <AppLayout user={user} title="Project">
        <div className="rounded-[18px] border border-[#E4EBE6] bg-white px-6 py-10 text-center">
          <p className="text-sm font-semibold text-[#1F2A24]">Project not found</p>
          <p className="mt-2 text-sm font-medium text-[#718078]">
            This project does not exist or you do not have access to it.
          </p>
          <Button variant="secondary" size="md" className="mt-5" onClick={() => navigate("/admin/projects")}>
            Back to projects
          </Button>
        </div>
      </AppLayout>
    );
  }

  if (error || !project) {
    return (
      <AppLayout user={user} title="Project">
        <div className="rounded-[18px] border border-[#F1D5D5] bg-[#FBEEEE] px-6 py-8">
          <p className="text-sm font-medium text-[#B42318]">{error || "Project could not be loaded."}</p>
          <Button variant="secondary" size="md" className="mt-4" onClick={() => navigate("/admin/projects")}>
            Back to projects
          </Button>
        </div>
      </AppLayout>
    );
  }

  const summary = project.endpoint_summary;

  return (
    <AppLayout user={user} title="Project">
      <AdminBreadcrumbs
        items={[
          { label: "Admin", to: "/admin" },
          { label: "Accounts", to: "/admin/accounts" },
          ...(project.account
            ? [{ label: project.account.email, to: `/admin/accounts/${project.account.id}` }]
            : []),
          { label: "Projects", to: "/admin/projects" },
          { label: project.name },
        ]}
      />

      <header className="mt-6">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-semibold tracking-tight">{project.name}</h1>
          {billingIsAdmin ? (
            <Badge tone="neutral">Platform administrator</Badge>
          ) : project.plan ? (
            <PlanBadge plan={project.plan} />
          ) : (
            <span className="text-sm font-medium text-[#8A9990]">No plan</span>
          )}
        </div>
        <p className="mt-2 text-sm font-medium text-[#53665A]">Billing context for this customer project.</p>
      </header>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <section className="rounded-[18px] border border-[#D8E3DB] bg-white p-5 shadow-[0_8px_30px_rgba(32,78,53,0.05)]">
          <h2 className="text-sm font-semibold tracking-tight text-[#1F2A24]">Billing account</h2>

          {project.account ? (
            <Link
              to={`/admin/accounts/${project.account.id}`}
              className="mt-3 block rounded-xl border border-[#E4EBE6] bg-[#F7FAF8] px-4 py-3 transition hover:border-[#23613F]"
            >
              <p className="text-[10px] font-semibold uppercase tracking-[2px] text-[#8A9990]">Account</p>
              <p className="mt-1 truncate text-sm font-semibold text-[#23613F]">{project.account.email}</p>
            </Link>
          ) : (
            <p className="mt-3 text-sm font-medium text-[#718078]">No billing account is assigned.</p>
          )}

          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-[#E4EBE6] px-4 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-[2px] text-[#8A9990]">Members</p>
              <p className="mt-1 text-lg font-semibold text-[#1F2A24]">{project.member_count}</p>
            </div>
            <div className="rounded-xl border border-[#E4EBE6] px-4 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-[2px] text-[#8A9990]">Updated</p>
              <p className="mt-1 text-sm font-semibold text-[#1F2A24]">{formatDateTime(project.updated_at)}</p>
            </div>
          </div>
        </section>

        <section className="rounded-[18px] border border-[#D8E3DB] bg-white p-5 shadow-[0_8px_30px_rgba(32,78,53,0.05)]">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-semibold tracking-tight text-[#1F2A24]">Endpoint summary</h2>
            <p className="text-xs font-semibold text-[#8A9990]">{summary.total} total</p>
          </div>

          <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div>
              <dt className="text-[10px] font-semibold uppercase tracking-[2px] text-[#8A9990]">Active</dt>
              <dd className="mt-1 text-sm font-semibold text-[#23613F]">{summary.active}</dd>
            </div>
            <div>
              <dt className="text-[10px] font-semibold uppercase tracking-[2px] text-[#8A9990]">Paused</dt>
              <dd className="mt-1 text-sm font-semibold text-[#1F2A24]">{summary.paused}</dd>
            </div>
            <div>
              <dt className="text-[10px] font-semibold uppercase tracking-[2px] text-[#8A9990]">Archived</dt>
              <dd className="mt-1 text-sm font-semibold text-[#1F2A24]">{summary.archived}</dd>
            </div>
            <div>
              <dt className="text-[10px] font-semibold uppercase tracking-[2px] text-[#8A9990]">Circuit open</dt>
              <dd className="mt-1 text-sm font-semibold text-[#9A6B1F]">{summary.circuit_open}</dd>
            </div>
            <div>
              <dt className="text-[10px] font-semibold uppercase tracking-[2px] text-[#8A9990]">Disabled</dt>
              <dd className="mt-1 text-sm font-semibold text-[#B42318]">{summary.disabled}</dd>
            </div>
            <div>
              <dt className="text-[10px] font-semibold uppercase tracking-[2px] text-[#8A9990]">Queued</dt>
              <dd className="mt-1 text-sm font-semibold text-[#1F2A24]">{summary.queued_messages}</dd>
            </div>
          </dl>
        </section>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          to={`/admin/endpoints?project_id=${project.id}`}
          className="inline-flex h-11 cursor-pointer items-center justify-center rounded-xl bg-[#214E35] px-5 text-sm font-semibold text-white transition hover:bg-[#173D28]"
        >
          View endpoints
        </Link>

        <Link
          to={`/admin/deliveries?project_id=${project.id}`}
          className="inline-flex h-11 cursor-pointer items-center justify-center rounded-xl border border-[#C9DACE] px-5 text-sm font-semibold text-[#405348] transition hover:bg-[#F1F6F2]"
        >
          View deliveries
        </Link>
      </div>

      <section className="mt-6 rounded-[18px] border border-[#D8E3DB] bg-white p-5 shadow-[0_8px_30px_rgba(32,78,53,0.05)]">
        <h2 className="text-sm font-semibold tracking-tight text-[#1F2A24]">Endpoints</h2>

        {endpoints.length === 0 ? (
          <p className="mt-4 text-sm font-medium text-[#718078]">This project has no endpoints.</p>
        ) : (
          <ul className="mt-4 divide-y divide-[#E4EBE6]">
            {endpoints.map((endpoint) => (
              <li key={endpoint.id}>
                <Link
                  to={`/admin/endpoints/${endpoint.id}`}
                  className="flex items-center justify-between gap-3 py-3 text-sm font-semibold text-[#23613F] transition hover:underline"
                >
                  <span className="truncate">{endpoint.name}</span>
                  <span className="shrink-0 text-[#8A9990]">→</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </AppLayout>
  );
}

export default AdminProjectDetailPage;

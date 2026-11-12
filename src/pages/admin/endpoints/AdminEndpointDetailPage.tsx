import { useEffect, useState } from "react";
import { Link, useNavigate, useOutletContext, useParams } from "react-router-dom";
import AdminBreadcrumbs from "../../../components/admin/AdminBreadcrumbs";
import EndpointCircuitBadge from "../../../components/endpoints/EndpointCircuitBadge";
import EndpointStatusBadge from "../../../components/endpoints/EndpointStatusBadge";
import AppLayout from "../../../components/layout/AppLayout";
import Button from "../../../components/ui/Button";
import { getAdminEndpoint } from "../../../lib/adminApi";
import { formatDateTime } from "../../../lib/dateFormat";
import type { AdminEndpointDetail } from "../../../types/admin";
import type { CurrentUser } from "../../../types/user";

function AdminEndpointDetailPage() {
  const user = useOutletContext<CurrentUser>();
  const { endpointId } = useParams();
  const navigate = useNavigate();

  const [endpoint, setEndpoint] = useState<AdminEndpointDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setNotFound(false);
      setError("");

      if (!endpointId) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      const result = await getAdminEndpoint(endpointId);

      if (cancelled) return;

      if (!result.ok) {
        setEndpoint(null);
        setNotFound(result.status === 403 || result.status === 404);
        setError(result.status === 403 || result.status === 404 ? "" : result.error);
        setLoading(false);
        return;
      }

      setEndpoint(result.data);
      setLoading(false);
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [endpointId]);

  if (loading) {
    return (
      <AppLayout user={user} title="Endpoint">
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
      <AppLayout user={user} title="Endpoint">
        <div className="rounded-[18px] border border-[#E4EBE6] bg-white px-6 py-10 text-center">
          <p className="text-sm font-semibold text-[#1F2A24]">Endpoint not found</p>
          <p className="mt-2 text-sm font-medium text-[#718078]">
            This endpoint does not exist or you do not have access to it.
          </p>
          <Button variant="secondary" size="md" className="mt-5" onClick={() => navigate("/admin/endpoints")}>
            Back to endpoints
          </Button>
        </div>
      </AppLayout>
    );
  }

  if (error || !endpoint) {
    return (
      <AppLayout user={user} title="Endpoint">
        <div className="rounded-[18px] border border-[#F1D5D5] bg-[#FBEEEE] px-6 py-8">
          <p className="text-sm font-medium text-[#B42318]">{error || "Endpoint could not be loaded."}</p>
          <Button variant="secondary" size="md" className="mt-4" onClick={() => navigate("/admin/endpoints")}>
            Back to endpoints
          </Button>
        </div>
      </AppLayout>
    );
  }

  const archived = Boolean(endpoint.archived_at);
  const summary = endpoint.delivery_summary;

  return (
    <AppLayout user={user} title="Endpoint">
      <AdminBreadcrumbs
        items={[
          { label: "Admin", to: "/admin" },
          { label: "Accounts", to: "/admin/accounts" },
          ...(endpoint.account
            ? [{ label: endpoint.account.email, to: `/admin/accounts/${endpoint.account.id}` }]
            : []),
          { label: "Projects", to: "/admin/projects" },
          { label: endpoint.project.name, to: `/admin/projects/${endpoint.project.id}` },
          { label: "Endpoints", to: "/admin/endpoints" },
          { label: endpoint.name },
        ]}
      />

      <header className="mt-6">
        <h1 className="text-3xl font-semibold tracking-tight">{endpoint.name}</h1>
        <p className="mt-2 break-all text-sm font-medium text-[#53665A]">{endpoint.url}</p>
      </header>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <section className="rounded-[18px] border border-[#D8E3DB] bg-white p-5 shadow-[0_8px_30px_rgba(32,78,53,0.05)]">
          <h2 className="text-sm font-semibold tracking-tight text-[#1F2A24]">Endpoint details</h2>

          <dl className="mt-4 space-y-3">
            <div>
              <dt className="text-[10px] font-semibold uppercase tracking-[2px] text-[#8A9990]">Status</dt>
              <dd className="mt-1">
                <EndpointStatusBadge active={endpoint.active} archived={archived} />
              </dd>
            </div>

            <div>
              <dt className="text-[10px] font-semibold uppercase tracking-[2px] text-[#8A9990]">Circuit state</dt>
              <dd className="mt-1">
                <EndpointCircuitBadge circuit={{ state: endpoint.circuit_state }} archived={archived} showEnabled />
              </dd>
            </div>

            {endpoint.circuit_opened_at && (
              <div>
                <dt className="text-[10px] font-semibold uppercase tracking-[2px] text-[#8A9990]">Circuit opened</dt>
                <dd className="mt-1 text-sm font-semibold text-[#1F2A24]">{formatDateTime(endpoint.circuit_opened_at)}</dd>
              </div>
            )}

            <div>
              <dt className="text-[10px] font-semibold uppercase tracking-[2px] text-[#8A9990]">Queued messages</dt>
              <dd className="mt-1 text-sm font-semibold text-[#1F2A24]">{endpoint.queued_message_count}</dd>
            </div>

            <div>
              <dt className="text-[10px] font-semibold uppercase tracking-[2px] text-[#8A9990]">Event types</dt>
              <dd className="mt-1 text-sm font-medium text-[#405348]">
                {endpoint.event_types.length > 0 ? endpoint.event_types.join(", ") : "—"}
              </dd>
            </div>
          </dl>
        </section>

        <section className="rounded-[18px] border border-[#D8E3DB] bg-white p-5 shadow-[0_8px_30px_rgba(32,78,53,0.05)]">
          <h2 className="text-sm font-semibold tracking-tight text-[#1F2A24]">Delivery summary</h2>

          <dl className="mt-4 grid grid-cols-3 gap-3">
            <div className="rounded-xl border border-[#E4EBE6] px-4 py-3">
              <dt className="text-[10px] font-semibold uppercase tracking-[2px] text-[#8A9990]">Total</dt>
              <dd className="mt-1 text-lg font-semibold text-[#1F2A24]">{summary.total}</dd>
            </div>
            <div className="rounded-xl border border-[#E4EBE6] px-4 py-3">
              <dt className="text-[10px] font-semibold uppercase tracking-[2px] text-[#8A9990]">Last 7 days</dt>
              <dd className="mt-1 text-lg font-semibold text-[#1F2A24]">{summary.recent}</dd>
            </div>
            <div className="rounded-xl border border-[#E4EBE6] px-4 py-3">
              <dt className="text-[10px] font-semibold uppercase tracking-[2px] text-[#8A9990]">Held</dt>
              <dd className="mt-1 text-lg font-semibold text-[#9A6B1F]">{summary.held}</dd>
            </div>
          </dl>

          <div className="mt-4 space-y-2 text-sm font-medium text-[#405348]">
            <p>
              Project:{" "}
              <Link to={`/admin/projects/${endpoint.project.id}`} className="font-semibold text-[#23613F] hover:underline">
                {endpoint.project.name}
              </Link>
            </p>

            {endpoint.account && (
              <p>
                Account:{" "}
                <Link to={`/admin/accounts/${endpoint.account.id}`} className="font-semibold text-[#23613F] hover:underline">
                  {endpoint.account.email}
                </Link>
              </p>
            )}
          </div>
        </section>
      </div>

      <div className="mt-6">
        <Link
          to={`/admin/deliveries?endpoint_id=${endpoint.id}`}
          className="inline-flex h-11 cursor-pointer items-center justify-center rounded-xl bg-[#214E35] px-5 text-sm font-semibold text-white transition hover:bg-[#173D28]"
        >
          View deliveries
        </Link>
      </div>
    </AppLayout>
  );
}

export default AdminEndpointDetailPage;

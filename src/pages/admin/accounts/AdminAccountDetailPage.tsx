import { useEffect, useState } from "react";
import { Link, useNavigate, useOutletContext, useParams } from "react-router-dom";
import AdminBreadcrumbs from "../../../components/admin/AdminBreadcrumbs";
import AdminChangePlanModal from "../../../components/admin/AdminChangePlanModal";
import AppLayout from "../../../components/layout/AppLayout";
import Badge from "../../../components/ui/Badge";
import Button from "../../../components/ui/Button";
import PlanBadge from "../../../components/plan/PlanBadge";
import { useToast } from "../../../components/ui/toastContext";
import { changeAdminAccountPlan, getAdminAccount } from "../../../lib/adminApi";
import { formatDateTime } from "../../../lib/dateFormat";
import { planLabel } from "../../../lib/plan";
import type { AdminSupportAccountDetail } from "../../../types/admin";
import type { Plan } from "../../../types/plan";
import type { CurrentUser } from "../../../types/user";

function AdminAccountDetailPage() {
  const user = useOutletContext<CurrentUser>();
  const { accountId } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [account, setAccount] = useState<AdminSupportAccountDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notFound, setNotFound] = useState(false);
  const [reloadToken, setReloadToken] = useState(0);

  const [planModalOpen, setPlanModalOpen] = useState(false);
  const [planPending, setPlanPending] = useState(false);
  const [planError, setPlanError] = useState("");
  const [planSuccess, setPlanSuccess] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setNotFound(false);
      setError("");

      if (!accountId) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      const result = await getAdminAccount(accountId);

      if (cancelled) return;

      if (!result.ok) {
        setAccount(null);
        setNotFound(result.status === 403 || result.status === 404);
        setError(result.status === 403 || result.status === 404 ? "" : result.error);
        setLoading(false);
        return;
      }

      setAccount(result.data);
      setLoading(false);
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [accountId, reloadToken]);

  async function handleChangePlan(plan: Plan) {
    if (!account) return;

    setPlanPending(true);
    setPlanError("");
    setPlanSuccess("");

    const result = await changeAdminAccountPlan(account.id, plan);

    if (!result.ok) {
      setPlanError(result.error);
      setPlanPending(false);
      return;
    }

    setAccount({ ...account, plan: result.data.plan });
    setPlanPending(false);
    setPlanModalOpen(false);
    setPlanSuccess(`${result.data.name} is now on the ${planLabel(result.data.plan)} plan.`);
    showToast({ type: "success", message: `${result.data.name} moved to the ${planLabel(result.data.plan)} plan` });
  }

  if (loading) {
    return (
      <AppLayout user={user} title="Account">
        <div className="space-y-4">
          <span className="block h-4 w-48 animate-pulse rounded bg-[#E4EBE6]" />
          <span className="block h-9 w-72 animate-pulse rounded bg-[#E4EBE6]" />
          <div className="grid gap-4 lg:grid-cols-2">
            <span className="block h-48 animate-pulse rounded-[18px] bg-[#E4EBE6]" />
            <span className="block h-48 animate-pulse rounded-[18px] bg-[#E4EBE6]" />
          </div>
        </div>
      </AppLayout>
    );
  }

  if (notFound) {
    return (
      <AppLayout user={user} title="Account">
        <div className="rounded-[18px] border border-[#E4EBE6] bg-white px-6 py-10 text-center">
          <p className="text-sm font-semibold text-[#1F2A24]">Account not found</p>
          <p className="mt-2 text-sm font-medium text-[#718078]">
            This account does not exist or you do not have access to it.
          </p>
          <Button variant="secondary" size="md" className="mt-5" onClick={() => navigate("/admin/accounts")}>
            Back to accounts
          </Button>
        </div>
      </AppLayout>
    );
  }

  if (error || !account) {
    return (
      <AppLayout user={user} title="Account">
        <div className="rounded-[18px] border border-[#F1D5D5] bg-[#FBEEEE] px-6 py-8">
          <p className="text-sm font-medium text-[#B42318]">{error || "Account could not be loaded."}</p>
          <Button variant="secondary" size="md" className="mt-4" onClick={() => setReloadToken((token) => token + 1)}>
            Try again
          </Button>
        </div>
      </AppLayout>
    );
  }

  const isAdminTarget = account.roles.includes("admin");
  const lastSignIn = account.last_sign_in_at ? formatDateTime(account.last_sign_in_at) : "Never";

  return (
    <AppLayout user={user} title="Account">
      <AdminBreadcrumbs
        items={[
          { label: "Admin", to: "/admin" },
          { label: "Accounts", to: "/admin/accounts" },
          { label: account.name },
        ]}
      />

      <header className="mt-6">
        <h1 className="text-3xl font-semibold tracking-tight">{account.name}</h1>
        <p className="mt-2 text-sm font-medium text-[#53665A]">{account.email}</p>
      </header>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <section className="rounded-[18px] border border-[#D8E3DB] bg-white p-5 shadow-[0_8px_30px_rgba(32,78,53,0.05)]">
          <h2 className="text-sm font-semibold tracking-tight text-[#1F2A24]">Account details</h2>

          <dl className="mt-4 space-y-3">
            <div>
              <dt className="text-[10px] font-semibold uppercase tracking-[2px] text-[#8A9990]">Roles</dt>
              <dd className="mt-1 flex flex-wrap gap-1.5">
                {account.roles.length === 0 ? (
                  <Badge tone="neutral">None</Badge>
                ) : (
                  account.roles.map((role) => (
                    <Badge key={role} tone={role === "admin" ? "purple" : "blue"}>
                      {role === "admin" ? "Admin" : "Support"}
                    </Badge>
                  ))
                )}
              </dd>
            </div>

            <div>
              <dt className="text-[10px] font-semibold uppercase tracking-[2px] text-[#8A9990]">Confirmed</dt>
              <dd className="mt-1">
                {account.confirmed ? <Badge tone="green" dot>Confirmed</Badge> : <Badge tone="neutral">Unconfirmed</Badge>}
              </dd>
            </div>

            <div>
              <dt className="text-[10px] font-semibold uppercase tracking-[2px] text-[#8A9990]">Created</dt>
              <dd className="mt-1 text-sm font-semibold text-[#1F2A24]">{formatDateTime(account.created_at)}</dd>
            </div>

            <div>
              <dt className="text-[10px] font-semibold uppercase tracking-[2px] text-[#8A9990]">Last sign in</dt>
              <dd className="mt-1 text-sm font-semibold text-[#1F2A24]">{lastSignIn}</dd>
            </div>

            <div>
              <dt className="text-[10px] font-semibold uppercase tracking-[2px] text-[#8A9990]">Sign-in count</dt>
              <dd className="mt-1 text-sm font-semibold text-[#1F2A24]">{account.sign_in_count}</dd>
            </div>
          </dl>
        </section>

        <section className="rounded-[18px] border border-[#D8E3DB] bg-white p-5 shadow-[0_8px_30px_rgba(32,78,53,0.05)]">
          <h2 className="text-sm font-semibold tracking-tight text-[#1F2A24]">Plan</h2>

          {isAdminTarget ? (
            <p className="mt-3 rounded-xl bg-[#F7FAF8] px-4 py-3 text-sm font-medium text-[#53665A]">
              Platform administrator accounts do not use customer subscription plans.
            </p>
          ) : (
            <>
              <div className="mt-3 flex items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[2px] text-[#8A9990]">Current plan</p>
                  <div className="mt-1">
                    <PlanBadge plan={account.plan} />
                  </div>
                </div>

                <Button variant="secondary" size="md" onClick={() => setPlanModalOpen(true)}>
                  Change plan
                </Button>
              </div>

              <p className="mt-3 text-xs font-medium text-[#718078]">
                Changing this plan applies to projects billed to this account.
              </p>
            </>
          )}

          {planSuccess && (
            <p role="status" className="mt-3 rounded-xl bg-[#EAF5EE] px-4 py-3 text-sm font-medium text-[#23613F]">
              {planSuccess}
            </p>
          )}
        </section>
      </div>

      <section className="mt-6 rounded-[18px] border border-[#D8E3DB] bg-white p-5 shadow-[0_8px_30px_rgba(32,78,53,0.05)]">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-semibold tracking-tight text-[#1F2A24]">Owned projects</h2>
          <p className="text-xs font-semibold text-[#8A9990]">{account.owned_project_count} total</p>
        </div>

        {account.owned_projects.length === 0 ? (
          <p className="mt-4 text-sm font-medium text-[#718078]">This account does not own any projects.</p>
        ) : (
          <ul className="mt-4 divide-y divide-[#E4EBE6]">
            {account.owned_projects.map((project) => (
              <li key={project.id}>
                <Link
                  to={`/admin/projects/${project.id}`}
                  className="flex items-center justify-between gap-3 py-3 text-sm font-semibold text-[#23613F] transition hover:underline"
                >
                  <span className="truncate">{project.name}</span>
                  <span className="shrink-0 text-[#8A9990]">→</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {planModalOpen && (
        <AdminChangePlanModal
          account={account}
          pending={planPending}
          error={planError}
          onSubmit={handleChangePlan}
          onClose={() => {
            if (!planPending) {
              setPlanModalOpen(false);
              setPlanError("");
            }
          }}
        />
      )}
    </AppLayout>
  );
}

export default AdminAccountDetailPage;

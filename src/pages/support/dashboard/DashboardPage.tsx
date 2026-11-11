import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate, useOutletContext } from "react-router-dom";
import AlertTriangleIcon from "../../../components/icons/AlertTriangleIcon";
import CheckCircleIcon from "../../../components/icons/CheckCircleIcon";
import ChevronRightIcon from "../../../components/icons/ChevronRightIcon";
import RefreshIcon from "../../../components/icons/RefreshIcon";
import AppLayout from "../../../components/layout/AppLayout";
import Button from "../../../components/ui/Button";
import { getUserDashboard } from "../../../lib/dashboardApi";
import { formatDateTime } from "../../../lib/dateFormat";
import { formatCount } from "../../../lib/numberFormat";
import type { Plan } from "../../../types/plan";
import type { CurrentUser } from "../../../types/user";
import type { UserDashboard, UserDashboardProject } from "../../../types/userDashboard";

type Tone = "green" | "red" | "amber" | "neutral";

const TONE_TEXT: Record<Tone, string> = {
  green: "text-[#23613F]",
  red: "text-[#B42318]",
  amber: "text-[#8A5D14]",
  neutral: "text-[#53665A]",
};

const TONE_DOT: Record<Tone, string> = {
  green: "bg-[#2F9E63]",
  red: "bg-[#D92D20]",
  amber: "bg-[#E8A33D]",
  neutral: "bg-[#8A9990]",
};

const TONE_ICON: Record<Tone, string> = {
  green: "text-[#23613F]",
  red: "text-[#B42318]",
  amber: "text-[#8A5D14]",
  neutral: "text-[#718078]",
};

function formatMetric(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) return "—";
  return formatCount(value);
}

function formatRate(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) return "—";
  return `${value}%`;
}

function getHealthStatus(dashboard: UserDashboard): { tone: Tone; label: string } {
  const { delivery_health: health, needs_attention } = dashboard;

  if (health.failed > 0) return { tone: "red", label: "Needs attention" };
  if (health.held > 0 || health.retries_due > 0 || needs_attention.open_circuit_endpoints > 0) {
    return { tone: "amber", label: "Needs attention" };
  }

  return { tone: "green", label: "Healthy" };
}

type HealthRowProps = {
  to: string;
  label: string;
  value: string;
  valueTone: Tone;
};

function HealthRow({ to, label, value, valueTone }: HealthRowProps) {
  return (
    <Link
      to={to}
      className="flex min-h-11 items-center justify-between gap-3 rounded-lg px-2 py-2.5 transition hover:bg-[#F7FAF8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#23613F]/30"
    >
      <span className="text-sm font-semibold text-[#1F2A24]">{label}</span>

      <span className="flex items-center gap-2">
        <span className={`text-sm font-semibold ${TONE_TEXT[valueTone]}`}>{value}</span>
        <ChevronRightIcon className="h-4 w-4 text-[#8A9990]" />
      </span>
    </Link>
  );
}

type AttentionRowProps = {
  to: string;
  sentence: string;
  value: string;
  tone: Tone;
};

function AttentionRow({ to, sentence, value, tone }: AttentionRowProps) {
  return (
    <Link
      to={to}
      className="flex min-h-11 items-center justify-between gap-3 rounded-lg px-2 py-2.5 transition hover:bg-[#F7FAF8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#23613F]/30"
    >
      <span className="flex min-w-0 items-center gap-2.5">
        <AlertTriangleIcon className={`h-4 w-4 shrink-0 ${TONE_ICON[tone]}`} />
        <span className="text-sm font-semibold text-[#1F2A24]">{sentence}</span>
      </span>

      <span className="flex shrink-0 items-center gap-2">
        <span className={`text-sm font-semibold ${TONE_TEXT[tone]}`}>{value}</span>
        <span className="text-xs font-semibold text-[#718078]">Investigate</span>
        <ChevronRightIcon className="h-4 w-4 text-[#8A9990]" />
      </span>
    </Link>
  );
}

function formatPlanLabel(plan: Plan | null): string {
  if (!plan) return "No plan";
  return plan === "pro" ? "Pro plan" : "Free plan";
}

function formatCountLabel(count: number, singular: string, plural: string): string {
  return `${formatCount(count)} ${count === 1 ? singular : plural}`;
}

function ProjectRow({ project }: { project: UserDashboardProject }) {
  const issues: { label: string; tone: Tone }[] = [];

  if (project.circuit_open_endpoint_count > 0) {
    issues.push({
      label: formatCountLabel(project.circuit_open_endpoint_count, "circuit open", "circuits open"),
      tone: "red",
    });
  }
  if (project.held_delivery_count > 0) {
    issues.push({ label: formatCountLabel(project.held_delivery_count, "held", "held"), tone: "amber" });
  }
  if (project.recent_failed_delivery_count > 0) {
    issues.push({
      label: formatCountLabel(project.recent_failed_delivery_count, "recent failure", "recent failures"),
      tone: "red",
    });
  }

  const metaParts: string[] = [project.relationship === "owned" ? "Owned by you" : "Shared with you"];

  if (project.relationship === "shared" && project.current_user_role === "maintainer") {
    metaParts.push("Maintainer");
  }

  metaParts.push(formatPlanLabel(project.effective_plan));
  metaParts.push(
    `${formatCount(project.active_endpoint_count)} active endpoint${project.active_endpoint_count === 1 ? "" : "s"}`,
  );

  return (
    <Link
      to={`/projects/${project.id}`}
      className="block rounded-xl border border-[#E4EBE6] bg-white px-4 py-3 transition hover:border-[#23613F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#23613F]/30"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-base font-semibold tracking-tight text-[#1F2A24]">{project.name}</h3>

          <div className="mt-1.5 flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
            <p className="text-xs font-medium text-[#718078]">{metaParts.join(" · ")}</p>
            <span className="text-xs font-medium text-[#8A9990]">{formatDateTime(project.updated_at)}</span>
          </div>
        </div>

        <ChevronRightIcon className="mt-1 h-4 w-4 shrink-0 text-[#8A9990]" />
      </div>

      {issues.length > 0 ? (
        <div className="mt-2 flex flex-wrap gap-3">
          {issues.map((issue) => (
            <span key={issue.label} className="flex items-center gap-1.5 text-xs font-semibold text-[#405348]">
              <span className={`h-1.5 w-1.5 rounded-full ${TONE_DOT[issue.tone]}`} />
              {issue.label}
            </span>
          ))}
        </div>
      ) : (
        <div className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-[#23613F]">
          <CheckCircleIcon className="h-3.5 w-3.5" />
          No open delivery issues
        </div>
      )}
    </Link>
  );
}

function SummaryLink({ to, value, label }: { to: string; value: string; label: string }) {
  return (
    <Link
      to={to}
      className="flex min-h-11 items-center gap-2 rounded-lg px-2 py-2 text-left transition hover:text-[#23613F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#23613F]/30"
    >
      <span className="text-lg font-semibold text-[#1F2A24]">{value}</span>
      <span className="text-xs font-medium text-[#53665A]">{label}</span>
    </Link>
  );
}

function DashboardPage() {
  const user = useOutletContext<CurrentUser>();
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState<UserDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadToken, setReloadToken] = useState(0);

  const isAdmin = user.role === "admin";

  useEffect(() => {
    if (isAdmin) return;

    let cancelled = false;

    async function load() {
      setLoading(true);

      const result = await getUserDashboard();

      if (cancelled) return;

      if (!result.ok) {
        setError(result.error);
        setDashboard(null);
        setLoading(false);
        return;
      }

      setDashboard(result.data);
      setError("");
      setLoading(false);
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [isAdmin, reloadToken]);

  if (isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  const attentionRows = dashboard
    ? [
        {
          sentence: "Endpoints have an open circuit",
          value: dashboard.needs_attention.open_circuit_endpoints,
          to: "/endpoints",
          tone: "red" as Tone,
        },
        {
          sentence: "Deliveries are waiting because their endpoint is unavailable",
          value: dashboard.needs_attention.held_deliveries,
          to: "/deliveries?delivery_state=held_by_circuit",
          tone: "amber" as Tone,
        },
        {
          sentence: "Retries are due",
          value: dashboard.needs_attention.retries_due,
          to: "/deliveries",
          tone: "amber" as Tone,
        },
        {
          sentence: "Deliveries failed",
          value: dashboard.needs_attention.failed_deliveries,
          to: "/deliveries?status=failed",
          tone: "red" as Tone,
        },
      ].filter((row) => row.value > 0)
    : [];

  const healthTone = dashboard ? getHealthStatus(dashboard) : { tone: "neutral" as Tone, label: "" };
  const hasNoProjects = dashboard?.workspace.project_count === 0;

  return (
    <AppLayout user={user} title="Overview">
      <nav aria-label="Breadcrumb" className="flex items-center gap-2">
        <Link to="/" className="text-sm font-semibold text-[#23613F] transition hover:underline">
          HookYard
        </Link>
        <ChevronRightIcon className="h-3.5 w-3.5 text-[#8A9990]" />
        <span className="text-sm font-semibold text-[#1F2A24]">Overview</span>
      </nav>

      <header className="mt-5 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight text-[#1F2A24] sm:text-3xl">Your workspace</h1>
          <p className="mt-1 text-sm font-medium text-[#53665A]">
            Monitor delivery health across projects you own or collaborate on.
          </p>
        </div>

        <button
          type="button"
          aria-label="Refresh dashboard"
          onClick={() => setReloadToken((token) => token + 1)}
          className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-xl text-[#405348] transition hover:bg-[#F1F6F2] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#23613F]/30"
        >
          <RefreshIcon className="h-4 w-4" />
        </button>
      </header>

      {loading ? (
        <div role="status" aria-live="polite" className="mt-6 space-y-6">
          <div className="rounded-2xl border border-[#D8E3DB] bg-white px-5 py-4">
            <div className="h-11 animate-pulse rounded-lg bg-[#E4EBE6]" />
          </div>

          <div className="rounded-2xl border border-[#D8E3DB] bg-white px-5 py-6 sm:px-6">
            <div className="h-3 w-36 animate-pulse rounded bg-[#E4EBE6]" />
            <div className="mt-4 h-12 w-32 animate-pulse rounded bg-[#E4EBE6]" />
            <div className="mt-4 grid gap-3 lg:grid-cols-2">
              <div className="h-11 animate-pulse rounded-lg bg-[#E4EBE6]" />
              <div className="h-11 animate-pulse rounded-lg bg-[#E4EBE6]" />
            </div>
          </div>

          <div className="rounded-2xl border border-[#D8E3DB] bg-white px-5 py-5">
            <div className="h-3 w-40 animate-pulse rounded bg-[#E4EBE6]" />
            <div className="mt-4 space-y-2">
              <div className="h-24 animate-pulse rounded-xl bg-[#E4EBE6]" />
              <div className="h-24 animate-pulse rounded-xl bg-[#E4EBE6]" />
            </div>
          </div>
        </div>
      ) : error ? (
        <div role="alert" className="mt-6 rounded-2xl border border-[#F1D5D5] bg-[#FBEEEE] px-5 py-5">
          <p className="text-sm font-medium text-[#B42318]">{error}</p>
          <Button
            variant="secondary"
            size="sm"
            className="mt-4"
            onClick={() => setReloadToken((token) => token + 1)}
          >
            Try again
          </Button>
        </div>
      ) : (
        dashboard && (
          <>
            <section className="mt-6">
              <div className="flex flex-wrap gap-x-4 gap-y-1 rounded-2xl border border-[#D8E3DB] bg-white px-3 py-2">
                <SummaryLink
                  to="/projects"
                  value={formatMetric(dashboard.workspace.project_count)}
                  label="projects"
                />
                <SummaryLink
                  to="/projects"
                  value={formatMetric(dashboard.workspace.owned_project_count)}
                  label="owned by you"
                />
                <SummaryLink
                  to="/projects"
                  value={formatMetric(dashboard.workspace.shared_project_count)}
                  label="shared with you"
                />
              </div>
            </section>

            {hasNoProjects ? (
              <section className="mt-6 rounded-2xl border border-dashed border-[#C2D4C7] bg-white px-6 py-12 text-center">
                <h2 className="text-lg font-semibold text-[#1F2A24]">No projects yet</h2>
                <p className="mx-auto mt-2 max-w-md text-sm font-medium text-[#53665A]">
                  Create a project to start delivering webhooks, or wait for an invitation to join one.
                </p>
                <Button variant="primary" size="md" className="mt-5" onClick={() => navigate("/projects")}>
                  Go to Projects
                </Button>
              </section>
            ) : (
              <>
                <section className="mt-6 rounded-2xl border border-[#D8E3DB] bg-white px-5 py-6 sm:px-6">
                  <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[2px] text-[#8A9990]">
                        Delivery health
                      </p>

                      {dashboard.delivery_health.total > 0 ? (
                        <p className={`mt-3 text-5xl font-semibold tracking-tight ${TONE_TEXT[healthTone.tone]}`}>
                          {formatRate(dashboard.delivery_health.success_rate)}
                        </p>
                      ) : (
                        <p className="mt-4 text-base font-semibold text-[#53665A]">
                          No delivery activity in {dashboard.delivery_health.period_label}.
                        </p>
                      )}

                      <div className="mt-2 flex items-center gap-2">
                        <span className={`h-2.5 w-2.5 rounded-full ${TONE_DOT[healthTone.tone]}`} />
                        <span className={`text-sm font-semibold ${TONE_TEXT[healthTone.tone]}`}>{healthTone.label}</span>
                      </div>

                      {dashboard.delivery_health.total > 0 && (
                        <p className="mt-2 text-xs font-medium text-[#718078]">{dashboard.delivery_health.period_label}</p>
                      )}
                    </div>

                    <div className="divide-y divide-[#E4EBE6]">
                      <HealthRow
                        to="/deliveries?status=succeeded"
                        label="Succeeded"
                        value={formatMetric(dashboard.delivery_health.succeeded)}
                        valueTone="green"
                      />
                      <HealthRow
                        to="/deliveries?status=failed"
                        label="Failed"
                        value={formatMetric(dashboard.delivery_health.failed)}
                        valueTone="red"
                      />
                      <HealthRow
                        to="/deliveries"
                        label="In flight"
                        value={formatMetric(dashboard.delivery_health.in_flight)}
                        valueTone="neutral"
                      />
                    </div>
                  </div>
                </section>

                {attentionRows.length > 0 ? (
                  <section className="mt-6 rounded-2xl border border-[#D8E3DB] bg-white px-5 py-5 sm:px-6">
                    <h2 className="text-sm font-semibold tracking-tight text-[#1F2A24]">Needs attention</h2>

                    <div className="mt-3 divide-y divide-[#E4EBE6]">
                      {attentionRows.map((row) => (
                        <AttentionRow
                          key={row.sentence}
                          to={row.to}
                          sentence={row.sentence}
                          value={formatMetric(row.value)}
                          tone={row.tone}
                        />
                      ))}
                    </div>
                  </section>
                ) : (
                  <div className="mt-6 flex items-center gap-2.5 rounded-2xl border border-[#D8E3DB] bg-white px-5 py-4">
                    <CheckCircleIcon className="h-5 w-5 shrink-0 text-[#23613F]" />
                    <p className="text-sm font-semibold text-[#1F2A24]">No delivery issues need attention.</p>
                  </div>
                )}

                <section className="mt-6">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <h2 className="text-sm font-semibold tracking-tight text-[#1F2A24]">Priority projects</h2>
                      <p className="mt-1 text-xs font-medium text-[#718078]">
                        Projects are ranked by delivery issues and recent activity.
                      </p>
                    </div>

                    <Link
                      to="/projects"
                      className="rounded text-xs font-semibold text-[#23613F] transition hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#23613F]/30"
                    >
                      View all projects
                    </Link>
                  </div>

                  <div className="mt-3 grid gap-3">
                    {dashboard.projects.map((project) => (
                      <ProjectRow key={project.id} project={project} />
                    ))}
                  </div>
                </section>
              </>
            )}
          </>
        )
      )}
    </AppLayout>
  );
}

export default DashboardPage;

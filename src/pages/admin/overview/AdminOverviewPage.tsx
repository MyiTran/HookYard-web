import { useEffect, useState, type ReactNode } from "react";
import { Link, useOutletContext } from "react-router-dom";
import AdminBreadcrumbs from "../../../components/admin/AdminBreadcrumbs";
import AlertTriangleIcon from "../../../components/icons/AlertTriangleIcon";
import BuildingIcon from "../../../components/icons/BuildingIcon";
import CheckCircleIcon from "../../../components/icons/CheckCircleIcon";
import ChevronRightIcon from "../../../components/icons/ChevronRightIcon";
import PlugIcon from "../../../components/icons/PlugIcon";
import RefreshIcon from "../../../components/icons/RefreshIcon";
import UsersIcon from "../../../components/icons/UsersIcon";
import AppLayout from "../../../components/layout/AppLayout";
import Button from "../../../components/ui/Button";
import { getAdminOverview } from "../../../lib/adminApi";
import { formatDateTime } from "../../../lib/dateFormat";
import { formatCount } from "../../../lib/numberFormat";
import type { AdminOverview } from "../../../types/admin";
import type { CurrentUser } from "../../../types/user";

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

type RowLinkProps = {
  to: string;
  label: string;
  value: string;
  icon?: ReactNode;
  valueTone?: Tone;
};

function RowLink({ to, label, value, icon, valueTone = "neutral" }: RowLinkProps) {
  return (
    <Link
      to={to}
      className="flex min-h-11 items-center justify-between gap-3 rounded-lg px-2 py-2.5 text-left transition hover:bg-[#F7FAF8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#23613F]/30"
    >
      <span className="flex min-w-0 items-center gap-2.5">
        {icon}
        <span className="truncate text-sm font-semibold text-[#1F2A24]">{label}</span>
      </span>

      <span className="flex shrink-0 items-center gap-2">
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

function getHealthTone(overview: AdminOverview): { tone: Tone; label: string } {
  const { failed_attempts, held, retries_due } = overview.deliveries;
  const circuitOpen = overview.endpoints.circuit_open;

  if (failed_attempts > 0) return { tone: "red", label: "Needs attention" };
  if (held > 0 || retries_due > 0 || circuitOpen > 0) return { tone: "amber", label: "Needs attention" };
  if (overview.deliveries.total_attempts === 0) return { tone: "neutral", label: "No delivery activity" };

  return { tone: "green", label: "Healthy" };
}

function AdminOverviewPage() {
  const user = useOutletContext<CurrentUser>();
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);

      const result = await getAdminOverview();

      if (cancelled) return;

      if (!result.ok) {
        setError(result.error);
        setOverview(null);
        setLoading(false);
        return;
      }

      setOverview(result.data);
      setError("");
      setLoading(false);
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [reloadToken]);

  const attentionRows = overview
    ? [
        {
          sentence: "Endpoints have an open circuit",
          value: overview.endpoints.circuit_open,
          to: "/admin/endpoints?circuit_state=circuit_open",
          tone: "red" as Tone,
        },
        {
          sentence: "Deliveries are held",
          value: overview.deliveries.held,
          to: "/admin/deliveries",
          tone: "amber" as Tone,
        },
        {
          sentence: "Retries are due",
          value: overview.deliveries.retries_due,
          to: "/admin/deliveries",
          tone: "amber" as Tone,
        },
        {
          sentence: "Deliveries failed",
          value: overview.deliveries.failed_attempts,
          to: "/admin/deliveries?status=failed",
          tone: "red" as Tone,
        },
      ].filter((row) => row.value > 0)
    : [];

  const healthTone = overview ? getHealthTone(overview) : { tone: "neutral" as Tone, label: "" };

  return (
    <AppLayout user={user} title="Operations">
      <AdminBreadcrumbs
        items={[
          { label: "HookYard", to: "/" },
          { label: "Admin" },
        ]}
      />

      <header className="mt-5 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight text-[#1F2A24] sm:text-3xl">Operations</h1>
          <p className="mt-1 text-sm font-medium text-[#53665A]">
            Monitor delivery health and investigate customer webhook issues.
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          {overview && (
            <p className="text-xs font-medium text-[#718078]">
              Updated {formatDateTime(overview.generated_at)}
            </p>
          )}

          <button
            type="button"
            aria-label="Refresh overview"
            onClick={() => setReloadToken((token) => token + 1)}
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl text-[#405348] transition hover:bg-[#F1F6F2] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#23613F]/30"
          >
            <RefreshIcon className="h-4 w-4" />
          </button>
        </div>
      </header>

      {loading ? (
        <div className="mt-6 space-y-6">
          <div className="rounded-2xl border border-[#D8E3DB] bg-white px-5 py-6 sm:px-6">
            <div className="h-3 w-40 animate-pulse rounded bg-[#E4EBE6]" />
            <div className="mt-4 h-12 w-36 animate-pulse rounded bg-[#E4EBE6]" />
            <div className="mt-4 grid gap-3 lg:grid-cols-2">
              <div className="h-11 animate-pulse rounded-lg bg-[#E4EBE6]" />
              <div className="h-11 animate-pulse rounded-lg bg-[#E4EBE6]" />
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,0.8fr)]">
            <div className="rounded-2xl border border-[#D8E3DB] bg-white px-5 py-5">
              <div className="h-3 w-36 animate-pulse rounded bg-[#E4EBE6]" />
              <div className="mt-4 space-y-2">
                <div className="h-11 animate-pulse rounded-lg bg-[#E4EBE6]" />
                <div className="h-11 animate-pulse rounded-lg bg-[#E4EBE6]" />
                <div className="h-11 animate-pulse rounded-lg bg-[#E4EBE6]" />
              </div>
            </div>

            <div className="rounded-2xl border border-[#D8E3DB] bg-white px-5 py-5">
              <div className="h-3 w-36 animate-pulse rounded bg-[#E4EBE6]" />
              <div className="mt-4 space-y-2">
                <div className="h-11 animate-pulse rounded-lg bg-[#E4EBE6]" />
                <div className="h-11 animate-pulse rounded-lg bg-[#E4EBE6]" />
                <div className="h-11 animate-pulse rounded-lg bg-[#E4EBE6]" />
              </div>
            </div>
          </div>
        </div>
      ) : error ? (
        <div className="mt-6 rounded-2xl border border-[#F1D5D5] bg-[#FBEEEE] px-5 py-5">
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
        overview && (
          <>
            <section className="mt-6 rounded-2xl border border-[#D8E3DB] bg-white px-5 py-6 sm:px-6">
              <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[2px] text-[#8A9990]">
                    Delivery success rate
                  </p>

                  <p className={`mt-3 text-5xl font-semibold tracking-tight ${TONE_TEXT[healthTone.tone]}`}>
                    {formatRate(overview.deliveries.success_rate)}
                  </p>

                  <div className="mt-2 flex items-center gap-2">
                    <span className={`h-2.5 w-2.5 rounded-full ${TONE_DOT[healthTone.tone]}`} />
                    <span className={`text-sm font-semibold ${TONE_TEXT[healthTone.tone]}`}>{healthTone.label}</span>
                  </div>

                  <p className="mt-2 text-xs font-medium text-[#718078]">
                    Last {overview.deliveries.window_days} days
                  </p>
                </div>

                <div className="divide-y divide-[#E4EBE6]">
                  <RowLink
                    to="/admin/deliveries?status=succeeded"
                    label="Succeeded"
                    value={formatMetric(overview.deliveries.succeeded_attempts)}
                    valueTone="green"
                  />
                  <RowLink
                    to="/admin/deliveries?status=failed"
                    label="Failed"
                    value={formatMetric(overview.deliveries.failed_attempts)}
                    valueTone="red"
                  />
                  <RowLink
                    to="/admin/deliveries"
                    label="In flight"
                    value={formatMetric(overview.deliveries.in_flight)}
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

            <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,0.8fr)]">
              <section className="rounded-2xl border border-[#D8E3DB] bg-white px-5 py-5 sm:px-6">
                <h2 className="text-sm font-semibold tracking-tight text-[#1F2A24]">Delivery operations</h2>

                <div className="mt-3 divide-y divide-[#E4EBE6]">
                  <RowLink
                    to="/admin/deliveries?status=failed"
                    label="Failed deliveries"
                    value={formatMetric(overview.deliveries.failed_attempts)}
                    valueTone="red"
                  />
                  <RowLink
                    to="/admin/deliveries"
                    label="Held deliveries"
                    value={formatMetric(overview.deliveries.held)}
                    valueTone="amber"
                  />
                  <RowLink
                    to="/admin/deliveries"
                    label="Retries due"
                    value={formatMetric(overview.deliveries.retries_due)}
                    valueTone="amber"
                  />
                  <RowLink
                    to="/admin/deliveries"
                    label="In flight"
                    value={formatMetric(overview.deliveries.in_flight)}
                    valueTone="neutral"
                  />
                </div>
              </section>

              <section className="rounded-2xl border border-[#D8E3DB] bg-white px-5 py-5 sm:px-6">
                <h2 className="text-sm font-semibold tracking-tight text-[#1F2A24]">Platform footprint</h2>

                <div className="mt-3 divide-y divide-[#E4EBE6]">
                  <RowLink
                    to="/admin/accounts"
                    label="Accounts"
                    value={formatMetric(overview.accounts.total)}
                    icon={<UsersIcon className="h-4 w-4 text-[#718078]" />}
                  />
                  <RowLink
                    to="/admin/projects"
                    label="Projects"
                    value={formatMetric(overview.projects.total)}
                    icon={<BuildingIcon className="h-4 w-4 text-[#718078]" />}
                  />
                  <RowLink
                    to="/admin/endpoints?status=active"
                    label="Active endpoints"
                    value={formatMetric(overview.endpoints.active)}
                    icon={<PlugIcon className="h-4 w-4 text-[#718078]" />}
                  />
                  <RowLink
                    to="/admin/accounts?active=unconfirmed"
                    label="Unconfirmed accounts"
                    value={formatMetric(overview.accounts.unconfirmed)}
                    icon={<UsersIcon className="h-4 w-4 text-[#718078]" />}
                  />
                  <RowLink
                    to="/admin/accounts?role=support"
                    label="Support accounts"
                    value={formatMetric(overview.accounts.support)}
                    icon={<UsersIcon className="h-4 w-4 text-[#718078]" />}
                  />
                </div>

                <p className="mt-4 text-xs font-medium text-[#8A9990]">
                  Admin accounts · {formatMetric(overview.accounts.admins)}
                </p>
              </section>
            </div>
          </>
        )
      )}
    </AppLayout>
  );
}

export default AdminOverviewPage;

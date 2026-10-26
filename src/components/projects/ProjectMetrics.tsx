import { useEffect, useState } from "react";
import { getProjectMetrics, type ProjectMetrics as ProjectMetricsData } from "../../lib/projectMetrics";
import AlertTriangleIcon from "../icons/AlertTriangleIcon";
import BoltIcon from "../icons/BoltIcon";
import CheckCircleIcon from "../icons/CheckCircleIcon";
import PlugIcon from "../icons/PlugIcon";
import Button from "../ui/Button";
import MetricCard from "../ui/MetricCard";

type ProjectMetricsProps = {
  projectId: string;
};

function ProjectMetrics({ projectId }: ProjectMetricsProps) {
  const [metrics, setMetrics] = useState<ProjectMetricsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError("");

      const result = await getProjectMetrics(projectId);

      if (cancelled) return;

      if (result.ok) {
        setMetrics(result.data);
      } else {
        setMetrics(null);
        setError(result.error);
      }

      setLoading(false);
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [projectId, reloadToken]);

  if (error) {
    return (
      <section className="mt-6 rounded-[18px] border border-[#F1D5D5] bg-[#FBEEEE] px-5 py-4">
        <p className="text-sm font-semibold text-[#B42318]">Unable to load project metrics</p>
        <p className="mt-1 text-xs font-medium text-[#B42318]">{error}</p>

        <Button
          variant="secondary"
          size="sm"
          className="mt-3"
          onClick={() => setReloadToken((token) => token + 1)}
        >
          Try again
        </Button>
      </section>
    );
  }

  return (
    <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-busy={loading}>
      <MetricCard
        tone="blue"
        label="Endpoints"
        value={String(metrics?.endpointCount ?? 0)}
        loading={loading}
        icon={<PlugIcon />}
      />
      <MetricCard
        tone="purple"
        label="Events"
        value={String(metrics?.eventCount ?? 0)}
        loading={loading}
        icon={<BoltIcon />}
      />
      <MetricCard
        tone="green"
        label="Success rate"
        value={`${metrics?.successRate ?? 0}%`}
        loading={loading}
        icon={<CheckCircleIcon />}
      />
      <MetricCard
        tone="red"
        label="Failed deliveries"
        value={String(metrics?.failedCount ?? 0)}
        loading={loading}
        icon={<AlertTriangleIcon />}
      />
    </section>
  );
}

export default ProjectMetrics;

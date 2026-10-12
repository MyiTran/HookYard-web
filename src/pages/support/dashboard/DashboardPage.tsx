import { useEffect, useState, type ReactNode } from "react";
import { useOutletContext } from "react-router-dom";
import AppLayout from "../../../components/layout/AppLayout";
import { API_URL } from "../../../config";
import { formatApiError } from "../../../lib/apiError";
import type { CurrentUser, UserProfile } from "../../../types/user";

function SupportDashboardPage() {
  const user = useOutletContext<CurrentUser>();
  const [dashboard, setDashboard] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    let active = true;

    async function loadDashboard() {
      try {
        const response = await fetch(`${API_URL}/dashboard`, {
          headers: { Accept: "application/json", Authorization: token || "" },
        });

        if (!active) return;

        if (response.status === 401) {
          localStorage.removeItem("token");
          window.location.href = "/users/sign_in";
          return;
        }

        if (!response.ok) {
          const data = await response.json().catch(() => null);

          if (active) {
            setError(formatApiError(data, "We could not load your dashboard. Please try again!"));
          }

          return;
        }

        const data = (await response.json()) as UserProfile;

        if (active) setDashboard(data);
      } catch {
        if (active) setError("Unable to connect to the server. Please try again!");
      } finally {
        if (active) setLoading(false);
      }
    }

    loadDashboard();

    return () => {
      active = false;
    };
  }, []);

  let content: ReactNode = null;

  if (loading) {
    content = <p className="mt-2 text-sm font-medium text-[#607267]">Loading dashboard...</p>;
  } else if (error) {
    content = <p className="mt-2 text-sm font-medium text-[#B42318]">{error}</p>;
  } else if (dashboard) {
    content = <p className="mt-2 text-sm font-medium text-[#607267]">Dashboard content will be added here.</p>;
  }

  return (
    <AppLayout user={user} title="Overview">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[2px] text-[#5D7063]">System overview</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight">Welcome back, {user.name}!</h2>
          <p className="mt-2 text-sm font-medium text-[#53665A]">Monitor webhook activity and delivery health</p>
        </div>

        <div className="flex items-center gap-3 rounded-full border border-[#CEDDD2] bg-white px-4 py-2 shadow-sm">
          <span className="h-2 w-2 rounded-full bg-[#43AD61]" />
          <span className="text-sm font-medium text-[#405348]">Platform operational</span>
        </div>
      </div>

      <section className="mt-8 min-h-[500px] rounded-[18px] border border-[#D8E3DB] bg-white p-8 shadow-[0_8px_30px_rgba(32,78,53,0.05)]">
        <h3 className="text-lg font-semibold">Support dashboard</h3>
        {content}
      </section>
    </AppLayout>
  );
}

export default SupportDashboardPage;

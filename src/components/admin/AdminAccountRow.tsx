import { Link } from "react-router-dom";
import { formatDateTime } from "../../lib/dateFormat";
import type { AdminSupportAccount, AdminSupportAccountRole } from "../../types/admin";
import PlanBadge from "../plan/PlanBadge";
import Badge from "../ui/Badge";

type AdminAccountRowProps = {
  account: AdminSupportAccount;
};

export const ADMIN_ACCOUNT_ROW_GRID_COLS =
  "grid-cols-1 sm:grid-cols-2 lg:grid-cols-[minmax(0,1.8fr)_minmax(0,1fr)_5.5rem_6rem_5.5rem_7.5rem]";

const MOBILE_LABEL_CLASS = "text-[10px] font-semibold uppercase tracking-[2px] text-[#8A9990] lg:hidden";

function roleBadges(roles: AdminSupportAccountRole[]) {
  if (roles.length === 0) {
    return <Badge tone="neutral">None</Badge>;
  }

  return roles.map((role) => (
    <Badge key={role} tone={role === "admin" ? "purple" : "blue"}>
      {role === "admin" ? "Admin" : "Support"}
    </Badge>
  ));
}

function AdminAccountRow({ account }: AdminAccountRowProps) {
  const lastSignIn = account.last_sign_in_at ? formatDateTime(account.last_sign_in_at) : "Never";

  return (
    <Link
      to={`/admin/accounts/${account.id}`}
      className={`${ADMIN_ACCOUNT_ROW_GRID_COLS} grid gap-x-4 gap-y-2 px-5 py-4 transition hover:bg-[#F7FAF8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#23613F]/30`}
    >
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold tracking-tight text-[#1F2A24]">{account.name}</p>
        <p className="mt-0.5 truncate text-xs font-medium text-[#8A9990]">{account.email}</p>
      </div>

      <div className="min-w-0">
        <p className={MOBILE_LABEL_CLASS}>Roles</p>
        <div className="flex flex-wrap items-center gap-1.5">{roleBadges(account.roles)}</div>
      </div>

      <div className="min-w-0">
        <p className={MOBILE_LABEL_CLASS}>Plan</p>
        {account.roles.includes("admin") ? (
          <Badge tone="neutral">Platform administrator</Badge>
        ) : (
          <PlanBadge plan={account.plan} />
        )}
      </div>

      <div className="min-w-0">
        <p className={MOBILE_LABEL_CLASS}>Confirmed</p>
        {account.confirmed ? <Badge tone="green" dot>Confirmed</Badge> : <Badge tone="neutral">Unconfirmed</Badge>}
      </div>

      <div className="min-w-0">
        <p className={MOBILE_LABEL_CLASS}>Sign-ins</p>
        <p className="text-sm font-medium text-[#405348]">{account.sign_in_count}</p>
      </div>

      <div className="min-w-0">
        <p className={MOBILE_LABEL_CLASS}>Last sign in</p>
        <p className="text-sm font-medium text-[#405348]">{lastSignIn}</p>
      </div>
    </Link>
  );
}

export default AdminAccountRow;

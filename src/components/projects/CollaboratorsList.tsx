import { formatUserName } from "../../lib/currentUser";
import type { ProjectMembership, ProjectMembershipRole } from "../../types/project";
import RoleBadge from "./RoleBadge";

type CollaboratorsListProps = {
  memberships: ProjectMembership[];
  currentUserRole: ProjectMembershipRole | null;
  removingId: string | null;
  onRemove: (membership: ProjectMembership) => void;
};

function CollaboratorsList({ memberships, currentUserRole, removingId, onRemove }: CollaboratorsListProps) {
  const canManage = currentUserRole === "owner";

  return (
    <ul className="divide-y divide-[#E4EBE6]">
      {memberships.map((membership) => {
        const name = formatUserName(membership.user.first_name, membership.user.last_name);
        const removable = canManage && membership.role === "maintainer";

        return (
          <li key={membership.id} className="flex flex-wrap items-center justify-between gap-4 py-4">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#EFF5F1] font-semibold text-[#23613F]">
                {name.charAt(0).toUpperCase() || "?"}
              </span>

              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{name || "HookYard user"}</p>
                <p className="truncate text-xs font-medium text-[#718078]">{membership.user.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <RoleBadge role={membership.role} />

              {removable && (
                <button
                  type="button"
                  onClick={() => onRemove(membership)}
                  disabled={removingId === membership.id}
                  className="rounded-lg px-3 py-1.5 text-xs font-semibold text-[#B42318] transition hover:bg-[#FBEEEE] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {removingId === membership.id ? "Removing..." : "Remove"}
                </button>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export default CollaboratorsList;

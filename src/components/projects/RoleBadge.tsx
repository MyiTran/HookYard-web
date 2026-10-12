import type { ProjectMembershipRole } from "../../types/project";

type RoleBadgeProps = { role: ProjectMembershipRole };

function RoleBadge({ role }: RoleBadgeProps) {
  const isOwner = role === "owner";

  return (
    <span
      className={
        isOwner
          ? "inline-flex items-center rounded-full bg-[#214E35] px-3 py-1 text-xs font-semibold text-white"
          : "inline-flex items-center rounded-full bg-[#EFF5F1] px-3 py-1 text-xs font-semibold text-[#23613F]"
      }
    >
      {isOwner ? "Owner" : "Maintainer"}
    </span>
  );
}

export default RoleBadge;

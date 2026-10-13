import type { ProjectMembershipRole } from "../../types/project";
import Badge from "../ui/Badge";

type RoleBadgeProps = { role: ProjectMembershipRole };

function RoleBadge({ role }: RoleBadgeProps) {
  const isOwner = role === "owner";

  return <Badge tone={isOwner ? "green" : "purple"}>{isOwner ? "Owner" : "Maintainer"}</Badge>;
}

export default RoleBadge;

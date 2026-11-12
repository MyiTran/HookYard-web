import Badge from "../ui/Badge";

type EndpointStatusBadgeProps = {
  active: boolean;
  archived?: boolean;
};

function EndpointStatusBadge({ active, archived = false }: EndpointStatusBadgeProps) {
  if (archived) return <Badge tone="amber" dot>Archived</Badge>;

  return <Badge tone={active ? "green" : "neutral"} dot>{active ? "Active" : "Paused"}</Badge>;
}

export default EndpointStatusBadge;

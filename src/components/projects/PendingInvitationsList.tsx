import { formatUserName } from "../../lib/currentUser";
import { formatDateTime } from "../../lib/dateFormat";
import type { ProjectInvitation } from "../../types/project";
import Badge from "../ui/Badge";
import Button from "../ui/Button";
import RoleBadge from "./RoleBadge";

type PendingInvitationsListProps = {
  invitations: ProjectInvitation[];
  cancellingId: string | null;
  onCancel: (invitation: ProjectInvitation) => void;
};

function PendingInvitationsList({ invitations, cancellingId, onCancel }: PendingInvitationsListProps) {
  return (
    <ul className="divide-y divide-[#E4EBE6]">
      {invitations.map((invitation) => {
        const name = formatUserName(invitation.recipient.first_name, invitation.recipient.last_name);

        return (
          <li key={invitation.id} className="flex flex-wrap items-center justify-between gap-4 py-4">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="truncate text-sm font-semibold">{name || "Invited user"}</p>
                <Badge tone="amber" dot>
                  Pending
                </Badge>
              </div>
              <p className="text-xs font-medium text-[#718078]">Invited {formatDateTime(invitation.created_at)}</p>
            </div>

            <div className="flex items-center gap-3">
              <RoleBadge role={invitation.role} />

              <Button
                variant="dangerSoft"
                size="sm"
                onClick={() => onCancel(invitation)}
                disabled={cancellingId === invitation.id}
              >
                {cancellingId === invitation.id ? "Cancelling..." : "Cancel"}
              </Button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export default PendingInvitationsList;

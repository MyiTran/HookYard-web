import { formatUserName } from "../../lib/currentUser";
import { formatDate } from "../../lib/dateFormat";
import type { ProjectInvitation } from "../../types/project";
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
              <p className="truncate text-sm font-semibold">{name || "Invited user"}</p>
              <p className="text-xs font-medium text-[#718078]">Invited {formatDate(invitation.created_at)}</p>
            </div>

            <div className="flex items-center gap-3">
              <RoleBadge role={invitation.role} />

              <button
                type="button"
                onClick={() => onCancel(invitation)}
                disabled={cancellingId === invitation.id}
                className="rounded-lg px-3 py-1.5 text-xs font-semibold text-[#B42318] transition hover:bg-[#FBEEEE] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {cancellingId === invitation.id ? "Cancelling..." : "Cancel"}
              </button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export default PendingInvitationsList;

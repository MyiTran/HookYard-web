import { formatUserName } from "../../lib/currentUser";
import type { ProjectInvitation } from "../../types/project";
import Button from "../ui/Button";

type MyInvitationsListProps = {
  invitations: ProjectInvitation[];
  acceptingId: string | null;
  onAccept: (invitation: ProjectInvitation) => void;
};

function MyInvitationsList({ invitations, acceptingId, onAccept }: MyInvitationsListProps) {
  return (
    <ul className="space-y-3">
      {invitations.map((invitation) => {
        const inviter = formatUserName(invitation.invited_by.first_name, invitation.invited_by.last_name);
        const accepting = acceptingId === invitation.id;

        return (
          <li
            key={invitation.id}
            className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#D8E3DB] bg-white p-4 shadow-[0_8px_24px_rgba(32,78,53,0.05)]"
          >
            <div className="min-w-0">
              <p className="text-sm font-semibold">
                You've been invited to{" "}
                <span className="text-[#23613F]">{invitation.project.name}</span> as Maintainer
              </p>

              <p className="mt-1 text-xs font-medium text-[#718078]">From {inviter || "a HookYard user"}</p>
            </div>

            <Button
              variant="primary"
              size="lg"
              className="shrink-0"
              onClick={() => onAccept(invitation)}
              disabled={accepting}
            >
              {accepting ? "Accepting..." : "Accept"}
            </Button>
          </li>
        );
      })}
    </ul>
  );
}

export default MyInvitationsList;

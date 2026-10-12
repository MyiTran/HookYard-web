import { formatUserName } from "../../lib/currentUser";
import type { ProjectInvitation } from "../../types/project";

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

            <button
              type="button"
              onClick={() => onAccept(invitation)}
              disabled={accepting}
              className="inline-flex h-11 shrink-0 items-center rounded-xl bg-[#214E35] px-5 text-sm font-semibold text-white transition hover:bg-[#173D28] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {accepting ? "Accepting..." : "Accept"}
            </button>
          </li>
        );
      })}
    </ul>
  );
}

export default MyInvitationsList;

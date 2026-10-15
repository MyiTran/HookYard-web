import type { NotificationKind } from "../../types/notification";
import AlertTriangleIcon from "../icons/AlertTriangleIcon";
import CheckCircleIcon from "../icons/CheckCircleIcon";
import UsersIcon from "../icons/UsersIcon";

type NotificationIconProps = { kind: NotificationKind };

const TONE_STYLES: Record<NotificationKind, string> = {
  project_invitation_received: "bg-[#EFF5F1] text-[#405348]",
  project_invitation_accepted: "bg-[#EAF5EE] text-[#23613F]",
  project_invitation_declined: "bg-[#FBF1E4] text-[#9A6B1F]",
};

const ICONS: Record<NotificationKind, typeof CheckCircleIcon> = {
  project_invitation_received: UsersIcon,
  project_invitation_accepted: CheckCircleIcon,
  project_invitation_declined: AlertTriangleIcon,
};

function NotificationIcon({ kind }: NotificationIconProps) {
  const Icon = ICONS[kind];

  return (
    <span
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${TONE_STYLES[kind]}`}
    >
      <Icon className="h-4 w-4" />
    </span>
  );
}

export default NotificationIcon;

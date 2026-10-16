import { formatDate } from "../../lib/dateFormat";
import type { Notification } from "../../types/notification";
import InvitationActions from "../projects/InvitationActions";
import NotificationIcon from "./NotificationIcon";

type NotificationItemProps = {
  notification: Notification;
  processing: boolean;
  onSelect: (notification: Notification) => void;
  onInvitationAction: (notification: Notification, action: "accept" | "decline") => void;
};

function NotificationItem({ notification, processing, onSelect, onInvitationAction }: NotificationItemProps) {
  const isUnread = notification.read_at === null;
  const canRespond =
    notification.kind === "project_invitation_received" && notification.project_invitation_id !== null;

  return (
    <li className="rounded-2xl transition hover:bg-[#F7FAF8]">
      <button
        type="button"
        onClick={() => onSelect(notification)}
        className="flex w-full cursor-pointer gap-3 px-3 py-3 text-left"
      >
        <NotificationIcon kind={notification.kind} />

        <span className="min-w-0 flex-1">
          <span className="flex items-start gap-2">
            <span className="min-w-0 flex-1 text-sm font-semibold text-[#1F2A24]">{notification.title}</span>
            {isUnread && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#43AD61]" />}
          </span>

          <span className="mt-0.5 block text-xs font-medium leading-relaxed text-[#718078]">
            {notification.message}
          </span>

          <span className="mt-1 block text-[11px] font-medium text-[#9AA79F]">
            {formatDate(notification.created_at)}
          </span>
        </span>
      </button>

      {canRespond && (
        <div className="pb-3 pl-[60px] pr-3">
          <InvitationActions
            busy={processing}
            onAccept={() => onInvitationAction(notification, "accept")}
            onDecline={() => onInvitationAction(notification, "decline")}
          />
        </div>
      )}
    </li>
  );
}

export default NotificationItem;

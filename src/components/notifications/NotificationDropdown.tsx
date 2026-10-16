import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "../../hooks/notificationsContext";
import { acceptInvitation, declineInvitation } from "../../lib/projectApi";
import type { Notification } from "../../types/notification";
import BellIcon from "../icons/BellIcon";
import NotificationItem from "./NotificationItem";

type NotificationDropdownProps = { onClose: () => void };

function NotificationDropdown({ onClose }: NotificationDropdownProps) {
  const navigate = useNavigate();
  const { notifications, unreadCount, loading, reloadNotifications, markRead, markAllRead } =
    useNotifications();
  const [processingId, setProcessingId] = useState<string | null>(null);

  async function handleSelect(notification: Notification) {
    if (!notification.read_at) {
      await markRead(notification.id);
    }

    onClose();

    if (notification.target_url) {
      navigate(notification.target_url);
    }
  }

  async function handleInvitationAction(notification: Notification, action: "accept" | "decline") {
    const invitationId = notification.project_invitation_id;

    if (!invitationId) return;

    setProcessingId(notification.id);

    const result =
      action === "accept"
        ? await acceptInvitation(invitationId)
        : await declineInvitation(invitationId);

    if (result.ok) {
      await reloadNotifications();
    }

    setProcessingId(null);
  }

  return (
    <div className="absolute right-0 top-14 z-50 w-96 max-w-[90vw] overflow-hidden rounded-[18px] border border-[#D8E3DB] bg-white shadow-[0_20px_50px_rgba(23,33,27,0.18)]">
      <div className="flex items-center justify-between gap-3 border-b border-[#E4EBE6] px-4 py-3">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold tracking-tight">Notifications</p>
          {unreadCount > 0 && (
            <span className="rounded-full bg-[#EAF5EE] px-2 py-0.5 text-[11px] font-semibold text-[#23613F]">
              {unreadCount} new
            </span>
          )}
        </div>

        {unreadCount > 0 && (
          <button
            type="button"
            onClick={() => void markAllRead()}
            className="cursor-pointer text-xs font-semibold text-[#23613F] hover:underline"
          >
            Mark all as read
          </button>
        )}
      </div>

      <div className="max-h-[26rem] overflow-y-auto p-1.5">
        {loading ? (
          <p className="px-3 py-10 text-center text-sm font-medium text-[#8A9990]">Loading...</p>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-6 py-12 text-center">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#EFF5F1] text-[#8A9990]">
              <BellIcon />
            </span>
            <p className="text-sm font-semibold text-[#53665A]">No notifications yet</p>
            <p className="text-xs font-medium text-[#9AA79F]">
              Updates about your projects will show up here.
            </p>
          </div>
        ) : (
          <ul className="space-y-1">
            {notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                processing={processingId === notification.id}
                onSelect={handleSelect}
                onInvitationAction={handleInvitationAction}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default NotificationDropdown;

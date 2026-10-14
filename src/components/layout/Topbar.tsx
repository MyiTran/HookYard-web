import { useState } from "react";
import { useNotifications } from "../../hooks/notificationsContext";
import BellIcon from "../icons/BellIcon";
import NotificationDropdown from "../notifications/NotificationDropdown";

type TopbarProps = { title: string };

function Topbar({ title }: TopbarProps) {
  const [open, setOpen] = useState(false);
  const { unreadCount } = useNotifications();

  return (
    <header className="flex h-20 items-center justify-between border-b border-[#DCE6DF] bg-white px-8">
      <div className="flex items-center gap-2 text-sm">
        <span className="font-medium text-[#5D7063]">HookYard</span>
        <span className="text-[#9EADA3]">/</span>
        <span className="font-semibold">{title}</span>
      </div>

      <div className="relative">
        <button
          type="button"
          aria-label="Notifications"
          onClick={() => setOpen((value) => !value)}
          className="relative flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl text-[#405348] transition hover:bg-[#EFF5F1]"
        >
          <BellIcon />
          {unreadCount > 0 && (
            <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#43AD61] px-1 text-[10px] font-semibold text-white">
              {unreadCount}
            </span>
          )}
        </button>

        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <NotificationDropdown onClose={() => setOpen(false)} />
          </>
        )}
      </div>
    </header>
  );
}

export default Topbar;

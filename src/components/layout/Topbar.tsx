import { useState } from "react";
import { useNotifications } from "../../hooks/notificationsContext";
import BarsIcon from "../icons/BarsIcon";
import BellIcon from "../icons/BellIcon";
import NotificationDropdown from "../notifications/NotificationDropdown";

type TopbarProps = { title: string; menuOpen: boolean; onOpenMenu: () => void };

function Topbar({ title, menuOpen, onOpenMenu }: TopbarProps) {
  const [open, setOpen] = useState(false);
  const { unreadCount } = useNotifications();

  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-3 border-b border-[#DCE6DF] bg-white px-4 sm:h-20 sm:px-6 lg:px-8">
      <div className="flex min-w-0 items-center gap-2 text-sm">
        <button
          type="button"
          aria-label="Open navigation"
          aria-controls="mobile-navigation"
          aria-expanded={menuOpen}
          onClick={onOpenMenu}
          className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-xl text-[#405348] transition hover:bg-[#EFF5F1] lg:hidden"
        >
          <BarsIcon className="h-5 w-5" />
        </button>

        <span className="hidden shrink-0 font-medium text-[#5D7063] sm:inline">HookYard</span>
        <span className="hidden shrink-0 text-[#9EADA3] sm:inline">/</span>
        <span className="min-w-0 truncate font-semibold">{title}</span>
      </div>

      <div className="relative shrink-0">
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

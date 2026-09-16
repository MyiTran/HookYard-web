import type { CurrentUser } from "../../types/user";

type TopbarProps = { user: CurrentUser; title: string; };

function Topbar({ user, title }: TopbarProps) {
  const isAdmin = user.role === "admin";

  return (
    <header className="flex h-20 items-center justify-between border-b border-[#DCE6DF] bg-white px-8">
      <div className="flex items-center gap-2 text-sm">
        <span className="font-medium text-[#5D7063]">HookYard</span>
        <span className="text-[#9EADA3]">/</span>
        <span className="font-semibold">{title}</span>
      </div>

      <div className="flex items-center gap-6">
        <div className="text-right">
          <span className="block text-[10px] font-semibold uppercase tracking-[2px] text-[#65766B]">{isAdmin ? "Scope" : "Project"}</span>
          <span className="mt-1 block text-sm font-semibold">{isAdmin ? "All projects" : "No project selected"}</span>
        </div>

        <div className="h-9 w-px bg-[#DCE6DF]" />

        <button type="button" aria-label="Notifications" className="relative flex h-10 w-10 items-center justify-center rounded-xl text-[#405348] transition hover:bg-[#EFF5F1]">
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
            <path d="M10 21h4" />
          </svg>
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#43AD61]" />
        </button>
      </div>
    </header>
  );
}

export default Topbar;

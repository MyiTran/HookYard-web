import { useEffect, useState, type ReactNode } from "react";
import type { CurrentUser } from "../../types/user";
import CloseIcon from "../icons/CloseIcon";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

type AppLayoutProps = { user: CurrentUser; title: string; children: ReactNode };

function AppLayout({ user, title, children }: AppLayoutProps) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    if (!mobileNavOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setMobileNavOpen(false);
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [mobileNavOpen]);

  function closeMobileNav() {
    setMobileNavOpen(false);
  }

  return (
    <div className="h-screen overflow-hidden bg-[#CFE0D3] text-[#17211B]">
      <div className="flex h-full min-w-0">
        <div className="hidden w-64 shrink-0 lg:flex">
          <Sidebar user={user} />
        </div>

        {mobileNavOpen && (
          <div className="fixed inset-0 z-50 flex lg:hidden">
            <button
              type="button"
              aria-label="Close navigation"
              onClick={closeMobileNav}
              className="absolute inset-0 cursor-default bg-[#17211B]/45"
            />

            <div
              id="mobile-navigation"
              role="dialog"
              aria-modal="true"
              aria-label="Navigation"
              className="relative z-10 flex h-full w-72 max-w-[85vw] flex-col shadow-[0_24px_70px_rgba(23,33,27,0.28)]"
            >
              <button
                type="button"
                aria-label="Close navigation"
                autoFocus
                onClick={closeMobileNav}
                className="absolute right-3 top-4 z-10 flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-[#405348] transition hover:bg-[#C1D5C6]"
              >
                <CloseIcon />
              </button>

              <Sidebar user={user} onNavigate={closeMobileNav} />
            </div>
          </div>
        )}

        <main className="m-3 ml-0 flex min-w-0 flex-1 flex-col overflow-hidden rounded-[26px] border border-[#C2D4C7] bg-[#F7FAF8] shadow-[0_20px_60px_rgba(32,78,53,0.09)]">
          <Topbar
            title={title}
            menuOpen={mobileNavOpen}
            onOpenMenu={() => setMobileNavOpen(true)}
          />
          <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">{children}</div>
        </main>
      </div>
    </div>
  );
}

export default AppLayout;

import type { ReactNode } from "react";
import type { CurrentUser } from "../../types/user";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

type AppLayoutProps = { user: CurrentUser; title: string; children: ReactNode;};

function AppLayout({ user, title, children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-[#CFE0D3] text-[#17211B]">
      <div className="flex min-h-screen">
        <Sidebar user={user} />

        <main className="m-3 ml-0 flex min-w-0 flex-1 flex-col overflow-hidden rounded-[26px] border border-[#C2D4C7] bg-[#F7FAF8] shadow-[0_20px_60px_rgba(32,78,53,0.09)]">
          <Topbar user={user} title={title} />
          <div className="flex-1 p-8">{children}</div>
        </main>
      </div>
    </div>
  );
}

export default AppLayout;

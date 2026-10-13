import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import Brand from "../branding/Brand";
import { API_URL } from "../../config";
import type { CurrentUser } from "../../types/user";
import MenuIcon from "./MenuIcon";

type SidebarProps = { user: CurrentUser; };

function Sidebar({ user }: SidebarProps) {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const isAdmin = user.role === "admin";
  
  const location = useLocation();
  const currentPath = location.pathname;

  const menuItems = isAdmin
    ? [
        { name: "Overview", path: "/admin" },
        { name: "Support accounts", path: "/admin/users" },
        { name: "Projects", path: "/admin/projects" },
        { name: "Endpoints", path: "/admin/endpoints" },
        { name: "Deliveries", path: "/admin/deliveries" },
      ]
    : [
        { name: "Overview", path: "/" },
        { name: "Projects", path: "/projects" },
        { name: "Endpoints", path: "/endpoints" },
        { name: "Deliveries", path: "/deliveries" },
        { name: "Replay", path: "/replay" },
        { name: "Diagnose", path: "/diagnose" },
      ];

  async function logout() {
    const token = localStorage.getItem("token");

    await fetch(`${API_URL}/auth/sign_out`, {
      method: "DELETE",
      headers: { 
        "Accept": "application/json", 
        "Authorization": token || "" 
      },
    });

    localStorage.removeItem("token");
    window.location.href = "/users/sign_in";
  }

  return (
    <aside className="flex w-64 shrink-0 flex-col bg-[#CFE0D3] px-6 py-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          <Brand />
        </h1>
        <p className="mt-1 text-xs font-medium uppercase tracking-[3px] text-[#53665A]">Webhook operations</p>
      </div>

      <nav className="mt-12 space-y-1">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[2px] text-[#53665A]">Workspace</p>

        {menuItems.map((item) => {
          const active = currentPath === item.path;

          return (
            <Link
              key={item.name}
              to={item.path}
              className={active ? "flex h-12 items-center gap-3 rounded-xl bg-[#B6CEBC] px-4 font-semibold text-[#173D28]" : "flex h-12 items-center gap-3 rounded-xl px-4 font-medium text-[#405348] transition hover:bg-[#C1D5C6] hover:text-[#173D28]"}
            >
              <MenuIcon name={item.name} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="relative mt-auto border-t border-[#B7CCBC] pt-5">
        <button type="button" onClick={() => setShowUserMenu(!showUserMenu)} className="flex w-full items-center gap-3 rounded-xl p-2 text-left transition hover:bg-[#C1D5C6]">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#214E35] font-semibold text-white">
            {user.name.charAt(0).toUpperCase()}
          </span>

          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-semibold">{user.name}</span>
            <span className="block text-xs font-medium capitalize text-[#607267]">{user.role}</span>
          </span>

          <span className="text-xs text-[#607267]">⌃</span>
        </button>

        {showUserMenu && (
          <div className="absolute bottom-16 left-0 z-20 w-full rounded-xl border border-[#B7CCBC] bg-white p-2 shadow-[0_16px_40px_rgba(23,33,27,0.14)]">
            <div className="border-b border-[#E4EBE6] px-3 py-3">
              <p className="truncate text-xs text-[#607267]">{user.email}</p>
            </div>

            <button type="button" onClick={logout} className="mt-2 flex h-10 w-full items-center rounded-lg px-3 text-sm font-medium text-[#934343] transition hover:bg-[#FBEEEE]">
              Sign out
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}

export default Sidebar;

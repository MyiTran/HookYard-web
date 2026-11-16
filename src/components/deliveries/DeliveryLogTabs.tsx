import { Link, useLocation } from "react-router-dom";

type DeliveryLogTab = {
  label: string;
  to: string;
  matches: (pathname: string) => boolean;
};

const TABS: DeliveryLogTab[] = [
  {
    label: "Deliveries",
    to: "/deliveries",
    matches: (pathname) => !pathname.startsWith("/deliveries/rejections"),
  },
  {
    label: "Ingest rejections",
    to: "/deliveries/rejections",
    matches: (pathname) => pathname.startsWith("/deliveries/rejections"),
  },
];

function DeliveryLogTabs() {
  const { pathname } = useLocation();

  return (
    <nav
      aria-label="Delivery log views"
      className="mt-6 inline-flex max-w-full gap-1 overflow-x-auto rounded-2xl border border-[#D8E3DB] bg-white p-1 shadow-[0_8px_30px_rgba(32,78,53,0.05)]"
    >
      {TABS.map((tab) => {
        const active = tab.matches(pathname);

        return (
          <Link
            key={tab.to}
            to={tab.to}
            aria-current={active ? "page" : undefined}
            className={`flex h-10 shrink-0 items-center rounded-xl px-4 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#23613F]/40 ${
              active ? "bg-[#214E35] text-white" : "text-[#405348] hover:bg-[#F1F6F2]"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}

export default DeliveryLogTabs;

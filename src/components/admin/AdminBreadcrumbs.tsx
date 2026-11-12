import { Link } from "react-router-dom";
import ChevronRightIcon from "../icons/ChevronRightIcon";

export type AdminBreadcrumbItem = {
  label: string;
  to?: string;
};

type AdminBreadcrumbsProps = {
  items: AdminBreadcrumbItem[];
};

function AdminBreadcrumbs({ items }: AdminBreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-x-2 gap-y-1">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <span key={`${item.label}-${index}`} className="flex items-center gap-x-2">
            {item.to && !isLast ? (
              <Link to={item.to} className="text-sm font-semibold text-[#23613F] transition hover:underline">
                {item.label}
              </Link>
            ) : (
              <span className={`text-sm font-semibold ${isLast ? "text-[#1F2A24]" : "text-[#718078]"}`}>{item.label}</span>
            )}

            {!isLast && <ChevronRightIcon className="h-3.5 w-3.5 text-[#8A9990]" />}
          </span>
        );
      })}
    </nav>
  );
}

export default AdminBreadcrumbs;

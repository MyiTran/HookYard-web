type MenuIconProps = { name: string; };

function MenuIcon({ name }: MenuIconProps) {
  if (name === "Overview") {
    return (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    );
  }

  if (name === "Support accounts") {
    return (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="9" cy="8" r="3" />
        <path d="M3 20c0-4 2.5-6 6-6s6 2 6 6" />
        <path d="M16 5a3 3 0 0 1 0 6" />
        <path d="M17 14c2.5.5 4 2.5 4 5" />
      </svg>
    );
  }

  if (name === "Project") {
    return (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M4 21V5l8-3 8 3v16" />
        <path d="M8 8h2M14 8h2M8 12h2M14 12h2M8 16h2M14 16h2" />
      </svg>
    );
  }

  if (name === "Endpoints") {
    return (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M9 7V3M15 7V3M7 7h10v4a5 5 0 0 1-5 5v5" />
      </svg>
    );
  }

  if (name === "Deliveries") {
    return (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M3 12h4l2-6 4 12 2-6h6" />
      </svg>
    );
  }

  if (name === "Replay") {
    return (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M4 12a8 8 0 1 0 3-6" />
        <path d="M4 4v6h6" />
      </svg>
    );
  }

  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-4-4M11 8v3M11 14h.01" />
    </svg>
  );
}

export default MenuIcon;

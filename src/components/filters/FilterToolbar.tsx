import type { ReactNode } from "react";

type FilterToolbarProps = {
  onSubmit: () => void;
  children: ReactNode;
  footer?: ReactNode;
};

function FilterToolbar({ onSubmit, children, footer }: FilterToolbarProps) {
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
      className="rounded-[16px] border border-[#D8E3DB] bg-white p-3 shadow-[0_8px_30px_rgba(32,78,53,0.05)]"
    >
      <div className="flex flex-wrap items-center gap-2">{children}</div>

      {footer && <div className="mt-3 border-t border-[#E4EBE6] pt-3">{footer}</div>}
    </form>
  );
}

export default FilterToolbar;

import BellIcon from "../icons/BellIcon";

type TopbarProps = { title: string };

function Topbar({ title }: TopbarProps) {
  return (
    <header className="flex h-20 items-center justify-between border-b border-[#DCE6DF] bg-white px-8">
      <div className="flex items-center gap-2 text-sm">
        <span className="font-medium text-[#5D7063]">HookYard</span>
        <span className="text-[#9EADA3]">/</span>
        <span className="font-semibold">{title}</span>
      </div>

      <button
        type="button"
        aria-label="Notifications"
        className="relative flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl text-[#405348] transition hover:bg-[#EFF5F1]"
      >
        <BellIcon />
        <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#43AD61]" />
      </button>
    </header>
  );
}

export default Topbar;

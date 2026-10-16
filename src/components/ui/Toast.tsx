import AlertTriangleIcon from "../icons/AlertTriangleIcon";
import CheckCircleIcon from "../icons/CheckCircleIcon";
import CloseIcon from "../icons/CloseIcon";
import type { ToastType } from "./toastContext";

type ToastProps = {
  type: ToastType;
  message: string;
  onClose: () => void;
};

const TONES: Record<ToastType, { Icon: typeof CheckCircleIcon; iconClass: string }> = {
  success: { Icon: CheckCircleIcon, iconClass: "bg-[#EAF5EE] text-[#23613F]" },
  error: { Icon: AlertTriangleIcon, iconClass: "bg-[#FBEEEE] text-[#B42318]" },
};

function Toast({ type, message, onClose }: ToastProps) {
  const { Icon, iconClass } = TONES[type];

  return (
    <div className="pointer-events-auto flex w-80 max-w-[90vw] items-center gap-3 rounded-[16px] border border-[#D8E3DB] bg-white p-3.5 shadow-[0_20px_50px_rgba(23,33,27,0.18)]">
      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${iconClass}`} aria-hidden="true">
        <Icon className="h-4 w-4" />
      </span>

      <p className="min-w-0 flex-1 text-sm font-medium text-[#1F2A24]">{message}</p>

      <button
        type="button"
        aria-label="Dismiss"
        onClick={onClose}
        className="flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-lg text-[#718078] transition hover:bg-[#F1F6F2] hover:text-[#405348]"
      >
        <CloseIcon />
      </button>
    </div>
  );
}

export default Toast;

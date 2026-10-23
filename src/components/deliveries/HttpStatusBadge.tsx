import { attemptFailureShortLabel } from "../../lib/deliveryStatus";

type HttpStatusBadgeProps = {
  status: number | null;
  errorType?: string | null;
};

const TONE_CLASSES = {
  success: "bg-[#EAF5EE] text-[#23613F]",
  redirect: "bg-[#E8F1FB] text-[#2563A8]",
  clientError: "bg-[#FBF1E4] text-[#9A6B1F]",
  serverError: "bg-[#FBEEEE] text-[#B42318]",
  neutral: "bg-[#EFF5F1] text-[#53665A]",
} as const;

function toneFor(status: number): keyof typeof TONE_CLASSES {
  if (status >= 200 && status < 300) return "success";
  if (status >= 300 && status < 400) return "redirect";
  if (status >= 400 && status < 500) return "clientError";
  if (status >= 500) return "serverError";

  return "neutral";
}

function HttpStatusBadge({ status, errorType }: HttpStatusBadgeProps) {
  if (status === null) {
    return (
      <span
        className={`inline-flex rounded-md px-1.5 py-0.5 text-xs font-semibold ${
          errorType ? TONE_CLASSES.clientError : TONE_CLASSES.neutral
        }`}
      >
        {attemptFailureShortLabel(errorType)}
      </span>
    );
  }

  return (
    <span className={`inline-flex rounded-md px-1.5 py-0.5 text-xs font-semibold ${TONE_CLASSES[toneFor(status)]}`}>
      HTTP {status}
    </span>
  );
}

export default HttpStatusBadge;

import { useState } from "react";
import { planLabel } from "../../lib/plan";
import type { AdminSupportAccount } from "../../types/admin";
import { PLANS, type Plan } from "../../types/plan";
import Button from "../ui/Button";
import Modal from "../ui/Modal";

type AdminChangePlanModalProps = {
  account: AdminSupportAccount;
  pending: boolean;
  error: string;
  onSubmit: (plan: Plan) => void;
  onClose: () => void;
};

function AdminChangePlanModal({ account, pending, error, onSubmit, onClose }: AdminChangePlanModalProps) {
  const [selected, setSelected] = useState<Plan>(account.plan);
  const unchanged = selected === account.plan;

  return (
    <Modal title="Change account plan" onClose={onClose}>
      <p className="text-sm leading-6 text-[#53665A]">
        This changes the plan for projects billed to{" "}
        <span className="font-semibold text-[#1F2A24]">{account.name}</span>.
      </p>

      <div className="mt-4 rounded-xl border border-[#E4EBE6] bg-[#F7FAF8] px-4 py-3">
        <p className="text-[10px] font-semibold uppercase tracking-[2px] text-[#8A9990]">Current plan</p>
        <p className="mt-1 text-sm font-semibold text-[#1F2A24]">{planLabel(account.plan)}</p>
      </div>

      <label className="mt-4 block">
        <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[2px] text-[#8A9990]">
          New plan
        </span>
        <select
          value={selected}
          onChange={(event) => setSelected(event.target.value as Plan)}
          disabled={pending}
          aria-label="New plan"
          className="h-11 w-full cursor-pointer rounded-xl border border-[#C9DACE] bg-white px-3 text-sm font-medium text-[#405348] outline-none transition focus:border-[#23613F] focus:ring-2 focus:ring-[#23613F]/10 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {PLANS.map((plan) => (
            <option key={plan} value={plan}>
              {planLabel(plan)}
            </option>
          ))}
        </select>
      </label>

      {error && (
        <p role="alert" className="mt-3 rounded-xl bg-[#FBEEEE] px-4 py-3 text-sm font-medium text-[#B42318]">
          {error}
        </p>
      )}

      <div className="mt-6 flex justify-end gap-3">
        <Button variant="secondary" size="lg" onClick={onClose} disabled={pending}>
          Cancel
        </Button>

        <Button
          variant="primary"
          size="lg"
          disabled={pending || unchanged}
          loading={pending}
          onClick={() => onSubmit(selected)}
        >
          {pending ? "Updating…" : "Change plan"}
        </Button>
      </div>
    </Modal>
  );
}

export default AdminChangePlanModal;

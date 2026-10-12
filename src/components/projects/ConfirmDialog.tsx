import Modal from "./Modal";

type ConfirmDialogProps = {
  title: string;
  description: string;
  confirmLabel: string;
  pendingLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
};

function ConfirmDialog({
  title,
  description,
  confirmLabel,
  pendingLabel,
  onConfirm,
  onCancel,
  loading = false,
}: ConfirmDialogProps) {
  return (
    <Modal title={title} onClose={onCancel}>
      <p className="text-sm leading-6 text-[#53665A]">{description}</p>

      <div className="mt-6 flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex h-11 items-center rounded-xl border border-[#C9DACE] px-5 text-sm font-semibold text-[#405348] transition hover:bg-[#F1F6F2]"
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={onConfirm}
          disabled={loading}
          className="inline-flex h-11 items-center rounded-xl bg-[#B42318] px-5 text-sm font-semibold text-white transition hover:bg-[#8F1C13] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? pendingLabel : confirmLabel}
        </button>
      </div>
    </Modal>
  );
}

export default ConfirmDialog;

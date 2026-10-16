import Button from "./Button";
import Modal from "./Modal";

type ConfirmDialogProps = {
  title: string;
  description: string;
  confirmLabel: string;
  pendingLabel: string;
  note?: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
};

function ConfirmDialog({
  title,
  description,
  confirmLabel,
  pendingLabel,
  note,
  onConfirm,
  onCancel,
  loading = false,
}: ConfirmDialogProps) {
  return (
    <Modal title={title} onClose={onCancel}>
      <p className="text-sm leading-6 text-[#53665A]">{description}</p>

      {note && <p className="mt-3 text-xs font-medium text-[#8A9990]">{note}</p>}

      <div className="mt-6 flex justify-end gap-3">
        <Button variant="secondary" size="lg" onClick={onCancel}>
          Cancel
        </Button>

        <Button variant="danger" size="lg" onClick={onConfirm} loading={loading}>
          {loading ? pendingLabel : confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}

export default ConfirmDialog;

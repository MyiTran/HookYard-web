import { useId } from "react";
import Button from "../ui/Button";
import Modal from "../ui/Modal";

type DiagnosisConfirmModalProps = {
  onConfirm: () => void;
  onCancel: () => void;
};

function DiagnosisConfirmModal({ onConfirm, onCancel }: DiagnosisConfirmModalProps) {
  const descriptionId = useId();

  return (
    <Modal title="Analyze recent failures?" onClose={onCancel} describedById={descriptionId}>
      <p id={descriptionId} className="text-sm leading-6 text-[#53665A]">
        HookYard analyzes recent redacted attempt evidence to identify a likely cause. Nothing is sent to the
        endpoint and no delivery state is changed.
      </p>

      <div className="mt-6 flex justify-end gap-3">
        <Button variant="secondary" size="lg" onClick={onCancel}>
          Cancel
        </Button>

        <Button variant="primary" size="lg" onClick={onConfirm}>
          Analyze failures
        </Button>
      </div>
    </Modal>
  );
}

export default DiagnosisConfirmModal;

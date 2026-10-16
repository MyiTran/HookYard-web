import Button from "../ui/Button";

type InvitationActionsProps = {
  busy?: boolean;
  size?: "sm" | "lg";
  onAccept: () => void;
  onDecline: () => void;
};

function InvitationActions({ busy = false, size = "sm", onAccept, onDecline }: InvitationActionsProps) {
  return (
    <div className="flex shrink-0 flex-wrap gap-2">
      <Button variant="primary" size={size} loading={busy} onClick={onAccept}>
        Accept
      </Button>
      <Button variant="secondary" size={size} disabled={busy} onClick={onDecline}>
        Decline
      </Button>
    </div>
  );
}

export default InvitationActions;

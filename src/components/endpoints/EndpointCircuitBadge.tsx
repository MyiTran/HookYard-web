import type { EndpointCircuit } from "../../types/endpoint";
import AlertTriangleIcon from "../icons/AlertTriangleIcon";
import ShieldIcon from "../icons/ShieldIcon";
import Badge from "../ui/Badge";

type EndpointCircuitBadgeProps = {
  circuit?: Pick<EndpointCircuit, "state"> | null;
  archived?: boolean;
  showEnabled?: boolean;
};

function EndpointCircuitBadge({ circuit, archived = false, showEnabled = false }: EndpointCircuitBadgeProps) {
  if (!circuit || archived || (circuit.state === "enabled" && !showEnabled)) return null;

  if (circuit.state === "enabled") {
    return (
      <Badge tone="green" dot>
        Enabled
      </Badge>
    );
  }

  if (circuit.state === "circuit_open") {
    return (
      <Badge tone="amber" dot>
        <span aria-hidden="true">
          <ShieldIcon className="h-3.5 w-3.5" />
        </span>
        Circuit open
      </Badge>
    );
  }

  return (
    <Badge tone="red" dot>
      <span aria-hidden="true">
        <AlertTriangleIcon className="h-3.5 w-3.5" />
      </span>
      Delivery disabled
    </Badge>
  );
}

export default EndpointCircuitBadge;

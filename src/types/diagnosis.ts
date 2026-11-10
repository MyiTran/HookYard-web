export type DiagnosisLabel =
  | "signature_mismatch"
  | "auth_expired"
  | "endpoint_moved"
  | "handler_timeout"
  | "payload_rejected"
  | "rate_limited"
  | "tls_failure"
  | "endpoint_gone"
  | "receiver_server_error"
  | "unknown";

export type DiagnosisSource = "ai" | "fallback";

export type EndpointDiagnosis = {
  label: DiagnosisLabel;
  suggested_action: string;
  source: DiagnosisSource;
  created_at: string;
};

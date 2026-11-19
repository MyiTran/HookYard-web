export type DiagnosisLabel =
  | "signature_mismatch"
  | "auth_expired"
  | "endpoint_moved"
  | "handler_timeout"
  | "payload_rejected"
  | "rate_limited"
  | "tls_failure"
  | "endpoint_gone"
  | "unknown";

export type DiagnosisSource = "ai" | "fallback";

export type EndpointDiagnosis = {
  label: DiagnosisLabel;
  suggested_action: string;
  source: DiagnosisSource;
  analyzed_attempt_count: number;
  created_at: string;
};

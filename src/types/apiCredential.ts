export type ProjectApiCredentialStatus = "active" | "revoked";

export type ProjectApiCredential = {
  id: string;
  name: string;
  token_hint: string;
  revoked_at: string | null;
  created_at: string;
  status: ProjectApiCredentialStatus;
};

export type CreatedProjectApiCredential = ProjectApiCredential & {
  token: string;
};

export type EndpointProject = {
  id: string;
  name: string;
};

export type Endpoint = {
  id: string;
  name: string;
  url: string;
  description: string | null;
  active: boolean;
  event_types: string[];
  archived_at: string | null;
  created_at: string;
  updated_at: string;
  has_signing_secret: boolean;
  signing_secret_version: number;
  signing_secret_last_rotated_at: string | null;
  project: EndpointProject;
};

export type EndpointWithSigningSecret = Endpoint & {
  signing_secret: string;
};

export type EndpointInput = {
  name: string;
  url: string;
  description: string;
  active: boolean;
  event_types: string[];
};

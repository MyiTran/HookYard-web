export type NotificationKind =
  | "project_invitation_received"
  | "project_invitation_accepted"
  | "project_invitation_declined";

export type Notification = {
  id: string;
  kind: NotificationKind;
  title: string;
  message: string;
  target_url: string | null;
  read_at: string | null;
  created_at: string;
  project_id: string | null;
  project_invitation_id: string | null;
};

export type NotificationsResponse = {
  data: Notification[];
  meta: {
    unread_count: number;
  };
};

export type NotificationRealtimeEvent = {
  type: "notification.created" | "notification.removed";
};

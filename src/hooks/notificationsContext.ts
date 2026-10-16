import { createContext, useContext } from "react";
import type { Notification } from "../types/notification";
import type { RealtimeStatus } from "./useNotificationsRealtime";

export type NotificationsValue = {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  status: RealtimeStatus;
  changeVersion: number;
  reloadNotifications: () => Promise<void>;
  markRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
};

export const NotificationsContext = createContext<NotificationsValue | null>(null);

export function useNotifications(): NotificationsValue {
  const value = useContext(NotificationsContext);

  if (!value) {
    throw new Error("useNotifications must be used within a NotificationsProvider");
  }

  return value;
}

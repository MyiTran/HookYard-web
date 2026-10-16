import { apiRequest, type ApiResult } from "./apiRequest";
import type { Notification, NotificationsResponse } from "../types/notification";

export type NotificationsPage = {
  notifications: Notification[];
  unreadCount: number;
};

export async function getNotifications(): Promise<ApiResult<NotificationsPage>> {
  const result = await apiRequest<NotificationsResponse>("/notifications", "GET");

  if (!result.ok) return result;

  return {
    ok: true,
    data: { notifications: result.data.data, unreadCount: result.data.meta.unread_count },
  };
}

export function markNotificationRead(id: string): Promise<ApiResult<Notification>> {
  return apiRequest<Notification>(`/notifications/${id}/read`, "PATCH");
}

export function markAllNotificationsRead(): Promise<ApiResult<void>> {
  return apiRequest<void>("/notifications/read_all", "PATCH");
}

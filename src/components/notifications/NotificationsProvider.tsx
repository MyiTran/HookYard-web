import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { NotificationsContext, type NotificationsValue } from "../../hooks/notificationsContext";
import { useNotificationsRealtime } from "../../hooks/useNotificationsRealtime";
import {
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "../../lib/notificationApi";
import type { Notification } from "../../types/notification";

type NotificationsProviderProps = { children: ReactNode };

const REALTIME_REFRESH_WINDOW_MS = 250;

function NotificationsProvider({ children }: NotificationsProviderProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [changeVersion, setChangeVersion] = useState(0);

  const refreshTimerRef = useRef<number | null>(null);
  const refreshingRef = useRef(false);
  const refreshQueuedRef = useRef(false);

  const loadNotifications = useCallback(async () => {
    const result = await getNotifications();

    if (result.ok) {
      setNotifications(result.data.notifications);
      setUnreadCount(result.data.unreadCount);
    }
  }, []);

  const refreshNotifications = useCallback(async () => {
    if (refreshingRef.current) {
      refreshQueuedRef.current = true;
      return;
    }

    refreshingRef.current = true;

    try {
      do {
        refreshQueuedRef.current = false;
        await loadNotifications();
        setChangeVersion((version) => version + 1);
      } while (refreshQueuedRef.current);
    } finally {
      refreshingRef.current = false;
    }
  }, [loadNotifications]);

  const scheduleRealtimeRefresh = useCallback(() => {
    if (refreshTimerRef.current !== null) return;

    refreshTimerRef.current = window.setTimeout(() => {
      refreshTimerRef.current = null;
      void refreshNotifications();
    }, REALTIME_REFRESH_WINDOW_MS);
  }, [refreshNotifications]);

  const reloadNotifications = useCallback(async () => {
    await loadNotifications();
    setChangeVersion((version) => version + 1);
  }, [loadNotifications]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      await loadNotifications();

      if (!cancelled) setLoading(false);
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [loadNotifications]);

  useEffect(() => {
    return () => {
      if (refreshTimerRef.current !== null) {
        window.clearTimeout(refreshTimerRef.current);
        refreshTimerRef.current = null;
      }
    };
  }, []);

  const { status } = useNotificationsRealtime({
    onNotificationChange: scheduleRealtimeRefresh,
    onConnected: () => reloadNotifications(),
  });

  const markRead = useCallback(
    async (id: string) => {
      await markNotificationRead(id);
      await loadNotifications();
    },
    [loadNotifications],
  );

  const markAllRead = useCallback(async () => {
    await markAllNotificationsRead();
    await loadNotifications();
  }, [loadNotifications]);

  const value: NotificationsValue = {
    notifications,
    unreadCount,
    loading,
    status,
    changeVersion,
    reloadNotifications,
    markRead,
    markAllRead,
  };

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>;
}

export default NotificationsProvider;

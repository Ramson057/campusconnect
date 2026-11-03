import React, { createContext, useCallback, useEffect, useState } from 'react';
import { NotificationItem } from '../types/models';
import {
  CreateAnnouncementPayload,
  notificationService,
} from '../services/notificationService';

export interface NotificationContextValue {
  notifications: NotificationItem[];
  unreadCount: number;
  isLoading: boolean;
  refreshNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  postAnnouncement: (payload: CreateAnnouncementPayload) => Promise<NotificationItem>;
}

export const NotificationContext = createContext<NotificationContextValue | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshNotifications = useCallback(async () => {
    setIsLoading(true);
    try {
      const items = await notificationService.getNotifications();
      setNotifications(items);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshNotifications();
  }, [refreshNotifications]);

  const markAsRead = useCallback(async (id: string) => {
    await notificationService.markAsRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  }, []);

  const markAllAsRead = useCallback(async () => {
    await notificationService.markAllAsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  }, []);

  const postAnnouncement = useCallback(async (payload: CreateAnnouncementPayload) => {
    const created = await notificationService.postAnnouncement(payload);
    setNotifications((prev) => [created, ...prev]);
    return created;
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        isLoading,
        refreshNotifications,
        markAsRead,
        markAllAsRead,
        postAnnouncement,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

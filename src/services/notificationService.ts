/**
 * Notifications & Organizer Announcements Service
 *
 * Endpoints:
 * - GET /api/v1/notifications
 *   Response: NotificationItem[]
 *
 * - PATCH /api/v1/notifications/:id/read
 *   Response: NotificationItem
 *
 * - PATCH /api/v1/notifications/read-all
 *   Response: { success: boolean }
 *
 * - POST /api/v1/notifications/announcements
 *   Body: { title, message, eventId, eventTitle, senderName, senderOrganization }
 *   Response: NotificationItem
 */

import { USE_MOCK_API } from '../config/env';
import { NotificationItem } from '../types/models';
import { mockStore } from '../mocks/mockStore';
import { apiRequest, simulateNetworkDelay } from './api';

export interface CreateAnnouncementPayload {
  title: string;
  message: string;
  eventId?: string;
  eventTitle?: string;
  senderName: string;
  senderOrganization: string;
}

export const notificationService = {
  /**
   * GET /api/v1/notifications
   */
  async getNotifications(): Promise<NotificationItem[]> {
    if (!USE_MOCK_API) {
      return apiRequest<NotificationItem[]>('/notifications');
    }

    const items = mockStore.getNotifications();
    return simulateNetworkDelay(items);
  },

  /**
   * PATCH /api/v1/notifications/:id/read
   */
  async markAsRead(notificationId: string): Promise<NotificationItem> {
    if (!USE_MOCK_API) {
      return apiRequest<NotificationItem>(`/notifications/${notificationId}/read`, {
        method: 'PATCH',
      });
    }

    const items = mockStore.getNotifications();
    const idx = items.findIndex((n) => n.id === notificationId);
    if (idx !== -1) {
      items[idx] = {
        ...items[idx],
        isRead: true,
        updatedAt: new Date().toISOString(),
      };
      mockStore.saveNotifications(items);
      return simulateNetworkDelay(items[idx]);
    }
    return simulateNetworkDelay(items[0]);
  },

  /**
   * PATCH /api/v1/notifications/read-all
   */
  async markAllAsRead(): Promise<{ success: boolean }> {
    if (!USE_MOCK_API) {
      return apiRequest<{ success: boolean }>('/notifications/read-all', {
        method: 'PATCH',
      });
    }

    const now = new Date().toISOString();
    const items = mockStore.getNotifications().map((n) => ({
      ...n,
      isRead: true,
      updatedAt: now,
    }));
    mockStore.saveNotifications(items);
    return simulateNetworkDelay({ success: true });
  },

  /**
   * POST /api/v1/notifications/announcements
   */
  async postAnnouncement(payload: CreateAnnouncementPayload): Promise<NotificationItem> {
    if (!USE_MOCK_API) {
      return apiRequest<NotificationItem>('/notifications/announcements', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    }

    const now = new Date().toISOString();
    const newItem: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: payload.title.trim(),
      message: payload.message.trim(),
      eventId: payload.eventId,
      eventTitle: payload.eventTitle,
      senderName: payload.senderName,
      senderOrganization: payload.senderOrganization,
      recipientRole: 'all',
      isRead: false,
      type: 'announcement',
      createdAt: now,
      updatedAt: now,
    };

    const items = mockStore.getNotifications();
    mockStore.saveNotifications([newItem, ...items]);
    return simulateNetworkDelay(newItem);
  },
};

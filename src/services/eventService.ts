/**
 * Event Discovery & Management Service
 *
 * Endpoints:
 * - GET /api/v1/events
 *   Query: ?page=1&limit=12&search=&category=&campus=&organizer=&date=&status=
 *   Response: PaginatedResponse<EventItem>
 *
 * - GET /api/v1/events/:id
 *   Response: EventItem
 *
 * - POST /api/v1/events
 *   Body: Omit<EventItem, 'id' | 'registeredCount' | 'checkedInCount' | 'status' | 'createdAt' | 'updatedAt'>
 *   Response: EventItem
 *
 * - PUT /api/v1/events/:id
 *   Body: Partial<EventItem>
 *   Response: EventItem
 *
 * - DELETE /api/v1/events/:id
 *   Response: { success: boolean, id: string }
 */

import { USE_MOCK_API } from '../config/env';
import {
  EventFilterParams,
  EventItem,
  PaginatedResponse,
} from '../types/models';
import { mockStore } from '../mocks/mockStore';
import { computeEventStatus, filterEventsList } from '../utils/eventRules';
import { ASSET_IMAGES } from '../assets/assetPaths';
import { ApiError, apiRequest, simulateNetworkDelay } from './api';

export type CreateEventPayload = Omit<
  EventItem,
  'id' | 'registeredCount' | 'checkedInCount' | 'status' | 'createdAt' | 'updatedAt'
>;

export const eventService = {
  /**
   * GET /api/v1/events
   */
  async getEvents(params: EventFilterParams = {}): Promise<PaginatedResponse<EventItem>> {
    const page = params.page || 1;
    const limit = params.limit || 20;

    if (!USE_MOCK_API) {
      const query = new URLSearchParams();
      query.set('page', String(page));
      query.set('limit', String(limit));
      if (params.search) query.set('search', params.search);
      if (params.category) query.set('category', params.category);
      if (params.campus) query.set('campus', params.campus);
      if (params.organizer) query.set('organizer', params.organizer);
      if (params.date) query.set('date', params.date);
      if (params.status) query.set('status', params.status);
      return apiRequest<PaginatedResponse<EventItem>>(`/events?${query.toString()}`);
    }

    const allEvents = mockStore.getEvents();
    const filtered = filterEventsList(allEvents, params);
    const start = (page - 1) * limit;
    const data = filtered.slice(start, start + limit);

    return simulateNetworkDelay({
      data,
      total: filtered.length,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(filtered.length / limit)),
    });
  },

  /**
   * GET /api/v1/events/:id
   */
  async getEventById(eventId: string): Promise<EventItem> {
    if (!USE_MOCK_API) {
      return apiRequest<EventItem>(`/events/${eventId}`);
    }

    const events = mockStore.getEvents();
    const found = events.find((e) => e.id === eventId);
    if (!found) {
      throw new ApiError('Event not found.', 404);
    }
    return simulateNetworkDelay(found);
  },

  /**
   * POST /api/v1/events
   */
  async createEvent(payload: CreateEventPayload): Promise<EventItem> {
    if (!USE_MOCK_API) {
      return apiRequest<EventItem>('/events', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    }

    const events = mockStore.getEvents();
    const now = new Date().toISOString();
    const newEvent: EventItem = {
      ...payload,
      id: `evt-${Date.now()}`,
      registeredCount: 0,
      checkedInCount: 0,
      imageUrl: payload.imageUrl?.trim() ? payload.imageUrl : ASSET_IMAGES.engineeringWeek,
      status: computeEventStatus(payload.date, 0, payload.capacity),
      createdAt: now,
      updatedAt: now,
    };

    const updated = [newEvent, ...events];
    mockStore.saveEvents(updated);
    return simulateNetworkDelay(newEvent);
  },

  /**
   * PUT /api/v1/events/:id
   */
  async updateEvent(eventId: string, payload: Partial<EventItem>): Promise<EventItem> {
    if (!USE_MOCK_API) {
      return apiRequest<EventItem>(`/events/${eventId}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
    }

    const events = mockStore.getEvents();
    const idx = events.findIndex((e) => e.id === eventId);
    if (idx === -1) {
      throw new ApiError('Event not found.', 404);
    }

    const current = events[idx];
    const nextDate = payload.date ?? current.date;
    const nextCap = payload.capacity ?? current.capacity;
    const nextReg = payload.registeredCount ?? current.registeredCount;

    const updatedEvent: EventItem = {
      ...current,
      ...payload,
      status: computeEventStatus(nextDate, nextReg, nextCap),
      updatedAt: new Date().toISOString(),
    };

    events[idx] = updatedEvent;
    mockStore.saveEvents(events);
    return simulateNetworkDelay(updatedEvent);
  },

  /**
   * DELETE /api/v1/events/:id
   */
  async deleteEvent(eventId: string): Promise<{ success: boolean; id: string }> {
    if (!USE_MOCK_API) {
      return apiRequest<{ success: boolean; id: string }>(`/events/${eventId}`, {
        method: 'DELETE',
      });
    }

    const events = mockStore.getEvents();
    const nextEvents = events.filter((e) => e.id !== eventId);
    mockStore.saveEvents(nextEvents);
    return simulateNetworkDelay({ success: true, id: eventId });
  },
};

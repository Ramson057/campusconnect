/**
 * Event Registration Service
 *
 * Endpoints:
 * - GET /api/v1/registrations/user/:userId
 *   Response: Registration[]
 *
 * - GET /api/v1/events/:eventId/registrations
 *   Response: Registration[]
 *
 * - POST /api/v1/events/:eventId/register
 *   Body: { userId, userName, userEmail, studentId, course, yearLevel }
 *   Response: Registration
 *
 * - DELETE /api/v1/events/:eventId/register/:userId
 *   Response: { success: boolean }
 */

import { USE_MOCK_API } from '../config/env';
import { AttendanceRecord, Registration, User } from '../types/models';
import { mockStore } from '../mocks/mockStore';
import { computeEventStatus } from '../utils/eventRules';
import { ApiError, apiRequest, simulateNetworkDelay } from './api';

export const registrationService = {
  /**
   * GET /api/v1/registrations/user/:userId
   */
  async getUserRegistrations(userId: string): Promise<Registration[]> {
    if (!USE_MOCK_API) {
      return apiRequest<Registration[]>(`/registrations/user/${userId}`);
    }

    const regs = mockStore
      .getRegistrations()
      .filter((r) => r.userId === userId && r.status === 'registered');
    return simulateNetworkDelay(regs);
  },

  /**
   * GET /api/v1/events/:eventId/registrations
   */
  async getEventRegistrations(eventId: string): Promise<Registration[]> {
    if (!USE_MOCK_API) {
      return apiRequest<Registration[]>(`/events/${eventId}/registrations`);
    }

    const regs = mockStore
      .getRegistrations()
      .filter((r) => r.eventId === eventId && r.status === 'registered');
    return simulateNetworkDelay(regs);
  },

  /**
   * POST /api/v1/events/:eventId/register
   */
  async registerForEvent(eventId: string, user: User): Promise<Registration> {
    if (!USE_MOCK_API) {
      return apiRequest<Registration>(`/events/${eventId}/register`, {
        method: 'POST',
        body: JSON.stringify({
          userId: user.id,
          userName: user.name,
          userEmail: user.email,
          studentId: user.studentId,
          course: user.course,
          yearLevel: user.yearLevel,
        }),
      });
    }

    const events = mockStore.getEvents();
    const evIdx = events.findIndex((e) => e.id === eventId);
    if (evIdx === -1) {
      throw new ApiError('Event not found.', 404);
    }

    const event = events[evIdx];
    if (event.status === 'ended') {
      throw new ApiError('Registration is closed because this event has already ended.', 400);
    }
    if (event.registeredCount >= event.capacity || event.status === 'full') {
      throw new ApiError('This event has reached full capacity.', 400);
    }

    const registrations = mockStore.getRegistrations();
    const existing = registrations.find(
      (r) => r.eventId === eventId && r.userId === user.id && r.status === 'registered'
    );
    if (existing) {
      throw new ApiError('You are already registered for this event.', 409);
    }

    const now = new Date().toISOString();
    const codePrefix = event.title.replace(/[^A-Za-z]/g, '').slice(0, 3).toUpperCase() || 'USC';
    const ticketCode = `USC-${codePrefix}-${String(Math.floor(1000 + Math.random() * 9000))}`;

    const newReg: Registration = {
      id: `reg-${Date.now()}`,
      eventId,
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      studentId: user.studentId,
      course: user.course,
      yearLevel: user.yearLevel,
      ticketCode,
      status: 'registered',
      registeredAt: now,
      createdAt: now,
      updatedAt: now,
    };

    mockStore.saveRegistrations([newReg, ...registrations]);

    // Update event count and status
    const nextCount = event.registeredCount + 1;
    events[evIdx] = {
      ...event,
      registeredCount: nextCount,
      status: computeEventStatus(event.date, nextCount, event.capacity),
      updatedAt: now,
    };
    mockStore.saveEvents(events);

    // Also add corresponding attendance sheet row so check-in screen shows the student immediately
    const attendance = mockStore.getAttendance();
    const newAttendance: AttendanceRecord = {
      id: `att-${Date.now()}`,
      eventId,
      registrationId: newReg.id,
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      studentId: user.studentId,
      course: user.course,
      ticketCode,
      checkedIn: false,
      checkedInAt: null,
      checkedInBy: null,
      createdAt: now,
      updatedAt: now,
    };
    mockStore.saveAttendance([newAttendance, ...attendance]);

    return simulateNetworkDelay(newReg);
  },

  /**
   * DELETE /api/v1/events/:eventId/register/:userId
   */
  async cancelRegistration(eventId: string, userId: string): Promise<{ success: boolean }> {
    if (!USE_MOCK_API) {
      return apiRequest<{ success: boolean }>(`/events/${eventId}/register/${userId}`, {
        method: 'DELETE',
      });
    }

    const registrations = mockStore.getRegistrations();
    const target = registrations.find(
      (r) => r.eventId === eventId && r.userId === userId && r.status === 'registered'
    );
    if (!target) {
      throw new ApiError('Active registration not found.', 404);
    }

    const nextRegs = registrations.filter((r) => r.id !== target.id);
    mockStore.saveRegistrations(nextRegs);

    // Decrement event registeredCount
    const events = mockStore.getEvents();
    const evIdx = events.findIndex((e) => e.id === eventId);
    if (evIdx !== -1) {
      const ev = events[evIdx];
      const nextCount = Math.max(0, ev.registeredCount - 1);
      events[evIdx] = {
        ...ev,
        registeredCount: nextCount,
        status: computeEventStatus(ev.date, nextCount, ev.capacity),
        updatedAt: new Date().toISOString(),
      };
      mockStore.saveEvents(events);
    }

    // Remove from attendance sheet
    const attendance = mockStore.getAttendance().filter((a) => a.registrationId !== target.id);
    mockStore.saveAttendance(attendance);

    return simulateNetworkDelay({ success: true });
  },
};

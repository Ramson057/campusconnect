/**
 * Attendance & Check-In Service
 *
 * Endpoints:
 * - GET /api/v1/events/:eventId/attendance
 *   Response: AttendanceRecord[]
 *
 * - PATCH /api/v1/attendance/:attendanceId/toggle
 *   Body: { checkedIn: boolean, verifierName: string }
 *   Response: AttendanceRecord
 *
 * - POST /api/v1/events/:eventId/checkin-code
 *   Body: { codeOrStudentId: string, verifierName: string }
 *   Response: AttendanceRecord
 */

import { USE_MOCK_API } from '../config/env';
import { AttendanceRecord } from '../types/models';
import { mockStore } from '../mocks/mockStore';
import { ApiError, apiRequest, simulateNetworkDelay } from './api';

export const attendanceService = {
  /**
   * GET /api/v1/events/:eventId/attendance
   */
  async getEventAttendance(eventId: string): Promise<AttendanceRecord[]> {
    if (!USE_MOCK_API) {
      return apiRequest<AttendanceRecord[]>(`/events/${eventId}/attendance`);
    }

    const list = mockStore.getAttendance().filter((a) => a.eventId === eventId);
    return simulateNetworkDelay(list);
  },

  /**
   * PATCH /api/v1/attendance/:attendanceId/toggle
   */
  async toggleCheckIn(
    attendanceId: string,
    checkedIn: boolean,
    verifierName = 'Event Organizer'
  ): Promise<AttendanceRecord> {
    if (!USE_MOCK_API) {
      return apiRequest<AttendanceRecord>(`/attendance/${attendanceId}/toggle`, {
        method: 'PATCH',
        body: JSON.stringify({ checkedIn, verifierName }),
      });
    }

    const records = mockStore.getAttendance();
    const idx = records.findIndex((r) => r.id === attendanceId);
    if (idx === -1) {
      throw new ApiError('Attendee record not found.', 404);
    }

    const now = new Date().toISOString();
    const prev = records[idx];
    const updated: AttendanceRecord = {
      ...prev,
      checkedIn,
      checkedInAt: checkedIn ? now : null,
      checkedInBy: checkedIn ? verifierName : null,
      updatedAt: now,
    };

    records[idx] = updated;
    mockStore.saveAttendance(records);

    // Sync event checkedInCount delta
    if (prev.checkedIn !== checkedIn) {
      const events = mockStore.getEvents();
      const evIdx = events.findIndex((e) => e.id === prev.eventId);
      if (evIdx !== -1) {
        const delta = checkedIn ? 1 : -1;
        events[evIdx] = {
          ...events[evIdx],
          checkedInCount: Math.max(0, events[evIdx].checkedInCount + delta),
          updatedAt: now,
        };
        mockStore.saveEvents(events);
      }
    }

    return simulateNetworkDelay(updated);
  },

  /**
   * POST /api/v1/events/:eventId/checkin-code
   */
  async checkInByTicketOrId(
    eventId: string,
    codeOrStudentId: string,
    verifierName = 'Event Organizer'
  ): Promise<AttendanceRecord> {
    if (!USE_MOCK_API) {
      return apiRequest<AttendanceRecord>(`/events/${eventId}/checkin-code`, {
        method: 'POST',
        body: JSON.stringify({ codeOrStudentId, verifierName }),
      });
    }

    const clean = codeOrStudentId.trim().toUpperCase();
    if (!clean) {
      throw new ApiError('Enter a valid Ticket Code or USC Student ID.', 400);
    }

    const records = mockStore.getAttendance();
    const target = records.find(
      (r) =>
        r.eventId === eventId &&
        (r.ticketCode.toUpperCase() === clean || r.studentId.toUpperCase() === clean)
    );

    if (!target) {
      throw new ApiError(
        `No registered attendee found with ticket or USC ID "${codeOrStudentId.trim()}".`,
        404
      );
    }

    return this.toggleCheckIn(target.id, true, verifierName);
  },
};

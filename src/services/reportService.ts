/**
 * Analytics & Event Reports Service
 *
 * Endpoints:
 * - GET /api/v1/reports/dashboard
 *   Response: DashboardMetrics
 *
 * - GET /api/v1/reports/events
 *   Response: EventReportSummary[]
 *
 * - GET /api/v1/reports/events/:eventId/export?format=csv|pdf
 *   Response: { downloadUrl: string, filename: string, rowCount: number }
 */

import { USE_MOCK_API } from '../config/env';
import { DashboardMetrics, EventReportSummary } from '../types/models';
import { mockStore } from '../mocks/mockStore';
import { calculateAttendanceRate } from '../utils/eventRules';
import { apiRequest, simulateNetworkDelay } from './api';

export const reportService = {
  /**
   * GET /api/v1/reports/dashboard
   */
  async getDashboardMetrics(): Promise<DashboardMetrics> {
    if (!USE_MOCK_API) {
      return apiRequest<DashboardMetrics>('/reports/dashboard');
    }

    const events = mockStore.getEvents();
    const users = mockStore.getUsers();

    const totalEvents = events.length;
    const totalRegistrations = events.reduce((acc, e) => acc + e.registeredCount, 0);
    const totalCheckedIn = events.reduce((acc, e) => acc + e.checkedInCount, 0);
    const overallAttendanceRate = calculateAttendanceRate(totalCheckedIn, totalRegistrations);
    const activeUsers = users.filter((u) => u.status === 'active').length;

    const registrationsTrend = [
      { month: 'Aug', registrations: 280, attendance: 245 },
      { month: 'Sep', registrations: 420, attendance: 368 },
      { month: 'Oct', registrations: 615, attendance: 540 },
      { month: 'Nov', registrations: totalRegistrations, attendance: totalCheckedIn },
    ];

    const popularEvents = [...events]
      .sort((a, b) => b.registeredCount - a.registeredCount)
      .slice(0, 5)
      .map((e) => ({
        name: e.title.length > 15 ? `${e.title.slice(0, 14).trim()}…` : e.title,
        registered: e.registeredCount,
        capacity: e.capacity,
        attended: e.checkedInCount,
      }));

    return simulateNetworkDelay({
      totalEvents,
      totalRegistrations,
      overallAttendanceRate,
      activeUsers,
      registrationsTrend,
      popularEvents,
    });
  },

  /**
   * GET /api/v1/reports/events
   */
  async getEventReports(): Promise<EventReportSummary[]> {
    if (!USE_MOCK_API) {
      return apiRequest<EventReportSummary[]>('/reports/events');
    }

    const events = mockStore.getEvents();
    const summaries: EventReportSummary[] = events.map((ev) => ({
      eventId: ev.id,
      eventTitle: ev.title,
      organizer: ev.organizer,
      category: ev.category,
      date: ev.date,
      venue: `${ev.venue} (${ev.campus})`,
      capacity: ev.capacity,
      registeredCount: ev.registeredCount,
      attendedCount: ev.checkedInCount,
      attendanceRate: calculateAttendanceRate(ev.checkedInCount, ev.registeredCount),
      status: ev.status,
    }));

    return simulateNetworkDelay(summaries);
  },

  /**
   * GET /api/v1/reports/events/:eventId/export
   */
  async exportEventReport(
    eventId: string,
    format: 'csv' | 'pdf'
  ): Promise<{ filename: string; content: string; rowCount: number }> {
    if (!USE_MOCK_API) {
      return apiRequest<{ filename: string; content: string; rowCount: number }>(
        `/reports/events/${eventId}/export?format=${format}`
      );
    }

    const events = mockStore.getEvents();
    const event = events.find((e) => e.id === eventId) || events[0];
    const attendees = mockStore.getAttendance().filter((a) => a.eventId === event.id);

    const header = 'Ticket Code,Student ID,Full Name,Email,Program,Checked In,Checked In At';
    const rows = attendees.map(
      (a) =>
        `"${a.ticketCode}","${a.studentId}","${a.userName}","${a.userEmail}","${a.course}","${
          a.checkedIn ? 'Yes' : 'No'
        }","${a.checkedInAt || 'Pending'}"`
    );

    const csvContent = [header, ...rows].join('\n');
    const safeSlug = event.id.replace(/[^a-z0-9-]/gi, '_');

    return simulateNetworkDelay({
      filename: `${safeSlug}_attendance_report.${format}`,
      content: csvContent,
      rowCount: attendees.length,
    });
  },
};

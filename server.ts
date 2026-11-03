/**
 * CampusConnect — Node.js + Express + MySQL Backend Server
 * Implements the full REST API specified in API_CONTRACT.md under `/api/v1/*`
 * and serves the Vite React frontend on port 3000.
 */

import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { dbRepository, getMySqlStatus, initDatabasePool } from './server/db';
import {
  calculateAttendanceRate,
  computeEventStatus,
  filterEventsList,
} from './src/utils/eventRules';
import { ASSET_IMAGES } from './src/assets/assetPaths';
import {
  AttendanceRecord,
  EventItem,
  NotificationItem,
  Registration,
  User,
} from './src/types/models';

const PORT = 3000;

async function startServer() {
  await initDatabasePool();

  const app = express();
  app.use(express.json());

  // --------------------------------------------------------------------------
  // Health & Database Engine Status Endpoint
  // --------------------------------------------------------------------------
  app.get('/api/v1/health', (_req, res) => {
    const dbStatus = getMySqlStatus();
    res.json({
      status: 'ok',
      engine: 'Node.js + Express + MySQL (mysql2)',
      mysql: dbStatus,
      timestamp: new Date().toISOString(),
    });
  });

  // --------------------------------------------------------------------------
  // 1. Auth & Users Routes (/api/v1/auth/* & /api/v1/users/*)
  // --------------------------------------------------------------------------
  app.post('/api/v1/auth/login', async (req, res) => {
    try {
      const { email, role } = req.body;
      const users = await dbRepository.getUsers();
      const normalizedEmail = String(email || '').trim().toLowerCase();

      let user = users.find((u) => u.email.toLowerCase() === normalizedEmail);
      if (!user) {
        user =
          role === 'admin'
            ? users.find((u) => u.role === 'admin') || users[1]
            : users.find((u) => u.role === 'student') || users[0];
      } else if (role && user.role !== role) {
        user = { ...user, role };
      }

      const token = `usc-jwt-${user.id}-${Date.now()}`;
      res.json({ token, user });
    } catch (err) {
      res.status(500).json({ message: err instanceof Error ? err.message : 'Login error' });
    }
  });

  app.post('/api/v1/auth/register', async (req, res) => {
    try {
      const { name, email, studentId, password, role, course, yearLevel } = req.body;
      const users = await dbRepository.getUsers();
      const exists = users.some(
        (u) => u.email.toLowerCase() === String(email || '').trim().toLowerCase()
      );
      if (exists) {
        res.status(409).json({ message: 'An account with this USC email already exists.' });
        return;
      }

      const now = new Date().toISOString();
      const newUser: User = {
        id: `usr-${Date.now()}`,
        name: String(name || '').trim(),
        email: String(email || '').trim(),
        studentId: String(studentId || '').trim(),
        role: role === 'admin' ? 'admin' : 'student',
        course: course || 'BS Computer Science',
        yearLevel: yearLevel || '1st Year',
        department:
          role === 'admin'
            ? 'Office of Student Affairs & Accredited Organizations'
            : 'University of San Carlos Academic Department',
        organizations: ['USC Supreme Student Council (SSC)'],
        status: 'active',
        createdAt: now,
        updatedAt: now,
      };

      await dbRepository.createUser(newUser, password);
      const token = `usc-jwt-${newUser.id}-${Date.now()}`;
      res.status(201).json({ token, user: newUser });
    } catch (err) {
      res.status(500).json({ message: err instanceof Error ? err.message : 'Registration error' });
    }
  });

  app.put('/api/v1/users/:id', async (req, res) => {
    try {
      const updated = await dbRepository.updateUser(req.params.id, req.body);
      if (!updated) {
        res.status(404).json({ message: 'User profile not found.' });
        return;
      }
      res.json(updated);
    } catch (err) {
      res.status(500).json({ message: err instanceof Error ? err.message : 'Update error' });
    }
  });

  app.get('/api/v1/users', async (req, res) => {
    try {
      const page = Math.max(1, Number(req.query.page || 1));
      const limit = Math.max(1, Number(req.query.limit || 20));
      const users = await dbRepository.getUsers();
      const start = (page - 1) * limit;
      const data = users.slice(start, start + limit);

      res.json({
        data,
        total: users.length,
        page,
        limit,
        totalPages: Math.max(1, Math.ceil(users.length / limit)),
      });
    } catch (err) {
      res.status(500).json({ message: err instanceof Error ? err.message : 'Error loading users' });
    }
  });

  // --------------------------------------------------------------------------
  // 2. Events Routes (/api/v1/events/*)
  // --------------------------------------------------------------------------
  app.get('/api/v1/events', async (req, res) => {
    try {
      const page = Math.max(1, Number(req.query.page || 1));
      const limit = Math.max(1, Number(req.query.limit || 20));
      const allEvents = await dbRepository.getEvents();

      const filtered = filterEventsList(allEvents, {
        search: req.query.search ? String(req.query.search) : undefined,
        category: req.query.category ? String(req.query.category) : undefined,
        campus: req.query.campus ? String(req.query.campus) : undefined,
        organizer: req.query.organizer ? String(req.query.organizer) : undefined,
        date: req.query.date ? String(req.query.date) : undefined,
        status: req.query.status ? String(req.query.status) : undefined,
      });

      const start = (page - 1) * limit;
      const data = filtered.slice(start, start + limit);

      res.json({
        data,
        total: filtered.length,
        page,
        limit,
        totalPages: Math.max(1, Math.ceil(filtered.length / limit)),
      });
    } catch (err) {
      res.status(500).json({ message: err instanceof Error ? err.message : 'Error loading events' });
    }
  });

  app.get('/api/v1/events/:id', async (req, res) => {
    try {
      const event = await dbRepository.getEventById(req.params.id);
      if (!event) {
        res.status(404).json({ message: 'Event not found.' });
        return;
      }
      res.json(event);
    } catch (err) {
      res.status(500).json({ message: err instanceof Error ? err.message : 'Error loading event' });
    }
  });

  app.post('/api/v1/events', async (req, res) => {
    try {
      const payload = req.body;
      const now = new Date().toISOString();
      const capacity = Number(payload.capacity || 100);
      const newEvent: EventItem = {
        id: `evt-${Date.now()}`,
        title: String(payload.title || '').trim(),
        description: String(payload.description || '').trim(),
        date: payload.date,
        startTime: payload.startTime,
        endTime: payload.endTime,
        venue: String(payload.venue || '').trim(),
        campus: payload.campus,
        category: payload.category,
        organizer: payload.organizer,
        organizerId: payload.organizerId || 'usr-admin-1',
        capacity,
        registeredCount: 0,
        checkedInCount: 0,
        isFeatured: Boolean(payload.isFeatured),
        status: computeEventStatus(payload.date, 0, capacity),
        imageUrl: payload.imageUrl?.trim() ? payload.imageUrl : ASSET_IMAGES.engineeringWeek,
        createdAt: now,
        updatedAt: now,
      };

      const created = await dbRepository.createEvent(newEvent);
      res.status(201).json(created);
    } catch (err) {
      res.status(500).json({ message: err instanceof Error ? err.message : 'Error creating event' });
    }
  });

  app.put('/api/v1/events/:id', async (req, res) => {
    try {
      const existing = await dbRepository.getEventById(req.params.id);
      if (!existing) {
        res.status(404).json({ message: 'Event not found.' });
        return;
      }

      const payload = req.body;
      const nextDate = payload.date ?? existing.date;
      const nextCap = Number(payload.capacity ?? existing.capacity);
      const nextReg = Number(payload.registeredCount ?? existing.registeredCount);

      const updatedEvent: EventItem = {
        ...existing,
        ...payload,
        capacity: nextCap,
        registeredCount: nextReg,
        status: computeEventStatus(nextDate, nextReg, nextCap),
        updatedAt: new Date().toISOString(),
      };

      const saved = await dbRepository.updateEvent(req.params.id, updatedEvent);
      res.json(saved);
    } catch (err) {
      res.status(500).json({ message: err instanceof Error ? err.message : 'Error updating event' });
    }
  });

  app.delete('/api/v1/events/:id', async (req, res) => {
    try {
      await dbRepository.deleteEvent(req.params.id);
      res.json({ success: true, id: req.params.id });
    } catch (err) {
      res.status(500).json({ message: err instanceof Error ? err.message : 'Error deleting event' });
    }
  });

  // --------------------------------------------------------------------------
  // 3. Registrations Routes (/api/v1/registrations/* & /api/v1/events/:id/register)
  // --------------------------------------------------------------------------
  app.get('/api/v1/registrations/user/:userId', async (req, res) => {
    try {
      const regs = await dbRepository.getRegistrations();
      res.json(regs.filter((r) => r.userId === req.params.userId));
    } catch (err) {
      res.status(500).json({ message: err instanceof Error ? err.message : 'Error loading registrations' });
    }
  });

  app.get('/api/v1/events/:eventId/registrations', async (req, res) => {
    try {
      const regs = await dbRepository.getRegistrations();
      res.json(regs.filter((r) => r.eventId === req.params.eventId));
    } catch (err) {
      res.status(500).json({ message: err instanceof Error ? err.message : 'Error loading event registrations' });
    }
  });

  app.post('/api/v1/events/:eventId/register', async (req, res) => {
    try {
      const { eventId } = req.params;
      const { userId, userName, userEmail, studentId, course, yearLevel } = req.body;

      const event = await dbRepository.getEventById(eventId);
      if (!event) {
        res.status(404).json({ message: 'Event not found.' });
        return;
      }
      if (event.status === 'ended') {
        res.status(400).json({ message: 'Registration is closed because this event has already ended.' });
        return;
      }
      if (event.registeredCount >= event.capacity || event.status === 'full') {
        res.status(400).json({ message: 'This event has reached full capacity.' });
        return;
      }

      const regs = await dbRepository.getRegistrations();
      const duplicate = regs.find((r) => r.eventId === eventId && r.userId === userId);
      if (duplicate) {
        res.status(409).json({ message: 'You are already registered for this event.' });
        return;
      }

      const now = new Date().toISOString();
      const codePrefix = event.title.replace(/[^A-Za-z]/g, '').slice(0, 3).toUpperCase() || 'USC';
      const ticketCode = `USC-${codePrefix}-${String(Math.floor(1000 + Math.random() * 9000))}`;

      const newReg: Registration = {
        id: `reg-${Date.now()}`,
        eventId,
        userId,
        userName,
        userEmail,
        studentId,
        course,
        yearLevel,
        ticketCode,
        status: 'registered',
        registeredAt: now,
        createdAt: now,
        updatedAt: now,
      };

      const newAtt: AttendanceRecord = {
        id: `att-${Date.now()}`,
        eventId,
        registrationId: newReg.id,
        userId,
        userName,
        userEmail,
        studentId,
        course,
        ticketCode,
        checkedIn: false,
        checkedInAt: null,
        checkedInBy: null,
        createdAt: now,
        updatedAt: now,
      };

      const nextCount = event.registeredCount + 1;
      const updatedEvent: EventItem = {
        ...event,
        registeredCount: nextCount,
        status: computeEventStatus(event.date, nextCount, event.capacity),
        updatedAt: now,
      };

      await dbRepository.addRegistrationAndAttendance(newReg, newAtt, updatedEvent);
      res.status(201).json(newReg);
    } catch (err) {
      res.status(500).json({ message: err instanceof Error ? err.message : 'Error registering for event' });
    }
  });

  app.delete('/api/v1/events/:eventId/register/:userId', async (req, res) => {
    try {
      const { eventId, userId } = req.params;
      const regs = await dbRepository.getRegistrations();
      const target = regs.find((r) => r.eventId === eventId && r.userId === userId);
      if (!target) {
        res.status(404).json({ message: 'Active registration not found.' });
        return;
      }

      const event = await dbRepository.getEventById(eventId);
      let updatedEvent: EventItem | null = null;
      if (event) {
        const nextCount = Math.max(0, event.registeredCount - 1);
        updatedEvent = {
          ...event,
          registeredCount: nextCount,
          status: computeEventStatus(event.date, nextCount, event.capacity),
          updatedAt: new Date().toISOString(),
        };
      }

      await dbRepository.removeRegistration(target.id, updatedEvent);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ message: err instanceof Error ? err.message : 'Error cancelling registration' });
    }
  });

  // --------------------------------------------------------------------------
  // 4. Attendance & Check-In Routes (/api/v1/attendance/*)
  // --------------------------------------------------------------------------
  app.get('/api/v1/events/:eventId/attendance', async (req, res) => {
    try {
      const list = await dbRepository.getAttendanceByEvent(req.params.eventId);
      res.json(list);
    } catch (err) {
      res.status(500).json({ message: err instanceof Error ? err.message : 'Error loading attendance' });
    }
  });

  app.patch('/api/v1/attendance/:attendanceId/toggle', async (req, res) => {
    try {
      const { checkedIn, verifierName = 'Event Organizer' } = req.body;
      const all = await dbRepository.getAllAttendance();
      const existing = all.find((a) => a.id === req.params.attendanceId);
      if (!existing) {
        res.status(404).json({ message: 'Attendee record not found.' });
        return;
      }

      const nextCheckedIn = Boolean(checkedIn);
      const now = new Date().toISOString();
      const delta = existing.checkedIn === nextCheckedIn ? 0 : nextCheckedIn ? 1 : -1;

      const updated: AttendanceRecord = {
        ...existing,
        checkedIn: nextCheckedIn,
        checkedInAt: nextCheckedIn ? now : null,
        checkedInBy: nextCheckedIn ? verifierName : null,
        updatedAt: now,
      };

      await dbRepository.updateAttendanceRecord(updated, delta);
      res.json(updated);
    } catch (err) {
      res.status(500).json({ message: err instanceof Error ? err.message : 'Error toggling check-in' });
    }
  });

  app.post('/api/v1/events/:eventId/checkin-code', async (req, res) => {
    try {
      const { eventId } = req.params;
      const { codeOrStudentId, verifierName = 'Event Organizer' } = req.body;
      const clean = String(codeOrStudentId || '').trim().toUpperCase();

      if (!clean) {
        res.status(400).json({ message: 'Enter a valid Ticket Code or USC Student ID.' });
        return;
      }

      const eventRoster = await dbRepository.getAttendanceByEvent(eventId);
      const target = eventRoster.find(
        (r) => r.ticketCode.toUpperCase() === clean || r.studentId.toUpperCase() === clean
      );

      if (!target) {
        res.status(404).json({
          message: `No registered attendee found with ticket or USC ID "${String(codeOrStudentId).trim()}".`,
        });
        return;
      }

      const now = new Date().toISOString();
      const delta = target.checkedIn ? 0 : 1;
      const updated: AttendanceRecord = {
        ...target,
        checkedIn: true,
        checkedInAt: now,
        checkedInBy: verifierName,
        updatedAt: now,
      };

      await dbRepository.updateAttendanceRecord(updated, delta);
      res.json(updated);
    } catch (err) {
      res.status(500).json({ message: err instanceof Error ? err.message : 'Error checking in by code' });
    }
  });

  // --------------------------------------------------------------------------
  // 5. Notifications & Announcements Routes (/api/v1/notifications/*)
  // --------------------------------------------------------------------------
  app.get('/api/v1/notifications', async (_req, res) => {
    try {
      const items = await dbRepository.getNotifications();
      res.json(items);
    } catch (err) {
      res.status(500).json({ message: err instanceof Error ? err.message : 'Error loading notifications' });
    }
  });

  app.patch('/api/v1/notifications/read-all', async (_req, res) => {
    try {
      await dbRepository.markAllNotificationsRead();
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ message: err instanceof Error ? err.message : 'Error marking notifications read' });
    }
  });

  app.patch('/api/v1/notifications/:id/read', async (req, res) => {
    try {
      const updated = await dbRepository.markNotificationRead(req.params.id);
      res.json(updated);
    } catch (err) {
      res.status(500).json({ message: err instanceof Error ? err.message : 'Error marking notification read' });
    }
  });

  app.post('/api/v1/notifications/announcements', async (req, res) => {
    try {
      const { title, message, eventId, eventTitle, senderName, senderOrganization } = req.body;
      const now = new Date().toISOString();
      const newNotif: NotificationItem = {
        id: `notif-${Date.now()}`,
        title: String(title || '').trim(),
        message: String(message || '').trim(),
        eventId: eventId || undefined,
        eventTitle: eventTitle || undefined,
        senderName: senderName || 'Event Organizer',
        senderOrganization: senderOrganization || 'USC Supreme Student Council (SSC)',
        recipientRole: 'all',
        isRead: false,
        type: 'announcement',
        createdAt: now,
        updatedAt: now,
      };

      const saved = await dbRepository.createNotification(newNotif);
      res.status(201).json(saved);
    } catch (err) {
      res.status(500).json({ message: err instanceof Error ? err.message : 'Error posting announcement' });
    }
  });

  // --------------------------------------------------------------------------
  // 6. Reports & Analytics Routes (/api/v1/reports/*)
  // --------------------------------------------------------------------------
  app.get('/api/v1/reports/dashboard', async (_req, res) => {
    try {
      const [events, users] = await Promise.all([
        dbRepository.getEvents(),
        dbRepository.getUsers(),
      ]);

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

      res.json({
        totalEvents,
        totalRegistrations,
        overallAttendanceRate,
        activeUsers,
        registrationsTrend,
        popularEvents,
      });
    } catch (err) {
      res.status(500).json({ message: err instanceof Error ? err.message : 'Error loading dashboard metrics' });
    }
  });

  app.get('/api/v1/reports/events', async (_req, res) => {
    try {
      const events = await dbRepository.getEvents();
      const summaries = events.map((ev) => ({
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
      res.json(summaries);
    } catch (err) {
      res.status(500).json({ message: err instanceof Error ? err.message : 'Error loading event reports' });
    }
  });

  app.get('/api/v1/reports/events/:eventId/export', async (req, res) => {
    try {
      const format = req.query.format === 'pdf' ? 'pdf' : 'csv';
      const event = await dbRepository.getEventById(req.params.eventId);
      const attendees = await dbRepository.getAttendanceByEvent(req.params.eventId);

      const header = 'Ticket Code,Student ID,Full Name,Email,Program,Checked In,Checked In At';
      const rows = attendees.map(
        (a) =>
          `"${a.ticketCode}","${a.studentId}","${a.userName}","${a.userEmail}","${a.course}","${
            a.checkedIn ? 'Yes' : 'No'
          }","${a.checkedInAt || 'Pending'}"`
      );
      const csvContent = [header, ...rows].join('\n');
      const safeSlug = (event?.id || req.params.eventId).replace(/[^a-z0-9-]/gi, '_');

      res.json({
        filename: `${safeSlug}_attendance_report.${format}`,
        content: csvContent,
        rowCount: attendees.length,
      });
    } catch (err) {
      res.status(500).json({ message: err instanceof Error ? err.message : 'Error exporting report' });
    }
  });

  // --------------------------------------------------------------------------
  // Vite Middleware (Dev) or Static Assets (Production)
  // --------------------------------------------------------------------------
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[CampusConnect] Node.js + Express + MySQL server running at http://localhost:${PORT}`);
  });
}

startServer();

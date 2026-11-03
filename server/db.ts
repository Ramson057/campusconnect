/**
 * Multi-Driver Database Repository for CampusConnect (University of San Carlos)
 *
 * Priority Order:
 * 1. SUPABASE (PostgreSQL via @supabase/supabase-js) — active when SUPABASE_URL & SUPABASE_ANON_KEY are set in .env
 * 2. MYSQL (via mysql2/promise) — active when a local MySQL server is reachable on DB_HOST
 * 3. IN-MEMORY RELATIONAL STORE — automatic fallback when running in preview before credentials are added
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import mysql, { Pool, RowDataPacket } from 'mysql2/promise';
import dotenv from 'dotenv';
import {
  AttendanceRecord,
  EventItem,
  NotificationItem,
  Registration,
  User,
} from '../src/types/models';
import { INITIAL_USERS } from '../src/mocks/users';
import { INITIAL_EVENTS } from '../src/mocks/events';
import { INITIAL_REGISTRATIONS } from '../src/mocks/registrations';
import { INITIAL_ATTENDANCE } from '../src/mocks/attendance';
import { INITIAL_NOTIFICATIONS } from '../src/mocks/notifications';

dotenv.config();

let supabase: SupabaseClient | null = null;
let isSupabaseActive = false;

let pool: Pool | null = null;
let isMySqlAvailable = false;

export async function initDatabasePool(): Promise<boolean> {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY ||
    '';

  if (
    supabaseUrl &&
    supabaseKey &&
    supabaseUrl.startsWith('http') &&
    !supabaseUrl.includes('YOUR_PROJECT_ID')
  ) {
    try {
      supabase = createClient(supabaseUrl, supabaseKey);
      const { error } = await supabase.from('events').select('id').limit(1);
      if (!error) {
        isSupabaseActive = true;
        console.log('[Supabase] Connected to Supabase PostgreSQL project:', supabaseUrl);
        return true;
      }
      console.warn('[Supabase] Connection check warning:', error.message);
    } catch (err) {
      console.warn('[Supabase] Could not reach Supabase URL:', err);
    }
  }

  const host = process.env.DB_HOST;
  if (!host) {
    isMySqlAvailable = false;
    return false;
  }

  try {
    pool = mysql.createPool({
      host,
      port: Number(process.env.DB_PORT || 3306),
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'campusconnect_usc',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      connectTimeout: 2000,
    });

    await pool.query('SELECT 1');
    isMySqlAvailable = true;
    console.log('[MySQL] Connected to MySQL database:', process.env.DB_NAME || 'campusconnect_usc');
    return true;
  } catch {
    isMySqlAvailable = false;
    pool = null;
    console.log(
      '[Database] Using in-memory relational store for preview (add SUPABASE_URL & SUPABASE_ANON_KEY in .env to connect Supabase).'
    );
    return false;
  }
}

export function getMySqlStatus(): {
  driver: 'supabase' | 'mysql' | 'memory';
  connected: boolean;
  host: string;
  database: string;
} {
  if (isSupabaseActive) {
    return {
      driver: 'supabase',
      connected: true,
      host: process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'supabase.co',
      database: 'postgres (Supabase)',
    };
  }
  return {
    driver: isMySqlAvailable ? 'mysql' : 'memory',
    connected: isMySqlAvailable,
    host: process.env.DB_HOST || '127.0.0.1',
    database: process.env.DB_NAME || 'campusconnect_usc',
  };
}

// Authoritative server-side relational state when neither Supabase nor MySQL is configured yet
const serverTables = {
  users: [...INITIAL_USERS] as User[],
  events: [...INITIAL_EVENTS] as EventItem[],
  registrations: [...INITIAL_REGISTRATIONS] as Registration[],
  attendance: [...INITIAL_ATTENDANCE] as AttendanceRecord[],
  notifications: [...INITIAL_NOTIFICATIONS] as NotificationItem[],
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapDbUser(row: any): User {
  let orgs: string[] = [];
  try {
    orgs =
      typeof row.organizations_json === 'string'
        ? JSON.parse(row.organizations_json)
        : Array.isArray(row.organizations_json)
        ? row.organizations_json
        : [];
  } catch {
    orgs = [];
  }
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    studentId: row.student_id,
    role: row.role,
    course: row.course,
    yearLevel: row.year_level,
    department: row.department,
    organizations: orgs,
    status: row.status,
    createdAt: new Date(row.created_at).toISOString(),
    updatedAt: new Date(row.updated_at).toISOString(),
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapDbEvent(row: any): EventItem {
  const dateVal =
    row.date instanceof Date
      ? row.date.toISOString().slice(0, 10)
      : String(row.date).slice(0, 10);
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    date: dateVal,
    startTime: row.start_time,
    endTime: row.end_time,
    venue: row.venue,
    campus: row.campus,
    category: row.category,
    organizer: row.organizer,
    organizerId: row.organizer_id,
    capacity: Number(row.capacity),
    registeredCount: Number(row.registered_count),
    checkedInCount: Number(row.checked_in_count),
    isFeatured: Boolean(row.is_featured),
    status: row.status,
    imageUrl: row.image_url,
    createdAt: new Date(row.created_at).toISOString(),
    updatedAt: new Date(row.updated_at).toISOString(),
  };
}

export const dbRepository = {
  // ---------------- USERS ----------------
  async getUsers(): Promise<User[]> {
    if (isSupabaseActive && supabase) {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data) return data.map(mapDbUser);
    }
    if (isMySqlAvailable && pool) {
      const [rows] = await pool.query<RowDataPacket[]>(
        'SELECT * FROM users ORDER BY created_at DESC'
      );
      return rows.map(mapDbUser);
    }
    return serverTables.users;
  },

  async createUser(user: User, password = 'carolinian2026'): Promise<User> {
    if (isSupabaseActive && supabase) {
      await supabase.from('users').insert({
        id: user.id,
        name: user.name,
        email: user.email,
        student_id: user.studentId,
        password_hash: password,
        role: user.role,
        course: user.course,
        year_level: user.yearLevel,
        department: user.department,
        organizations_json: user.organizations,
        status: user.status,
      });
      return user;
    }
    if (isMySqlAvailable && pool) {
      await pool.execute(
        `INSERT INTO users (id, name, email, student_id, password_hash, role, course, year_level, department, organizations_json, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          user.id,
          user.name,
          user.email,
          user.studentId,
          password,
          user.role,
          user.course,
          user.yearLevel,
          user.department,
          JSON.stringify(user.organizations),
          user.status,
        ]
      );
      return user;
    }
    serverTables.users.unshift(user);
    return user;
  },

  async updateUser(userId: string, updates: Partial<User>): Promise<User | null> {
    const users = await this.getUsers();
    const existing = users.find((u) => u.id === userId);
    if (!existing) return null;

    const merged: User = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    if (isSupabaseActive && supabase) {
      await supabase
        .from('users')
        .update({
          name: merged.name,
          email: merged.email,
          student_id: merged.studentId,
          course: merged.course,
          year_level: merged.yearLevel,
          organizations_json: merged.organizations,
          updated_at: merged.updatedAt,
        })
        .eq('id', userId);
      return merged;
    }

    if (isMySqlAvailable && pool) {
      await pool.execute(
        `UPDATE users SET name = ?, email = ?, student_id = ?, course = ?, year_level = ?, organizations_json = ? WHERE id = ?`,
        [
          merged.name,
          merged.email,
          merged.studentId,
          merged.course,
          merged.yearLevel,
          JSON.stringify(merged.organizations),
          userId,
        ]
      );
      return merged;
    }

    const idx = serverTables.users.findIndex((u) => u.id === userId);
    if (idx !== -1) serverTables.users[idx] = merged;
    return merged;
  },

  // ---------------- EVENTS ----------------
  async getEvents(): Promise<EventItem[]> {
    if (isSupabaseActive && supabase) {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('date', { ascending: true });
      if (!error && data) return data.map(mapDbEvent);
    }
    if (isMySqlAvailable && pool) {
      const [rows] = await pool.query<RowDataPacket[]>(
        'SELECT * FROM events ORDER BY date ASC'
      );
      return rows.map(mapDbEvent);
    }
    return serverTables.events;
  },

  async getEventById(id: string): Promise<EventItem | null> {
    if (isSupabaseActive && supabase) {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      if (!error && data) return mapDbEvent(data);
      return null;
    }
    if (isMySqlAvailable && pool) {
      const [rows] = await pool.query<RowDataPacket[]>(
        'SELECT * FROM events WHERE id = ? LIMIT 1',
        [id]
      );
      return rows.length > 0 ? mapDbEvent(rows[0]) : null;
    }
    return serverTables.events.find((e) => e.id === id) || null;
  },

  async createEvent(event: EventItem): Promise<EventItem> {
    if (isSupabaseActive && supabase) {
      await supabase.from('events').insert({
        id: event.id,
        title: event.title,
        description: event.description,
        date: event.date,
        start_time: event.startTime,
        end_time: event.endTime,
        venue: event.venue,
        campus: event.campus,
        category: event.category,
        organizer: event.organizer,
        organizer_id: event.organizerId,
        capacity: event.capacity,
        registered_count: event.registeredCount,
        checked_in_count: event.checkedInCount,
        is_featured: event.isFeatured,
        status: event.status,
        image_url: event.imageUrl,
      });
      return event;
    }
    if (isMySqlAvailable && pool) {
      await pool.execute(
        `INSERT INTO events (id, title, description, date, start_time, end_time, venue, campus, category, organizer, organizer_id, capacity, registered_count, checked_in_count, is_featured, status, image_url)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          event.id,
          event.title,
          event.description,
          event.date,
          event.startTime,
          event.endTime,
          event.venue,
          event.campus,
          event.category,
          event.organizer,
          event.organizerId,
          event.capacity,
          event.registeredCount,
          event.checkedInCount,
          event.isFeatured ? 1 : 0,
          event.status,
          event.imageUrl,
        ]
      );
      return event;
    }
    serverTables.events.unshift(event);
    return event;
  },

  async updateEvent(eventId: string, updated: EventItem): Promise<EventItem> {
    if (isSupabaseActive && supabase) {
      await supabase
        .from('events')
        .update({
          title: updated.title,
          description: updated.description,
          date: updated.date,
          start_time: updated.startTime,
          end_time: updated.endTime,
          venue: updated.venue,
          campus: updated.campus,
          category: updated.category,
          organizer: updated.organizer,
          capacity: updated.capacity,
          registered_count: updated.registeredCount,
          checked_in_count: updated.checkedInCount,
          is_featured: updated.isFeatured,
          status: updated.status,
          image_url: updated.imageUrl,
          updated_at: updated.updatedAt,
        })
        .eq('id', eventId);
      return updated;
    }
    if (isMySqlAvailable && pool) {
      await pool.execute(
        `UPDATE events
         SET title = ?, description = ?, date = ?, start_time = ?, end_time = ?, venue = ?, campus = ?, category = ?, organizer = ?, capacity = ?, registered_count = ?, checked_in_count = ?, is_featured = ?, status = ?, image_url = ?
         WHERE id = ?`,
        [
          updated.title,
          updated.description,
          updated.date,
          updated.startTime,
          updated.endTime,
          updated.venue,
          updated.campus,
          updated.category,
          updated.organizer,
          updated.capacity,
          updated.registeredCount,
          updated.checkedInCount,
          updated.isFeatured ? 1 : 0,
          updated.status,
          updated.imageUrl,
          eventId,
        ]
      );
      return updated;
    }
    const idx = serverTables.events.findIndex((e) => e.id === eventId);
    if (idx !== -1) serverTables.events[idx] = updated;
    return updated;
  },

  async deleteEvent(eventId: string): Promise<void> {
    if (isSupabaseActive && supabase) {
      await supabase.from('events').delete().eq('id', eventId);
      return;
    }
    if (isMySqlAvailable && pool) {
      await pool.execute('DELETE FROM events WHERE id = ?', [eventId]);
      return;
    }
    serverTables.events = serverTables.events.filter((e) => e.id !== eventId);
  },

  // ---------------- REGISTRATIONS & ATTENDANCE ----------------
  async getRegistrations(): Promise<Registration[]> {
    if (isSupabaseActive && supabase) {
      const { data, error } = await supabase
        .from('registrations')
        .select('*')
        .eq('status', 'registered')
        .order('registered_at', { ascending: false });
      if (!error && data) {
        return data.map((r) => ({
          id: r.id,
          eventId: r.event_id,
          userId: r.user_id,
          userName: r.user_name,
          userEmail: r.user_email,
          studentId: r.student_id,
          course: r.course,
          yearLevel: r.year_level,
          ticketCode: r.ticket_code,
          status: r.status,
          registeredAt: new Date(r.registered_at).toISOString(),
          createdAt: new Date(r.created_at).toISOString(),
          updatedAt: new Date(r.updated_at).toISOString(),
        }));
      }
    }
    if (isMySqlAvailable && pool) {
      const [rows] = await pool.query<RowDataPacket[]>(
        "SELECT * FROM registrations WHERE status = 'registered' ORDER BY registered_at DESC"
      );
      return rows.map((r) => ({
        id: r.id,
        eventId: r.event_id,
        userId: r.user_id,
        userName: r.user_name,
        userEmail: r.user_email,
        studentId: r.student_id,
        course: r.course,
        yearLevel: r.year_level,
        ticketCode: r.ticket_code,
        status: r.status,
        registeredAt: new Date(r.registered_at).toISOString(),
        createdAt: new Date(r.created_at).toISOString(),
        updatedAt: new Date(r.updated_at).toISOString(),
      }));
    }
    return serverTables.registrations.filter((r) => r.status === 'registered');
  },

  async addRegistrationAndAttendance(
    reg: Registration,
    att: AttendanceRecord,
    updatedEvent: EventItem
  ): Promise<void> {
    if (isSupabaseActive && supabase) {
      await supabase.from('registrations').insert({
        id: reg.id,
        event_id: reg.eventId,
        user_id: reg.userId,
        user_name: reg.userName,
        user_email: reg.userEmail,
        student_id: reg.studentId,
        course: reg.course,
        year_level: reg.yearLevel,
        ticket_code: reg.ticketCode,
        status: 'registered',
      });
      await supabase.from('attendance').insert({
        id: att.id,
        event_id: att.eventId,
        registration_id: att.registrationId,
        user_id: att.userId,
        user_name: att.userName,
        user_email: att.userEmail,
        student_id: att.studentId,
        course: att.course,
        ticket_code: att.ticketCode,
        checked_in: false,
      });
      await supabase
        .from('events')
        .update({
          registered_count: updatedEvent.registeredCount,
          status: updatedEvent.status,
          updated_at: updatedEvent.updatedAt,
        })
        .eq('id', updatedEvent.id);
      return;
    }

    if (isMySqlAvailable && pool) {
      const conn = await pool.getConnection();
      try {
        await conn.beginTransaction();
        await conn.execute(
          `INSERT INTO registrations (id, event_id, user_id, user_name, user_email, student_id, course, year_level, ticket_code, status)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'registered')`,
          [
            reg.id,
            reg.eventId,
            reg.userId,
            reg.userName,
            reg.userEmail,
            reg.studentId,
            reg.course,
            reg.yearLevel,
            reg.ticketCode,
          ]
        );
        await conn.execute(
          `INSERT INTO attendance (id, event_id, registration_id, user_id, user_name, user_email, student_id, course, ticket_code, checked_in)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`,
          [
            att.id,
            att.eventId,
            att.registrationId,
            att.userId,
            att.userName,
            att.userEmail,
            att.studentId,
            att.course,
            att.ticketCode,
          ]
        );
        await conn.execute(
          `UPDATE events SET registered_count = ?, status = ? WHERE id = ?`,
          [updatedEvent.registeredCount, updatedEvent.status, updatedEvent.id]
        );
        await conn.commit();
      } catch (err) {
        await conn.rollback();
        throw err;
      } finally {
        conn.release();
      }
      return;
    }

    serverTables.registrations.unshift(reg);
    serverTables.attendance.unshift(att);
    const evIdx = serverTables.events.findIndex((e) => e.id === updatedEvent.id);
    if (evIdx !== -1) serverTables.events[evIdx] = updatedEvent;
  },

  async removeRegistration(
    regId: string,
    updatedEvent: EventItem | null
  ): Promise<void> {
    if (isSupabaseActive && supabase) {
      await supabase.from('registrations').delete().eq('id', regId);
      if (updatedEvent) {
        await supabase
          .from('events')
          .update({
            registered_count: updatedEvent.registeredCount,
            status: updatedEvent.status,
            updated_at: updatedEvent.updatedAt,
          })
          .eq('id', updatedEvent.id);
      }
      return;
    }

    if (isMySqlAvailable && pool) {
      await pool.execute('DELETE FROM registrations WHERE id = ?', [regId]);
      if (updatedEvent) {
        await pool.execute(
          'UPDATE events SET registered_count = ?, status = ? WHERE id = ?',
          [updatedEvent.registeredCount, updatedEvent.status, updatedEvent.id]
        );
      }
      return;
    }

    serverTables.registrations = serverTables.registrations.filter((r) => r.id !== regId);
    serverTables.attendance = serverTables.attendance.filter((a) => a.registrationId !== regId);
    if (updatedEvent) {
      const idx = serverTables.events.findIndex((e) => e.id === updatedEvent.id);
      if (idx !== -1) serverTables.events[idx] = updatedEvent;
    }
  },

  async getAttendanceByEvent(eventId: string): Promise<AttendanceRecord[]> {
    if (isSupabaseActive && supabase) {
      const { data, error } = await supabase
        .from('attendance')
        .select('*')
        .eq('event_id', eventId)
        .order('created_at', { ascending: true });
      if (!error && data) {
        return data.map((a) => ({
          id: a.id,
          eventId: a.event_id,
          registrationId: a.registration_id,
          userId: a.user_id,
          userName: a.user_name,
          userEmail: a.user_email,
          studentId: a.student_id,
          course: a.course,
          ticketCode: a.ticket_code,
          checkedIn: Boolean(a.checked_in),
          checkedInAt: a.checked_in_at ? new Date(a.checked_in_at).toISOString() : null,
          checkedInBy: a.checked_in_by || null,
          createdAt: new Date(a.created_at).toISOString(),
          updatedAt: new Date(a.updated_at).toISOString(),
        }));
      }
    }
    if (isMySqlAvailable && pool) {
      const [rows] = await pool.query<RowDataPacket[]>(
        'SELECT * FROM attendance WHERE event_id = ? ORDER BY created_at ASC',
        [eventId]
      );
      return rows.map((a) => ({
        id: a.id,
        eventId: a.event_id,
        registrationId: a.registration_id,
        userId: a.user_id,
        userName: a.user_name,
        userEmail: a.user_email,
        studentId: a.student_id,
        course: a.course,
        ticketCode: a.ticket_code,
        checkedIn: Boolean(a.checked_in),
        checkedInAt: a.checked_in_at ? new Date(a.checked_in_at).toISOString() : null,
        checkedInBy: a.checked_in_by || null,
        createdAt: new Date(a.created_at).toISOString(),
        updatedAt: new Date(a.updated_at).toISOString(),
      }));
    }
    return serverTables.attendance.filter((a) => a.eventId === eventId);
  },

  async getAllAttendance(): Promise<AttendanceRecord[]> {
    if (isSupabaseActive && supabase) {
      const { data, error } = await supabase.from('attendance').select('*');
      if (!error && data) {
        return data.map((a) => ({
          id: a.id,
          eventId: a.event_id,
          registrationId: a.registration_id,
          userId: a.user_id,
          userName: a.user_name,
          userEmail: a.user_email,
          studentId: a.student_id,
          course: a.course,
          ticketCode: a.ticket_code,
          checkedIn: Boolean(a.checked_in),
          checkedInAt: a.checked_in_at ? new Date(a.checked_in_at).toISOString() : null,
          checkedInBy: a.checked_in_by || null,
          createdAt: new Date(a.created_at).toISOString(),
          updatedAt: new Date(a.updated_at).toISOString(),
        }));
      }
    }
    if (isMySqlAvailable && pool) {
      const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM attendance');
      return rows.map((a) => ({
        id: a.id,
        eventId: a.event_id,
        registrationId: a.registration_id,
        userId: a.user_id,
        userName: a.user_name,
        userEmail: a.user_email,
        studentId: a.student_id,
        course: a.course,
        ticketCode: a.ticket_code,
        checkedIn: Boolean(a.checked_in),
        checkedInAt: a.checked_in_at ? new Date(a.checked_in_at).toISOString() : null,
        checkedInBy: a.checked_in_by || null,
        createdAt: new Date(a.created_at).toISOString(),
        updatedAt: new Date(a.updated_at).toISOString(),
      }));
    }
    return serverTables.attendance;
  },

  async updateAttendanceRecord(
    updatedRecord: AttendanceRecord,
    checkedInDelta: number
  ): Promise<AttendanceRecord> {
    if (isSupabaseActive && supabase) {
      await supabase
        .from('attendance')
        .update({
          checked_in: updatedRecord.checkedIn,
          checked_in_at: updatedRecord.checkedInAt,
          checked_in_by: updatedRecord.checkedInBy,
          updated_at: updatedRecord.updatedAt,
        })
        .eq('id', updatedRecord.id);

      if (checkedInDelta !== 0) {
        const ev = await this.getEventById(updatedRecord.eventId);
        if (ev) {
          await supabase
            .from('events')
            .update({
              checked_in_count: Math.max(0, ev.checkedInCount + checkedInDelta),
            })
            .eq('id', updatedRecord.eventId);
        }
      }
      return updatedRecord;
    }

    if (isMySqlAvailable && pool) {
      await pool.execute(
        `UPDATE attendance SET checked_in = ?, checked_in_at = ?, checked_in_by = ? WHERE id = ?`,
        [
          updatedRecord.checkedIn ? 1 : 0,
          updatedRecord.checkedInAt ? new Date(updatedRecord.checkedInAt) : null,
          updatedRecord.checkedInBy,
          updatedRecord.id,
        ]
      );
      if (checkedInDelta !== 0) {
        await pool.execute(
          `UPDATE events SET checked_in_count = GREATEST(0, checked_in_count + ?) WHERE id = ?`,
          [checkedInDelta, updatedRecord.eventId]
        );
      }
      return updatedRecord;
    }

    const idx = serverTables.attendance.findIndex((a) => a.id === updatedRecord.id);
    if (idx !== -1) serverTables.attendance[idx] = updatedRecord;

    if (checkedInDelta !== 0) {
      const evIdx = serverTables.events.findIndex((e) => e.id === updatedRecord.eventId);
      if (evIdx !== -1) {
        serverTables.events[evIdx] = {
          ...serverTables.events[evIdx],
          checkedInCount: Math.max(
            0,
            serverTables.events[evIdx].checkedInCount + checkedInDelta
          ),
        };
      }
    }
    return updatedRecord;
  },

  // ---------------- NOTIFICATIONS ----------------
  async getNotifications(): Promise<NotificationItem[]> {
    if (isSupabaseActive && supabase) {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data) {
        return data.map((n) => ({
          id: n.id,
          title: n.title,
          message: n.message,
          eventId: n.event_id || undefined,
          eventTitle: n.event_title || undefined,
          senderName: n.sender_name,
          senderOrganization: n.sender_organization,
          recipientRole: n.recipient_role,
          isRead: Boolean(n.is_read),
          type: n.type,
          createdAt: new Date(n.created_at).toISOString(),
          updatedAt: new Date(n.updated_at).toISOString(),
        }));
      }
    }
    if (isMySqlAvailable && pool) {
      const [rows] = await pool.query<RowDataPacket[]>(
        'SELECT * FROM notifications ORDER BY created_at DESC'
      );
      return rows.map((n) => ({
        id: n.id,
        title: n.title,
        message: n.message,
        eventId: n.event_id || undefined,
        eventTitle: n.event_title || undefined,
        senderName: n.sender_name,
        senderOrganization: n.sender_organization,
        recipientRole: n.recipient_role,
        isRead: Boolean(n.is_read),
        type: n.type,
        createdAt: new Date(n.created_at).toISOString(),
        updatedAt: new Date(n.updated_at).toISOString(),
      }));
    }
    return serverTables.notifications;
  },

  async markNotificationRead(id: string): Promise<NotificationItem | null> {
    if (isSupabaseActive && supabase) {
      await supabase.from('notifications').update({ is_read: true }).eq('id', id);
      const all = await this.getNotifications();
      return all.find((n) => n.id === id) || null;
    }
    if (isMySqlAvailable && pool) {
      await pool.execute('UPDATE notifications SET is_read = 1 WHERE id = ?', [id]);
      const all = await this.getNotifications();
      return all.find((n) => n.id === id) || null;
    }
    const idx = serverTables.notifications.findIndex((n) => n.id === id);
    if (idx !== -1) {
      serverTables.notifications[idx] = {
        ...serverTables.notifications[idx],
        isRead: true,
        updatedAt: new Date().toISOString(),
      };
      return serverTables.notifications[idx];
    }
    return null;
  },

  async markAllNotificationsRead(): Promise<void> {
    if (isSupabaseActive && supabase) {
      await supabase.from('notifications').update({ is_read: true }).neq('id', '');
      return;
    }
    if (isMySqlAvailable && pool) {
      await pool.execute('UPDATE notifications SET is_read = 1');
      return;
    }
    const now = new Date().toISOString();
    serverTables.notifications = serverTables.notifications.map((n) => ({
      ...n,
      isRead: true,
      updatedAt: now,
    }));
  },

  async createNotification(notif: NotificationItem): Promise<NotificationItem> {
    if (isSupabaseActive && supabase) {
      await supabase.from('notifications').insert({
        id: notif.id,
        title: notif.title,
        message: notif.message,
        event_id: notif.eventId || null,
        event_title: notif.eventTitle || null,
        sender_name: notif.senderName,
        sender_organization: notif.senderOrganization,
        recipient_role: notif.recipientRole,
        is_read: false,
        type: notif.type,
      });
      return notif;
    }
    if (isMySqlAvailable && pool) {
      await pool.execute(
        `INSERT INTO notifications (id, title, message, event_id, event_title, sender_name, sender_organization, recipient_role, is_read, type)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, ?)`,
        [
          notif.id,
          notif.title,
          notif.message,
          notif.eventId || null,
          notif.eventTitle || null,
          notif.senderName,
          notif.senderOrganization,
          notif.recipientRole,
          notif.type,
        ]
      );
      return notif;
    }
    serverTables.notifications.unshift(notif);
    return notif;
  },
};

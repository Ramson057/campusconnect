/**
 * Synchronized local store for mock mode.
 * Accessed exclusively by src/services/* when USE_MOCK_API is true.
 * Persists changes in localStorage so registrations, created events, and attendance persist across reloads.
 */

import {
  AttendanceRecord,
  EventItem,
  NotificationItem,
  Registration,
  User,
} from '../types/models';
import { INITIAL_USERS } from './users';
import { INITIAL_EVENTS } from './events';
import { INITIAL_REGISTRATIONS } from './registrations';
import { INITIAL_ATTENDANCE } from './attendance';
import { INITIAL_NOTIFICATIONS } from './notifications';

const STORAGE_KEYS = {
  USERS: 'cc_usc_users_v1',
  EVENTS: 'cc_usc_events_v1',
  REGISTRATIONS: 'cc_usc_registrations_v1',
  ATTENDANCE: 'cc_usc_attendance_v1',
  NOTIFICATIONS: 'cc_usc_notifications_v1',
} as const;

function readCollection<T>(key: string, fallback: T[]): T[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(fallback));
      return [...fallback];
    }
    return JSON.parse(raw) as T[];
  } catch {
    return [...fallback];
  }
}

function writeCollection<T>(key: string, data: T[]): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {
    // Ignore storage quota errors in restricted environments
  }
}

export const mockStore = {
  getUsers: (): User[] => readCollection<User>(STORAGE_KEYS.USERS, INITIAL_USERS),
  saveUsers: (users: User[]): void => writeCollection(STORAGE_KEYS.USERS, users),

  getEvents: (): EventItem[] => readCollection<EventItem>(STORAGE_KEYS.EVENTS, INITIAL_EVENTS),
  saveEvents: (events: EventItem[]): void => writeCollection(STORAGE_KEYS.EVENTS, events),

  getRegistrations: (): Registration[] =>
    readCollection<Registration>(STORAGE_KEYS.REGISTRATIONS, INITIAL_REGISTRATIONS),
  saveRegistrations: (regs: Registration[]): void =>
    writeCollection(STORAGE_KEYS.REGISTRATIONS, regs),

  getAttendance: (): AttendanceRecord[] =>
    readCollection<AttendanceRecord>(STORAGE_KEYS.ATTENDANCE, INITIAL_ATTENDANCE),
  saveAttendance: (att: AttendanceRecord[]): void =>
    writeCollection(STORAGE_KEYS.ATTENDANCE, att),

  getNotifications: (): NotificationItem[] =>
    readCollection<NotificationItem>(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS),
  saveNotifications: (notifs: NotificationItem[]): void =>
    writeCollection(STORAGE_KEYS.NOTIFICATIONS, notifs),
};

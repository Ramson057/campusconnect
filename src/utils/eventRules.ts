import { EventFilterParams, EventItem, EventStatus } from '../types/models';

/**
 * Pure business logic for CampusConnect events, capacity math, filtering, and attendance metrics.
 */

export function computeEventStatus(
  dateStr: string,
  registeredCount: number,
  capacity: number,
  referenceDateStr = '2026-11-02'
): EventStatus {
  if (dateStr < referenceDateStr) {
    return 'ended';
  }
  if (registeredCount >= capacity) {
    return 'full';
  }
  return 'open';
}

export function getSpotsRemaining(event: Pick<EventItem, 'capacity' | 'registeredCount'>): number {
  return Math.max(0, event.capacity - event.registeredCount);
}

export function getCapacityPercentage(event: Pick<EventItem, 'capacity' | 'registeredCount'>): number {
  if (event.capacity <= 0) return 100;
  return Math.min(100, Math.round((event.registeredCount / event.capacity) * 100));
}

export function calculateAttendanceRate(attendedCount: number, registeredCount: number): number {
  if (registeredCount <= 0) return 0;
  return Math.min(100, Math.round((attendedCount / registeredCount) * 100));
}

export function canUserRegister(
  event: Pick<EventItem, 'status' | 'capacity' | 'registeredCount'>,
  alreadyRegistered: boolean
): { allowed: boolean; reason?: string } {
  if (alreadyRegistered) {
    return { allowed: false, reason: 'Already registered' };
  }
  if (event.status === 'ended') {
    return { allowed: false, reason: 'Event Ended' };
  }
  if (event.status === 'full' || event.registeredCount >= event.capacity) {
    return { allowed: false, reason: 'Event Full' };
  }
  return { allowed: true };
}

export function filterEventsList(events: EventItem[], filters: EventFilterParams): EventItem[] {
  return events.filter((ev) => {
    if (filters.search && filters.search.trim() !== '') {
      const q = filters.search.trim().toLowerCase();
      const matchesText =
        ev.title.toLowerCase().includes(q) ||
        ev.description.toLowerCase().includes(q) ||
        ev.organizer.toLowerCase().includes(q) ||
        ev.venue.toLowerCase().includes(q) ||
        ev.campus.toLowerCase().includes(q);
      if (!matchesText) return false;
    }

    if (filters.category && filters.category !== 'ALL' && ev.category !== filters.category) {
      return false;
    }

    if (filters.campus && filters.campus !== 'ALL' && ev.campus !== filters.campus) {
      return false;
    }

    if (filters.organizer && filters.organizer !== 'ALL' && ev.organizer !== filters.organizer) {
      return false;
    }

    if (filters.date && filters.date.trim() !== '' && ev.date !== filters.date.trim()) {
      return false;
    }

    if (filters.status && filters.status !== 'ALL') {
      if (filters.status === 'featured' && !ev.isFeatured) return false;
      if (filters.status !== 'featured' && ev.status !== filters.status) return false;
    }

    return true;
  });
}

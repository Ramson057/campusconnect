/**
 * Date formatting and calendar utilities for CampusConnect.
 */

export function formatEventDate(dateStr: string): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-').map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) return dateStr;
  const date = new Date(parts[0], parts[1] - 1, parts[2]);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatFullDate(dateStr: string): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-').map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) return dateStr;
  const date = new Date(parts[0], parts[1] - 1, parts[2]);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatTimeRange(startTime: string, endTime: string): string {
  const formatSingle = (t: string) => {
    if (!t) return '';
    const [hStr, mStr] = t.split(':');
    const h = parseInt(hStr, 10);
    if (isNaN(h)) return t;
    const suffix = h >= 12 ? 'PM' : 'AM';
    const hour12 = h % 12 === 0 ? 12 : h % 12;
    return `${hour12}:${mStr || '00'} ${suffix}`;
  };
  return `${formatSingle(startTime)} – ${formatSingle(endTime)}`;
}

export function formatRelativeTimestamp(isoString: string): string {
  if (!isoString) return '';
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return isoString;
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export interface CalendarDayCell {
  dateStr: string; // YYYY-MM-DD
  dayNumber: number;
  isCurrentMonth: boolean;
}

/**
 * Generates a 42-cell (6 weeks) calendar grid for a given year and 0-indexed month.
 */
export function buildCalendarMonthGrid(year: number, monthIndex: number): CalendarDayCell[] {
  const firstDayOfMonth = new Date(year, monthIndex, 1);
  const startWeekday = firstDayOfMonth.getDay(); // 0 (Sun) to 6 (Sat)
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, monthIndex, 0).getDate();

  const cells: CalendarDayCell[] = [];

  const pad = (n: number) => String(n).padStart(2, '0');
  const toYMD = (y: number, m: number, d: number) => {
    const normalized = new Date(y, m, d);
    return `${normalized.getFullYear()}-${pad(normalized.getMonth() + 1)}-${pad(normalized.getDate())}`;
  };

  // Previous month trailing days
  for (let i = startWeekday - 1; i >= 0; i--) {
    const d = daysInPrevMonth - i;
    cells.push({
      dateStr: toYMD(year, monthIndex - 1, d),
      dayNumber: d,
      isCurrentMonth: false,
    });
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({
      dateStr: toYMD(year, monthIndex, d),
      dayNumber: d,
      isCurrentMonth: true,
    });
  }

  // Next month leading days to complete 35 or 42 cells
  const totalNeeded = cells.length > 35 ? 42 : 35;
  let nextDay = 1;
  while (cells.length < totalNeeded) {
    cells.push({
      dateStr: toYMD(year, monthIndex + 1, nextDay),
      dayNumber: nextDay,
      isCurrentMonth: false,
    });
    nextDay++;
  }

  return cells;
}

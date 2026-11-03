import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, MapPin, Users } from 'lucide-react';
import { useEvents } from '../hooks/useEvents';
import {
  buildCalendarMonthGrid,
  formatFullDate,
  formatTimeRange,
} from '../utils/dateUtils';
import { Badge, getStatusBadgeProps } from '../components/Badge';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { LoadingState, ErrorState } from '../components/StateFeedback';

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function Calendar() {
  // Default to November 2026 (monthIndex 10) where main USC events are scheduled
  const [year, setYear] = useState(2026);
  const [monthIndex, setMonthIndex] = useState(10);
  const [selectedDateStr, setSelectedDateStr] = useState('2026-11-12');

  const { events, loading, error, refetch } = useEvents({ limit: 50 });

  const cells = buildCalendarMonthGrid(year, monthIndex);
  const selectedDayEvents = events.filter((e) => e.date === selectedDateStr);

  const handlePrevMonth = () => {
    if (monthIndex === 0) {
      setYear((y) => y - 1);
      setMonthIndex(11);
    } else {
      setMonthIndex((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (monthIndex === 11) {
      setYear((y) => y + 1);
      setMonthIndex(0);
    } else {
      setMonthIndex((m) => m + 1);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <p className="text-xs font-semibold text-usc-blue mb-1">
            Academic Schedule & Venues
          </p>
          <h1 className="text-3xl font-bold text-text-primary font-serif">
            Campus Event Calendar
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            Click any highlighted date to inspect scheduled University of San Carlos events.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handlePrevMonth} aria-label="Previous Month">
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="min-w-[150px] text-center text-sm font-bold text-text-primary font-serif">
            {MONTH_NAMES[monthIndex]} {year}
          </span>
          <Button variant="outline" size="sm" onClick={handleNextMonth} aria-label="Next Month">
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {loading ? (
        <LoadingState message="Loading monthly calendar..." />
      ) : error ? (
        <ErrorState message={error} onRetry={refetch} />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Monthly Grid */}
          <div className="lg:col-span-8">
            <div className="rounded-xl border border-surface-border bg-surface-white overflow-hidden">
              <div className="grid grid-cols-7 border-b border-surface-border bg-surface-gray">
                {WEEKDAYS.map((day) => (
                  <div
                    key={day}
                    className="py-2.5 text-center text-xs font-bold text-text-secondary"
                  >
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 divide-x divide-y divide-surface-border">
                {cells.map((cell) => {
                  const dayEvents = events.filter((e) => e.date === cell.dateStr);
                  const isSelected = cell.dateStr === selectedDateStr;

                  return (
                    <button
                      key={cell.dateStr}
                      type="button"
                      onClick={() => setSelectedDateStr(cell.dateStr)}
                      className={`min-h-[96px] p-2 text-left transition-colors flex flex-col justify-between cursor-pointer ${
                        !cell.isCurrentMonth
                          ? 'bg-surface-gray/50 text-text-muted'
                          : 'bg-surface-white text-text-primary'
                      } ${
                        isSelected
                          ? 'ring-2 ring-inset ring-usc-blue bg-usc-blue-light/30'
                          : 'hover:bg-surface-gray'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span
                          className={`text-xs font-semibold tabular-nums ${
                            isSelected ? 'text-usc-blue font-bold' : ''
                          }`}
                        >
                          {cell.dayNumber}
                        </span>
                        {dayEvents.length > 0 && (
                          <span className="rounded bg-usc-blue px-1.5 py-0.5 text-[10px] font-bold text-surface-white tabular-nums">
                            {dayEvents.length}
                          </span>
                        )}
                      </div>

                      <div className="mt-1 space-y-1 w-full">
                        {dayEvents.slice(0, 2).map((ev) => (
                          <div
                            key={ev.id}
                            className={`truncate rounded px-1.5 py-0.5 text-[10px] font-medium ${
                              ev.status === 'full'
                                ? 'bg-usc-red-light text-usc-red-dark'
                                : ev.status === 'ended'
                                ? 'bg-surface-muted text-text-secondary'
                                : 'bg-usc-green-light text-usc-green-dark'
                            }`}
                          >
                            {ev.title}
                          </div>
                        ))}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Selected Date Details Panel */}
          <div className="lg:col-span-4">
            <Card padding="lg">
              <div className="flex items-center gap-2 text-xs font-semibold text-usc-blue mb-1">
                <CalendarIcon className="w-4 h-4" />
                <span>Selected Date</span>
              </div>
              <h2 className="text-lg font-bold text-text-primary font-serif">
                {formatFullDate(selectedDateStr)}
              </h2>

              <div className="mt-5 space-y-4">
                {selectedDayEvents.length === 0 ? (
                  <p className="text-xs text-text-secondary py-6 text-center bg-surface-gray rounded-lg p-4">
                    No events scheduled on this date. Select a date marked with a blue counter badge
                    (such as Nov 8, Nov 12, Nov 18, Nov 21, or Nov 26).
                  </p>
                ) : (
                  selectedDayEvents.map((ev) => {
                    const st = getStatusBadgeProps(ev.status);
                    return (
                      <div
                        key={ev.id}
                        className="rounded-xl border border-surface-border bg-surface-gray p-4 space-y-2.5"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <Badge variant={st.variant}>{st.label}</Badge>
                          <span className="text-[11px] font-medium text-text-secondary">
                            {formatTimeRange(ev.startTime, ev.endTime)}
                          </span>
                        </div>
                        <h3 className="text-sm font-bold text-text-primary font-serif">
                          {ev.title}
                        </h3>
                        <p className="text-xs text-text-secondary flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-usc-blue shrink-0" />
                          <span>
                            {ev.venue} ({ev.campus})
                          </span>
                        </p>
                        <p className="text-xs text-text-secondary flex items-center gap-1.5 tabular-nums">
                          <Users className="w-3.5 h-3.5 text-usc-green shrink-0" />
                          <span>
                            {ev.registeredCount}/{ev.capacity} registered
                          </span>
                        </p>
                        <div className="pt-2">
                          <Link
                            to={`/events/${ev.id}`}
                            className="inline-flex w-full items-center justify-center rounded-lg bg-usc-green px-3 py-2 text-xs font-semibold text-surface-white hover:bg-usc-green-dark transition-colors"
                          >
                            Open Event Details →
                          </Link>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}

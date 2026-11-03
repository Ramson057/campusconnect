import React, { useState } from 'react';
import { CheckCircle2, QrCode, UserCheck, UserX } from 'lucide-react';
import { attendanceService } from '../services/attendanceService';
import { useAuth } from '../hooks/useAuth';
import { useEvents } from '../hooks/useEvents';
import { useFetch } from '../hooks/useFetch';
import { useToast } from '../hooks/useToast';
import { calculateAttendanceRate } from '../utils/eventRules';
import { formatRelativeTimestamp } from '../utils/dateUtils';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Input } from '../components/Input';
import { Select } from '../components/Select';
import { Table } from '../components/Table';
import { LoadingState, ErrorState } from '../components/StateFeedback';

export function Attendance() {
  const { user } = useAuth();
  const { events } = useEvents({ limit: 30 });
  const { showToast } = useToast();

  const [selectedEventId, setSelectedEventId] = useState('evt-usc-eng-week');
  const [ticketOrIdInput, setTicketOrIdInput] = useState('');
  const [searchAttendee, setSearchAttendee] = useState('');

  const {
    data: attendees,
    loading,
    error,
    refetch,
  } = useFetch(
    () => attendanceService.getEventAttendance(selectedEventId),
    [selectedEventId]
  );

  const attendeeList = attendees || [];
  const checkedInCount = attendeeList.filter((a) => a.checkedIn).length;
  const totalRegistered = attendeeList.length;
  const rate = calculateAttendanceRate(checkedInCount, totalRegistered);

  const filteredAttendees = attendeeList.filter((a) => {
    if (!searchAttendee.trim()) return true;
    const q = searchAttendee.toLowerCase();
    return (
      a.userName.toLowerCase().includes(q) ||
      a.studentId.toLowerCase().includes(q) ||
      a.ticketCode.toLowerCase().includes(q)
    );
  });

  const handleToggle = async (attendanceId: string, nextState: boolean, name: string) => {
    try {
      await attendanceService.toggleCheckIn(
        attendanceId,
        nextState,
        user?.name || 'Event Organizer'
      );
      showToast(
        nextState ? `Checked in ${name}` : `Marked ${name} as not checked in`,
        nextState ? 'success' : 'info'
      );
      await refetch();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Update failed.', 'error');
    }
  };

  const handleCodeCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketOrIdInput.trim()) {
      showToast('Enter a ticket code or USC Student ID first.', 'error');
      return;
    }

    try {
      const record = await attendanceService.checkInByTicketOrId(
        selectedEventId,
        ticketOrIdInput,
        user?.name || 'Event Organizer'
      );
      showToast(
        'Attendee Checked In!',
        'success',
        `${record.userName} (${record.ticketCode}) verified.`
      );
      setTicketOrIdInput('');
      await refetch();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Code not found.', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold text-usc-green-dark">Live Venue Desk</p>
        <h1 className="text-2xl sm:text-3xl font-bold text-text-primary font-serif">
          Attendance & Check-In Manager
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          Scan or enter a student’s digital pass code / USC ID, or toggle attendance directly in the
          roster.
        </p>
      </div>

      {/* Event Selector & Live Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <Card padding="md" className="lg:col-span-5">
          <Select
            label="Select Active Event Roster"
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
            options={events.map((ev) => ({
              value: ev.id,
              label: `${ev.title} (${ev.date})`,
            }))}
          />

          <div className="mt-5 pt-4 border-t border-surface-border">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-semibold text-text-secondary">
                Live Checked-In vs. Roster
              </span>
              <span className="font-mono font-bold text-usc-green-dark tabular-nums">
                {checkedInCount} / {totalRegistered} ({rate}%)
              </span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-surface-gray overflow-hidden">
              <div
                className="h-full bg-usc-green rounded-full transition-all"
                style={{ width: `${rate}%` }}
              />
            </div>
          </div>
        </Card>

        {/* QR / Code Entry Placeholder */}
        <Card padding="md" className="lg:col-span-7">
          <div className="flex items-center gap-2 text-xs font-bold text-usc-blue mb-2">
            <QrCode className="w-4 h-4" />
            <span>QR Scanner / Ticket Code Quick Entry</span>
          </div>
          <form onSubmit={handleCodeCheckIn} className="flex flex-col sm:flex-row items-end gap-3">
            <div className="flex-1 w-full">
              <Input
                label="Enter Ticket Code or USC Student ID"
                placeholder="e.g. USC-ENG-8841 or 26108841"
                value={ticketOrIdInput}
                onChange={(e) => setTicketOrIdInput(e.target.value)}
              />
            </div>
            <Button type="submit" variant="primary">
              <CheckCircle2 className="w-4 h-4" />
              Verify & Check In
            </Button>
          </form>
          <p className="mt-2 text-[11px] text-text-muted flex flex-wrap items-center gap-1.5">
            <span>Quick-fill sample pass:</span>
            <button
              type="button"
              onClick={() => setTicketOrIdInput('USC-ENG-8841')}
              className="rounded bg-surface-gray px-1.5 py-0.5 font-mono text-text-primary hover:bg-usc-green-light hover:text-usc-green-dark transition-colors cursor-pointer"
            >
              USC-ENG-8841
            </button>
            <span>or USC ID</span>
            <button
              type="button"
              onClick={() => setTicketOrIdInput('25104490')}
              className="rounded bg-surface-gray px-1.5 py-0.5 font-mono text-text-primary hover:bg-usc-green-light hover:text-usc-green-dark transition-colors cursor-pointer"
            >
              25104490
            </button>
          </p>
        </Card>
      </div>

      {/* Filter & Roster Table */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-lg font-bold text-text-primary font-serif">
          Registered Attendee Roster ({filteredAttendees.length})
        </h2>
        <div className="w-full sm:w-72">
          <Input
            placeholder="Filter by name, USC ID, or ticket..."
            value={searchAttendee}
            onChange={(e) => setSearchAttendee(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <LoadingState message="Loading event attendee sheet..." />
      ) : error ? (
        <ErrorState message={error} onRetry={refetch} />
      ) : (
        <Table
          rowKey={(a) => a.id}
          data={filteredAttendees}
          emptyMessage="No registered attendees found for this event."
          columns={[
            {
              key: 'ticket',
              header: 'Ticket Code',
              render: (a) => (
                <span className="font-mono text-xs font-bold text-usc-green-dark">
                  {a.ticketCode}
                </span>
              ),
            },
            {
              key: 'student',
              header: 'Carolinian Student',
              render: (a) => (
                <div>
                  <p className="font-semibold text-text-primary">{a.userName}</p>
                  <p className="text-xs text-text-muted">
                    ID {a.studentId} · {a.course}
                  </p>
                </div>
              ),
            },
            {
              key: 'status',
              header: 'Check-In Status',
              render: (a) =>
                a.checkedIn ? (
                  <div>
                    <Badge variant="open">Checked In</Badge>
                    {a.checkedInAt && (
                      <p className="text-[11px] text-text-muted mt-0.5">
                        {formatRelativeTimestamp(a.checkedInAt)}
                      </p>
                    )}
                  </div>
                ) : (
                  <Badge variant="neutral">Pending Arrival</Badge>
                ),
            },
            {
              key: 'action',
              header: 'Toggle Attendance',
              align: 'right',
              render: (a) => (
                <Button
                  variant={a.checkedIn ? 'outline' : 'primary'}
                  size="sm"
                  onClick={() => handleToggle(a.id, !a.checkedIn, a.userName)}
                >
                  {a.checkedIn ? (
                    <>
                      <UserX className="w-3.5 h-3.5" />
                      Undo Check-In
                    </>
                  ) : (
                    <>
                      <UserCheck className="w-3.5 h-3.5" />
                      Check In
                    </>
                  )}
                </Button>
              ),
            },
          ]}
        />
      )}
    </div>
  );
}

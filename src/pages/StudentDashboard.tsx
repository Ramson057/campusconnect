import { Link } from 'react-router-dom';
import { Bell, Calendar, CheckCircle2, MapPin, Ticket, UserCheck } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useFetch } from '../hooks/useFetch';
import { useNotifications } from '../hooks/useNotifications';
import { useToast } from '../hooks/useToast';
import { eventService } from '../services/eventService';
import { registrationService } from '../services/registrationService';
import { formatEventDate, formatRelativeTimestamp, formatTimeRange } from '../utils/dateUtils';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { LoadingState, ErrorState, EmptyState } from '../components/StateFeedback';

export function StudentDashboard() {
  const { user } = useAuth();
  const { notifications, markAsRead } = useNotifications();
  const { showToast } = useToast();

  const {
    data: dashboardData,
    loading,
    error,
    refetch,
  } = useFetch(async () => {
    if (!user) return { registrations: [], events: [] };
    const [regs, evRes] = await Promise.all([
      registrationService.getUserRegistrations(user.id),
      eventService.getEvents({ limit: 50 }),
    ]);
    return { registrations: regs, events: evRes.data };
  }, [user?.id]);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10">
        <LoadingState message="Loading your Carolinian student dashboard..." />
      </div>
    );
  }

  if (error || !dashboardData) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10">
        <ErrorState message={error || 'Unable to load dashboard.'} onRetry={refetch} />
      </div>
    );
  }

  const { registrations, events } = dashboardData;
  const registeredWithEvent = registrations
    .map((reg) => {
      const ev = events.find((e) => e.id === reg.eventId);
      return ev ? { reg, event: ev } : null;
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);

  const upcomingRegs = registeredWithEvent.filter((x) => x.event.status !== 'ended');
  const pastRegs = registeredWithEvent.filter((x) => x.event.status === 'ended');

  const handleCancel = async (eventId: string, title: string) => {
    if (!user) return;
    try {
      await registrationService.cancelRegistration(eventId, user.id);
      showToast('Registration Cancelled', 'info', `Removed registration for ${title}.`);
      await refetch();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Error cancelling.', 'error');
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <p className="text-xs font-semibold text-usc-green-dark">
            Carolinian Student Portal · ID {user?.studentId}
          </p>
          <h1 className="text-3xl font-bold text-text-primary font-serif">
            Welcome back, {user?.name}
          </h1>
          <p className="text-xs text-text-secondary mt-1">
            {user?.course} · {user?.yearLevel}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/profile"
            className="rounded-lg border border-surface-border bg-surface-white px-4 py-2 text-xs font-semibold text-text-primary hover:bg-surface-gray transition-colors"
          >
            Edit Profile
          </Link>
          <Link
            to="/events"
            className="rounded-lg bg-usc-green px-4 py-2 text-xs font-semibold text-surface-white hover:bg-usc-green-dark transition-colors"
          >
            Discover Events
          </Link>
        </div>
      </div>

      {/* Summary Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <Card padding="md">
          <p className="text-xs font-medium text-text-secondary">Upcoming Registrations</p>
          <p className="mt-1 text-2xl font-bold text-usc-green-dark font-mono tabular-nums">
            {upcomingRegs.length}
          </p>
        </Card>
        <Card padding="md">
          <p className="text-xs font-medium text-text-secondary">Past Events Attended</p>
          <p className="mt-1 text-2xl font-bold text-usc-blue font-mono tabular-nums">
            {pastRegs.length}
          </p>
        </Card>
        <Card padding="md">
          <p className="text-xs font-medium text-text-secondary">Organization Memberships</p>
          <p className="mt-1 text-2xl font-bold text-text-primary font-mono tabular-nums">
            {user?.organizations.length || 0}
          </p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Upcoming & Past Events */}
        <div className="lg:col-span-8 space-y-8">
          <section>
            <h2 className="text-xl font-bold text-text-primary font-serif mb-4">
              Registered Upcoming Events
            </h2>
            {upcomingRegs.length === 0 ? (
              <EmptyState
                title="No upcoming registrations yet"
                description="Browse the USC event directory to reserve your seat at upcoming symposia and campus activities."
                action={
                  <Link
                    to="/events"
                    className="rounded-lg bg-usc-green px-4 py-2 text-xs font-semibold text-surface-white"
                  >
                    Browse Events
                  </Link>
                }
              />
            ) : (
              <div className="space-y-4">
                {upcomingRegs.map(({ reg, event }) => (
                  <Card key={reg.id} padding="md">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="open">Registered</Badge>
                          <span className="text-xs text-text-muted">{event.organizer}</span>
                        </div>
                        <h3 className="text-base font-bold text-text-primary font-serif">
                          <Link
                            to={`/events/${event.id}`}
                            className="hover:text-usc-green transition-colors"
                          >
                            {event.title}
                          </Link>
                        </h3>
                        <p className="text-xs text-text-secondary flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-usc-green" />
                          <span>
                            {formatEventDate(event.date)} ·{' '}
                            {formatTimeRange(event.startTime, event.endTime)}
                          </span>
                        </p>
                        <p className="text-xs text-text-secondary flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-usc-blue" />
                          <span>
                            {event.venue} ({event.campus})
                          </span>
                        </p>
                      </div>

                      <div className="flex flex-col sm:items-end gap-2 shrink-0">
                        <div className="inline-flex items-center gap-1.5 rounded-lg bg-usc-green-light px-3 py-1.5 text-xs font-mono font-bold text-usc-green-dark">
                          <Ticket className="w-3.5 h-3.5" />
                          <span>{reg.ticketCode}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Link
                            to={`/events/${event.id}`}
                            className="text-xs font-semibold text-usc-green hover:underline"
                          >
                            View Event
                          </Link>
                          <span aria-hidden="true">·</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCancel(event.id, event.title)}
                          >
                            Cancel Slot
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </section>

          <section>
            <h2 className="text-xl font-bold text-text-primary font-serif mb-4">
              Past Events & Attendance History
            </h2>
            {pastRegs.length === 0 ? (
              <p className="text-xs text-text-secondary">No past events recorded.</p>
            ) : (
              <div className="space-y-3">
                {pastRegs.map(({ reg, event }) => (
                  <Card key={reg.id} padding="sm">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-bold text-text-primary font-serif">
                          {event.title}
                        </p>
                        <p className="text-xs text-text-secondary mt-0.5">
                          {formatEventDate(event.date)} · {event.venue}
                        </p>
                      </div>
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-usc-green-dark">
                        <UserCheck className="w-4 h-4 text-usc-green" />
                        Attended ({reg.ticketCode})
                      </span>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Recent Notifications Sidebar */}
        <div className="lg:col-span-4">
          <Card padding="lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-text-primary font-serif flex items-center gap-2">
                <Bell className="w-4 h-4 text-usc-green" />
                <span>Recent Notifications</span>
              </h2>
              <Link
                to="/notifications"
                className="text-xs font-semibold text-usc-green hover:underline"
              >
                View All
              </Link>
            </div>

            <div className="divide-y divide-surface-border">
              {notifications.slice(0, 4).map((n) => (
                <div
                  key={n.id}
                  onClick={() => !n.isRead && markAsRead(n.id)}
                  className="py-3 first:pt-0 last:pb-0 cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-xs font-semibold text-text-primary">{n.title}</p>
                    {!n.isRead ? (
                      <span className="mt-1 h-2 w-2 rounded-full bg-usc-red shrink-0" />
                    ) : (
                      <CheckCircle2 className="w-3.5 h-3.5 text-usc-green shrink-0 mt-0.5" />
                    )}
                  </div>
                  <p className="mt-1 text-xs text-text-secondary line-clamp-2">{n.message}</p>
                  <p className="mt-1 text-[11px] text-text-muted">
                    {formatRelativeTimestamp(n.createdAt)}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  MapPin,
  Ticket,
  Users,
} from 'lucide-react';
import { eventService } from '../services/eventService';
import { registrationService } from '../services/registrationService';
import { useAuth } from '../hooks/useAuth';
import { useFetch } from '../hooks/useFetch';
import { useToast } from '../hooks/useToast';
import { formatFullDate, formatTimeRange } from '../utils/dateUtils';
import { getCapacityPercentage, getSpotsRemaining } from '../utils/eventRules';
import { Badge, getStatusBadgeProps } from '../components/Badge';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { LoadingState, ErrorState } from '../components/StateFeedback';

export function EventDetails() {
  const { id = '' } = useParams<{ id: string }>();
  const { user, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [submitting, setSubmitting] = useState(false);
  const [imgFailed, setImgFailed] = useState(false);

  const {
    data: event,
    loading: eventLoading,
    error: eventError,
    refetch: refetchEvent,
  } = useFetch(() => eventService.getEventById(id), [id]);

  const {
    data: userRegistrations,
    refetch: refetchRegistrations,
  } = useFetch(
    () => (user ? registrationService.getUserRegistrations(user.id) : Promise.resolve([])),
    [user?.id, id]
  );

  if (eventLoading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-12">
        <LoadingState message="Loading event details..." />
      </div>
    );
  }

  if (eventError || !event) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-12">
        <ErrorState message={eventError || 'Event not found.'} onRetry={refetchEvent} />
      </div>
    );
  }

  const activeReg = (userRegistrations || []).find((r) => r.eventId === event.id);
  const isRegistered = Boolean(activeReg);
  const spotsLeft = getSpotsRemaining(event);
  const fillPercent = getCapacityPercentage(event);
  const statusInfo = getStatusBadgeProps(event.status);

  const handleRegister = async () => {
    if (!isAuthenticated || !user) {
      showToast('Please sign in to register for USC events.', 'info');
      navigate('/login');
      return;
    }

    setSubmitting(true);
    try {
      const reg = await registrationService.registerForEvent(event.id, user);
      showToast(
        'Registered successfully!',
        'success',
        `Your digital pass code is ${reg.ticketCode}.`
      );
      await Promise.all([refetchEvent(), refetchRegistrations()]);
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : 'Unable to complete registration.',
        'error'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelRegistration = async () => {
    if (!user) return;
    setSubmitting(true);
    try {
      await registrationService.cancelRegistration(event.id, user.id);
      showToast('Registration cancelled', 'info', 'Your slot has been released.');
      await Promise.all([refetchEvent(), refetchRegistrations()]);
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : 'Unable to cancel registration.',
        'error'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-6">
        <Link
          to="/events"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-usc-green hover:text-usc-green-dark"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to All Campus Events
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Event Column */}
        <div className="lg:col-span-8 space-y-6">
          <div className="relative aspect-16/9 w-full overflow-hidden rounded-xl border border-surface-border bg-usc-green-light">
            {!imgFailed && event.imageUrl ? (
              <img
                src={event.imageUrl}
                alt={event.title}
                referrerPolicy="no-referrer"
                onError={() => setImgFailed(true)}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center p-8 text-center">
                <span className="text-lg font-serif font-bold text-usc-green-dark">
                  {event.title}
                </span>
              </div>
            )}
            <div className="absolute top-4 left-4 flex items-center gap-2">
              <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
              {event.isFeatured && <Badge variant="featured">Featured Event</Badge>}
            </div>
          </div>

          <Card padding="lg">
            <p className="text-xs font-semibold text-usc-green-dark mb-1">
              {event.category} · {event.campus}
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold text-text-primary font-serif">
              {event.title}
            </h1>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 py-4 border-y border-surface-border text-xs text-text-secondary">
              <div className="flex items-start gap-2.5">
                <Calendar className="w-4 h-4 text-usc-green shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-text-primary">Date</p>
                  <p>{formatFullDate(event.date)}</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-usc-green shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-text-primary">Time</p>
                  <p>{formatTimeRange(event.startTime, event.endTime)}</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-usc-blue shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-text-primary">Venue & Campus</p>
                  <p>
                    {event.venue} · {event.campus}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <Building2 className="w-4 h-4 text-usc-blue shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-text-primary">Organizing Body</p>
                  <p>{event.organizer}</p>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <h2 className="text-base font-bold text-text-primary font-serif mb-2">
                About This Event
              </h2>
              <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-line">
                {event.description}
              </p>
            </div>
          </Card>
        </div>

        {/* Registration & Capacity Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <Card padding="lg">
            <h2 className="text-lg font-bold text-text-primary font-serif">
              Registration & Capacity
            </h2>

            <div className="mt-4">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="inline-flex items-center gap-1.5 font-semibold text-text-primary tabular-nums">
                  <Users className="w-4 h-4 text-usc-green" />
                  {event.registeredCount}/{event.capacity} spots filled
                </span>
                <span
                  className={`font-bold tabular-nums ${
                    event.status === 'full' ? 'text-usc-red' : 'text-usc-green-dark'
                  }`}
                >
                  {fillPercent}%
                </span>
              </div>

              <div className="w-full h-2.5 rounded-full bg-surface-gray overflow-hidden mb-2">
                <div
                  className={`h-full rounded-full transition-all ${
                    event.status === 'full'
                      ? 'bg-usc-red'
                      : event.status === 'ended'
                      ? 'bg-text-muted'
                      : 'bg-usc-green'
                  }`}
                  style={{ width: `${fillPercent}%` }}
                />
              </div>

              <p className="text-xs text-text-secondary tabular-nums">
                {event.status === 'full'
                  ? 'All available seats have been claimed.'
                  : event.status === 'ended'
                  ? 'This event has already concluded.'
                  : `${spotsLeft} seats remaining for USC students.`}
              </p>
            </div>

            {isRegistered && activeReg && (
              <div className="mt-5 rounded-xl border border-usc-green/30 bg-usc-green-light p-4">
                <div className="flex items-center gap-2 text-xs font-bold text-usc-green-dark">
                  <CheckCircle2 className="w-4 h-4 text-usc-green shrink-0" />
                  <span>You Are Registered</span>
                </div>
                <div className="mt-2 flex items-center justify-between border-t border-usc-green/20 pt-2 text-xs">
                  <span className="inline-flex items-center gap-1 text-text-secondary">
                    <Ticket className="w-3.5 h-3.5 text-usc-green" />
                    Pass Code:
                  </span>
                  <span className="font-mono font-bold text-usc-green-dark">
                    {activeReg.ticketCode}
                  </span>
                </div>
              </div>
            )}

            <div className="mt-6 space-y-2.5">
              {isRegistered ? (
                event.status !== 'ended' && (
                  <Button
                    variant="outline"
                    fullWidth
                    disabled={submitting}
                    onClick={handleCancelRegistration}
                  >
                    {submitting ? 'Updating...' : 'Cancel My Registration'}
                  </Button>
                )
              ) : event.status === 'full' ? (
                <Button variant="danger" fullWidth disabled>
                  Event Full ({event.registeredCount}/{event.capacity})
                </Button>
              ) : event.status === 'ended' ? (
                <Button variant="outline" fullWidth disabled>
                  Event Ended
                </Button>
              ) : (
                <Button
                  variant="primary"
                  fullWidth
                  disabled={submitting}
                  onClick={handleRegister}
                >
                  {submitting ? 'Reserving Seat...' : 'Register for Event'}
                </Button>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

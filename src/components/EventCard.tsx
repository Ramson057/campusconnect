import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Users, ArrowRight, Star } from 'lucide-react';
import { EventItem } from '../types/models';
import { formatEventDate, formatTimeRange } from '../utils/dateUtils';
import { getCapacityPercentage, getSpotsRemaining } from '../utils/eventRules';
import { Badge, getStatusBadgeProps } from './Badge';

export interface EventCardProps {
  event: EventItem;
}

export function EventCard({ event }: EventCardProps) {
  const [imgFailed, setImgFailed] = useState(false);
  const spotsLeft = getSpotsRemaining(event);
  const fillPercent = getCapacityPercentage(event);
  const statusInfo = getStatusBadgeProps(event.status);

  return (
    <article className="group flex flex-col rounded-xl border border-surface-border bg-surface-white overflow-hidden transition-all duration-150 hover:border-usc-green/50 hover:shadow-md">
      <Link
        to={`/events/${event.id}`}
        className="relative block aspect-4/3 w-full overflow-hidden bg-usc-green-light"
      >
        {!imgFailed && event.imageUrl ? (
          <img
            src={event.imageUrl}
            alt={event.title}
            referrerPolicy="no-referrer"
            onError={() => setImgFailed(true)}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center bg-usc-green-light p-6 text-center">
            <Calendar className="h-10 w-10 text-usc-green mb-2" />
            <span className="text-xs font-semibold text-usc-green-dark">
              {event.category}
            </span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 to-transparent" />

        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
          <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
          {event.isFeatured && (
            <Badge variant="featured">
              <Star className="w-3 h-3 fill-current" />
              Featured
            </Badge>
          )}
        </div>

        <div className="absolute bottom-3 left-3 right-3 text-surface-white">
          <p className="text-xs font-medium opacity-95 truncate">
            {event.category} · {event.campus}
          </p>
        </div>
      </Link>

      <div className="flex flex-1 flex-col justify-between p-5">
        <div>
          <p className="text-xs font-medium text-usc-green-dark truncate mb-1">
            {event.organizer}
          </p>
          <h3 className="text-lg font-bold text-text-primary font-serif leading-snug line-clamp-2 group-hover:text-usc-green transition-colors">
            <Link to={`/events/${event.id}`}>{event.title}</Link>
          </h3>

          <div className="mt-3 space-y-1.5 text-xs text-text-secondary">
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-usc-green shrink-0" />
              <span>
                {formatEventDate(event.date)} · {formatTimeRange(event.startTime, event.endTime)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-usc-blue shrink-0" />
              <span className="truncate">{event.venue}</span>
            </div>
          </div>
        </div>

        <div className="mt-5 pt-4 border-t border-surface-border">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="inline-flex items-center gap-1.5 text-text-secondary font-medium">
              <Users className="w-3.5 h-3.5 text-text-muted" />
              <span className="tabular-nums">
                {event.registeredCount}/{event.capacity} registered
              </span>
            </span>
            <span
              className={`font-semibold tabular-nums ${
                event.status === 'full'
                  ? 'text-usc-red'
                  : event.status === 'ended'
                  ? 'text-text-muted'
                  : 'text-usc-green-dark'
              }`}
            >
              {event.status === 'full'
                ? '0 spots left'
                : event.status === 'ended'
                ? 'Event ended'
                : `${spotsLeft} spots left`}
            </span>
          </div>

          <div className="w-full h-1.5 rounded-full bg-surface-gray overflow-hidden mb-4">
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

          <Link
            to={`/events/${event.id}`}
            className="inline-flex w-full items-center justify-between rounded-lg bg-surface-gray px-3.5 py-2 text-xs font-semibold text-text-primary hover:bg-usc-green hover:text-surface-white transition-colors"
          >
            <span>
              {event.status === 'full'
                ? 'View Full Event Details'
                : event.status === 'ended'
                ? 'View Past Event Summary'
                : 'View Details & Register'}
            </span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </article>
  );
}

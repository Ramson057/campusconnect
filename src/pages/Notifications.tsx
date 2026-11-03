import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, CheckCheck, Megaphone, Send } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useEvents } from '../hooks/useEvents';
import { useNotifications } from '../hooks/useNotifications';
import { useToast } from '../hooks/useToast';
import { formatRelativeTimestamp } from '../utils/dateUtils';
import { USC_ORGANIZATIONS } from '../utils/constants';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Input } from '../components/Input';
import { Select } from '../components/Select';
import { Modal } from '../components/Modal';
import { LoadingState, EmptyState } from '../components/StateFeedback';

export function Notifications() {
  const { user } = useAuth();
  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    postAnnouncement,
  } = useNotifications();
  const { events } = useEvents({ limit: 30 });
  const { showToast } = useToast();

  const [modalOpen, setModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [eventId, setEventId] = useState('');
  const [senderOrg, setSenderOrg] = useState(USC_ORGANIZATIONS[0]);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handlePostAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || title.trim().length < 4) {
      setFormError('Announcement title must be at least 4 characters.');
      return;
    }
    if (!message.trim() || message.trim().length < 10) {
      setFormError('Announcement message must be at least 10 characters.');
      return;
    }

    setFormError('');
    setSubmitting(true);
    try {
      const linkedEvent = events.find((ev) => ev.id === eventId);
      await postAnnouncement({
        title: title.trim(),
        message: message.trim(),
        eventId: linkedEvent?.id,
        eventTitle: linkedEvent?.title,
        senderName: user?.name || 'Event Organizer',
        senderOrganization: senderOrg,
      });
      showToast('Announcement Broadcasted', 'success', 'Sent to registered USC students.');
      setTitle('');
      setMessage('');
      setEventId('');
      setModalOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <p className="text-xs font-semibold text-usc-green-dark">
            Campus Bulletins & Event Updates
          </p>
          <h1 className="text-3xl font-bold text-text-primary font-serif">
            Notifications & Announcements
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            Official updates from USC student organizations, venue advisories, and registration
            confirmations.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={() => markAllAsRead()}>
              <CheckCheck className="w-4 h-4" />
              Mark All Read ({unreadCount})
            </Button>
          )}
          <Button variant="primary" size="sm" onClick={() => setModalOpen(true)}>
            <Megaphone className="w-4 h-4" />
            Post Announcement
          </Button>
        </div>
      </div>

      {isLoading ? (
        <LoadingState message="Loading campus announcements..." />
      ) : notifications.length === 0 ? (
        <EmptyState
          title="No notifications yet"
          description="Updates from your registered USC events will appear here."
        />
      ) : (
        <div className="space-y-4">
          {notifications.map((n) => (
            <Card
              key={n.id}
              padding="md"
              className={!n.isRead ? 'border-usc-green/50 bg-usc-green-light/25' : ''}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge
                      variant={
                        n.type === 'alert'
                          ? 'full'
                          : n.type === 'registration'
                          ? 'open'
                          : 'upcoming'
                      }
                    >
                      {n.type === 'alert'
                        ? 'Capacity Alert'
                        : n.type === 'registration'
                        ? 'Registration'
                        : 'Announcement'}
                    </Badge>
                    <span className="text-xs font-semibold text-usc-green-dark">
                      {n.senderOrganization}
                    </span>
                    <span aria-hidden="true" className="text-text-muted">
                      ·
                    </span>
                    <span className="text-xs text-text-muted">
                      {formatRelativeTimestamp(n.createdAt)}
                    </span>
                  </div>

                  <h2 className="text-base font-bold text-text-primary font-serif">{n.title}</h2>
                  <p className="text-sm text-text-secondary leading-relaxed">{n.message}</p>

                  {n.eventId && (
                    <div className="pt-1">
                      <Link
                        to={`/events/${n.eventId}`}
                        className="text-xs font-semibold text-usc-green hover:underline"
                      >
                        View Event: {n.eventTitle || 'Open Details'} →
                      </Link>
                    </div>
                  )}
                </div>

                {!n.isRead && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => markAsRead(n.id)}
                    aria-label={`Mark "${n.title}" as read`}
                  >
                    <Bell className="w-3.5 h-3.5 text-usc-green" />
                    Mark Read
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Post Announcement Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Post Campus Announcement"
      >
        <form onSubmit={handlePostAnnouncement} noValidate className="space-y-4">
          {formError && (
            <p role="alert" className="rounded-lg bg-usc-red-light p-3 text-xs font-medium text-usc-red-dark">
              {formError}
            </p>
          )}

          <Input
            label="Announcement Headline"
            placeholder="e.g. Venue Gate Change for Engineering Week"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <Select
            label="Organizing Body / Council"
            value={senderOrg}
            onChange={(e) => setSenderOrg(e.target.value)}
            options={USC_ORGANIZATIONS.map((o) => ({ value: o, label: o }))}
          />

          <Select
            label="Related Event (Optional)"
            value={eventId}
            onChange={(e) => setEventId(e.target.value)}
            options={[
              { value: '', label: 'General Campus-Wide Announcement' },
              ...events.map((ev) => ({ value: ev.id, label: ev.title })),
            ]}
          />

          <div>
            <label
              htmlFor="announcement-message"
              className="block text-xs font-semibold text-text-primary mb-1.5"
            >
              Announcement Details
            </label>
            <textarea
              id="announcement-message"
              rows={4}
              placeholder="Write instructions for registered students..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full rounded-lg border border-surface-border bg-surface-white px-3.5 py-2 text-sm text-text-primary focus:border-usc-green focus:outline-none focus:ring-2 focus:ring-usc-green/20"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={submitting}>
              <Send className="w-4 h-4" />
              {submitting ? 'Publishing...' : 'Publish Announcement'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

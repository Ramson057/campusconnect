import React, { useState } from 'react';
import { Edit3, Plus, Trash2 } from 'lucide-react';
import { CampusLocation, EventCategory, EventItem } from '../types/models';
import { eventService } from '../services/eventService';
import { useAuth } from '../hooks/useAuth';
import { useEvents } from '../hooks/useEvents';
import { useToast } from '../hooks/useToast';
import {
  CAMPUS_LOCATIONS,
  EVENT_CATEGORIES,
  USC_ORGANIZATIONS,
} from '../utils/constants';
import { formatEventDate } from '../utils/dateUtils';
import { validateEventForm } from '../utils/validators';
import { ASSET_IMAGES } from '../assets/assetPaths';
import { Badge, getStatusBadgeProps } from '../components/Badge';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Select } from '../components/Select';
import { Modal } from '../components/Modal';
import { Table } from '../components/Table';
import { LoadingState, ErrorState } from '../components/StateFeedback';

const IMAGE_PRESETS = [
  { label: 'Engineering & Robotics Atrium', value: ASSET_IMAGES.engineeringWeek },
  { label: 'USC Stadium & Intramurals', value: ASSET_IMAGES.intramurals },
  { label: 'Career Fair & Corporate Hall', value: ASSET_IMAGES.careerFair },
  { label: 'Campus Quad Org Recruitment', value: ASSET_IMAGES.orgRecruitment },
];

export function ManageEvents() {
  const { user } = useAuth();
  const { events, loading, error, refetch } = useEvents({ limit: 50 });
  const { showToast } = useToast();

  const [formOpen, setFormOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<EventItem | null>(null);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('2026-11-25');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('16:00');
  const [venue, setVenue] = useState('');
  const [campus, setCampus] = useState<CampusLocation>(CAMPUS_LOCATIONS[0]);
  const [category, setCategory] = useState<EventCategory>(EVENT_CATEGORIES[0]);
  const [organizer, setOrganizer] = useState(USC_ORGANIZATIONS[0]);
  const [capacity, setCapacity] = useState(100);
  const [imageUrl, setImageUrl] = useState<string>(ASSET_IMAGES.engineeringWeek);
  const [isFeatured, setIsFeatured] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const openCreateModal = () => {
    setEditingEvent(null);
    setTitle('');
    setDescription('');
    setDate('2026-11-28');
    setStartTime('09:00');
    setEndTime('16:00');
    setVenue('Lawrence Bunzel Building Hall');
    setCampus(CAMPUS_LOCATIONS[0]);
    setCategory(EVENT_CATEGORIES[0]);
    setOrganizer(USC_ORGANIZATIONS[0]);
    setCapacity(100);
    setImageUrl(ASSET_IMAGES.engineeringWeek);
    setIsFeatured(false);
    setErrors({});
    setFormOpen(true);
  };

  const openEditModal = (ev: EventItem) => {
    setEditingEvent(ev);
    setTitle(ev.title);
    setDescription(ev.description);
    setDate(ev.date);
    setStartTime(ev.startTime);
    setEndTime(ev.endTime);
    setVenue(ev.venue);
    setCampus(ev.campus);
    setCategory(ev.category);
    setOrganizer(ev.organizer);
    setCapacity(ev.capacity);
    setImageUrl(ev.imageUrl);
    setIsFeatured(ev.isFeatured);
    setErrors({});
    setFormOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateEventForm({
      title,
      description,
      date,
      startTime,
      endTime,
      venue,
      campus,
      category,
      organizer,
      capacity: Number(capacity),
    });

    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }

    setSaving(true);
    try {
      if (editingEvent) {
        await eventService.updateEvent(editingEvent.id, {
          title: title.trim(),
          description: description.trim(),
          date,
          startTime,
          endTime,
          venue: venue.trim(),
          campus,
          category,
          organizer,
          capacity: Number(capacity),
          imageUrl,
          isFeatured,
        });
        showToast('Event Updated', 'success', `${title} has been updated.`);
      } else {
        await eventService.createEvent({
          title: title.trim(),
          description: description.trim(),
          date,
          startTime,
          endTime,
          venue: venue.trim(),
          campus,
          category,
          organizer,
          organizerId: user?.id || 'usr-admin-1',
          capacity: Number(capacity),
          imageUrl,
          isFeatured,
        });
        showToast('Event Created', 'success', `${title} is now live on CampusConnect.`);
      }
      setFormOpen(false);
      await refetch();
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setSaving(true);
    try {
      await eventService.deleteEvent(deleteTarget.id);
      showToast('Event Deleted', 'info', `${deleteTarget.title} was removed.`);
      setDeleteTarget(null);
      await refetch();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-usc-green-dark">Event Administration</p>
          <h1 className="text-2xl sm:text-3xl font-bold text-text-primary font-serif">
            Manage Campus Events
          </h1>
        </div>
        <Button variant="primary" onClick={openCreateModal}>
          <Plus className="w-4 h-4" />
          Create New Event
        </Button>
      </div>

      {loading ? (
        <LoadingState message="Loading campus events..." />
      ) : error ? (
        <ErrorState message={error} onRetry={refetch} />
      ) : (
        <Table
          rowKey={(e) => e.id}
          data={events}
          columns={[
            {
              key: 'title',
              header: 'Event & Organizer',
              render: (e) => (
                <div>
                  <p className="font-bold text-text-primary font-serif">{e.title}</p>
                  <p className="text-xs text-text-secondary">
                    {e.organizer} · {e.category}
                  </p>
                </div>
              ),
            },
            {
              key: 'schedule',
              header: 'Date & Venue',
              render: (e) => (
                <div className="text-xs">
                  <p className="font-semibold text-text-primary">{formatEventDate(e.date)}</p>
                  <p className="text-text-muted">
                    {e.venue} ({e.campus})
                  </p>
                </div>
              ),
            },
            {
              key: 'capacity',
              header: 'Seats Filled',
              align: 'right',
              render: (e) => (
                <span className="font-mono text-xs font-semibold">
                  {e.registeredCount}/{e.capacity}
                </span>
              ),
            },
            {
              key: 'status',
              header: 'Status',
              render: (e) => {
                const st = getStatusBadgeProps(e.status);
                return <Badge variant={st.variant}>{st.label}</Badge>;
              },
            },
            {
              key: 'actions',
              header: 'Actions',
              align: 'right',
              render: (e) => (
                <div className="inline-flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditModal(e)}
                    aria-label={`Edit ${e.title}`}
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    Edit
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => setDeleteTarget(e)}
                    aria-label={`Delete ${e.title}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete
                  </Button>
                </div>
              ),
            },
          ]}
        />
      )}

      {/* Create / Edit Event Modal */}
      <Modal
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        title={editingEvent ? 'Edit Campus Event' : 'Create New Campus Event'}
        maxWidthClass="max-w-2xl"
      >
        <form onSubmit={handleSave} noValidate className="space-y-4">
          <Input
            label="Event Title"
            placeholder="e.g. USC Software Engineering Hackathon 2026"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            error={errors.title}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Category"
              value={category}
              onChange={(e) => setCategory(e.target.value as EventCategory)}
              options={EVENT_CATEGORIES.map((c) => ({ value: c, label: c }))}
            />
            <Select
              label="Organizing Council / Organization"
              value={organizer}
              onChange={(e) => setOrganizer(e.target.value)}
              options={USC_ORGANIZATIONS.map((o) => ({ value: o, label: o }))}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Event Date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              error={errors.date}
            />
            <Input
              label="Start Time"
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              error={errors.startTime}
            />
            <Input
              label="End Time"
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              error={errors.endTime}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Specific Venue / Building"
              placeholder="e.g. Bunzel Atrium"
              value={venue}
              onChange={(e) => setVenue(e.target.value)}
              error={errors.venue}
            />
            <Select
              label="USC Campus"
              value={campus}
              onChange={(e) => setCampus(e.target.value as CampusLocation)}
              options={CAMPUS_LOCATIONS.map((c) => ({ value: c, label: c }))}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Maximum Seat Capacity"
              type="number"
              min={5}
              max={10000}
              value={String(capacity)}
              onChange={(e) => setCapacity(Number(e.target.value))}
              error={errors.capacity}
            />
            <Select
              label="Event Banner Image"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              options={IMAGE_PRESETS}
            />
          </div>

          <div>
            <label
              htmlFor="event-desc"
              className="block text-xs font-semibold text-text-primary mb-1.5"
            >
              Event Description
            </label>
            <textarea
              id="event-desc"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide full event schedule, requirements, and target participants..."
              className="w-full rounded-lg border border-surface-border bg-surface-white px-3.5 py-2 text-sm text-text-primary focus:border-usc-green focus:outline-none"
            />
            {errors.description && (
              <p role="alert" className="mt-1 text-xs font-medium text-usc-red">
                {errors.description}
              </p>
            )}
          </div>

          <label className="inline-flex items-center gap-2 text-xs font-semibold text-text-primary cursor-pointer">
            <input
              type="checkbox"
              checked={isFeatured}
              onChange={(e) => setIsFeatured(e.target.checked)}
              className="rounded border-surface-border text-usc-green focus:ring-usc-green"
            />
            <span>Mark as Featured Event (Gold Highlight Badge)</span>
          </label>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-surface-border">
            <Button variant="outline" onClick={() => setFormOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={saving}>
              {saving ? 'Saving...' : editingEvent ? 'Save Changes' : 'Publish Event'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Confirm Event Deletion"
      >
        <p className="text-sm text-text-secondary">
          Are you sure you want to permanently delete{' '}
          <strong className="text-text-primary">{deleteTarget?.title}</strong>? All associated
          registrations will be archived.
        </p>
        <div className="mt-6 flex items-center justify-end gap-3">
          <Button variant="outline" onClick={() => setDeleteTarget(null)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleConfirmDelete} disabled={saving}>
            {saving ? 'Deleting...' : 'Confirm Delete'}
          </Button>
        </div>
      </Modal>
    </div>
  );
}

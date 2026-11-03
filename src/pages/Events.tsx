import { useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { useEvents } from '../hooks/useEvents';
import {
  CAMPUS_LOCATIONS,
  EVENT_CATEGORIES,
  USC_ORGANIZATIONS,
} from '../utils/constants';
import { EventCard } from '../components/EventCard';
import { Input } from '../components/Input';
import { Select } from '../components/Select';
import { Button } from '../components/Button';
import { LoadingState, ErrorState, EmptyState } from '../components/StateFeedback';

export function Events() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('ALL');
  const [campus, setCampus] = useState('ALL');
  const [organizer, setOrganizer] = useState('ALL');
  const [date, setDate] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [page, setPage] = useState(1);

  const { events, total, totalPages, loading, error, refetch } = useEvents({
    search,
    category,
    campus,
    organizer,
    date,
    status: statusFilter,
    page,
    limit: 6,
  });

  const handleResetFilters = () => {
    setSearch('');
    setCategory('ALL');
    setCampus('ALL');
    setOrganizer('ALL');
    setDate('');
    setStatusFilter('ALL');
    setPage(1);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <p className="text-xs font-semibold text-usc-green-dark mb-1">
          University of San Carlos Event Directory
        </p>
        <h1 className="text-3xl font-bold text-text-primary font-serif">
          Explore Campus Events
        </h1>
        <p className="mt-1.5 text-sm text-text-secondary max-w-2xl">
          Search and filter academic symposia, engineering expos, intramurals, and student
          organization activities across all USC campuses.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="rounded-xl border border-surface-border bg-surface-gray p-5 mb-8 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <div className="md:col-span-2">
            <Input
              label="Search Keyword"
              placeholder="Search title, venue, robotics, career..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>

          <Select
            label="Category"
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setPage(1);
            }}
            options={[
              { value: 'ALL', label: 'All Categories' },
              ...EVENT_CATEGORIES.map((c) => ({ value: c, label: c })),
            ]}
          />

          <Select
            label="Campus Location"
            value={campus}
            onChange={(e) => {
              setCampus(e.target.value);
              setPage(1);
            }}
            options={[
              { value: 'ALL', label: 'All USC Campuses' },
              ...CAMPUS_LOCATIONS.map((c) => ({ value: c, label: c })),
            ]}
          />

          <Input
            label="Event Date"
            type="date"
            value={date}
            onChange={(e) => {
              setDate(e.target.value);
              setPage(1);
            }}
          />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pt-2 border-t border-surface-border">
          <div className="w-full sm:w-80">
            <Select
              label="Organizing Body"
              value={organizer}
              onChange={(e) => {
                setOrganizer(e.target.value);
                setPage(1);
              }}
              options={[
                { value: 'ALL', label: 'All Accredited Organizations' },
                ...USC_ORGANIZATIONS.map((o) => ({ value: o, label: o })),
              ]}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {(['ALL', 'open', 'full', 'featured', 'ended'] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => {
                  setStatusFilter(st);
                  setPage(1);
                }}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                  statusFilter === st
                    ? 'bg-usc-green text-surface-white'
                    : 'bg-surface-white border border-surface-border text-text-secondary hover:text-text-primary'
                }`}
              >
                {st === 'ALL'
                  ? 'All Statuses'
                  : st === 'open'
                  ? 'Open'
                  : st === 'full'
                  ? 'Full'
                  : st === 'featured'
                  ? 'Featured'
                  : 'Past / Ended'}
              </button>
            ))}

            <Button variant="outline" size="sm" onClick={handleResetFilters}>
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Filters
            </Button>
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between mb-5 text-xs text-text-secondary">
        <span>
          Showing <strong className="text-text-primary tabular-nums">{events.length}</strong> of{' '}
          <strong className="text-text-primary tabular-nums">{total}</strong> matching events
        </span>
      </div>

      {/* Events Grid */}
      {loading ? (
        <LoadingState message="Searching USC campus events..." />
      ) : error ? (
        <ErrorState message={error} onRetry={refetch} />
      ) : events.length === 0 ? (
        <EmptyState
          title="No events match your current filters"
          description="Try clearing your search query or switching to 'All USC Campuses' to see more scheduled activities."
          action={
            <Button variant="primary" size="sm" onClick={handleResetFilters}>
              Clear All Filters
            </Button>
          }
        />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-10 flex items-center justify-center gap-3">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous Page
              </Button>
              <span className="text-xs font-semibold text-text-secondary tabular-nums">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Next Page
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

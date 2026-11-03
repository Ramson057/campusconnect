import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CalendarCheck, QrCode, Search, Star } from 'lucide-react';
import { useEvents } from '../hooks/useEvents';
import { ASSET_IMAGES } from '../assets/assetPaths';
import { USC_THEME } from '../config/theme';
import { EventCard } from '../components/EventCard';
import { LoadingState, ErrorState, EmptyState } from '../components/StateFeedback';

export function Home() {
  const { events, loading, error, refetch } = useEvents({ limit: 12 });
  const [heroImgFailed, setHeroImgFailed] = useState(false);

  const featuredEvents = events.filter((e) => e.isFeatured).slice(0, 3);
  const upcomingEvents = events.filter((e) => e.status !== 'ended').slice(0, 6);

  return (
    <div>
      {/* Hero Section */}
      <section className="border-b border-surface-border bg-surface-gray py-12 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
            <div className="lg:col-span-7 flex flex-col justify-center">
              <p className="text-xs font-semibold text-usc-green-dark mb-3">
                {USC_THEME.universityName} · {USC_THEME.motto}
              </p>
              <h1 className="text-3xl sm:text-5xl font-bold text-text-primary font-serif leading-tight">
                Discover, Register, and Track Every Carolinian Campus Event in One Place.
              </h1>
              <p className="mt-4 text-base text-text-secondary max-w-2xl leading-relaxed">
                No more missed symposia, engineering weeks, or organization recruitments buried in
                scattered group chats. CampusConnect connects USC students and accredited
                organizations across Talamban, Downtown Main, North, and South Campuses.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link
                  to="/events"
                  className="inline-flex items-center gap-2 rounded-lg bg-usc-green px-6 py-3 text-sm font-semibold text-surface-white hover:bg-usc-green-dark transition-colors"
                >
                  <span>Explore Campus Events</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 rounded-lg border border-surface-border bg-surface-white px-5 py-3 text-sm font-semibold text-text-primary hover:border-usc-green hover:bg-usc-green-light transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/signup"
                  className="inline-flex items-center gap-2 rounded-lg border border-usc-blue bg-usc-blue-light/50 px-5 py-3 text-sm font-semibold text-usc-blue-dark hover:bg-usc-blue hover:text-surface-white transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="relative h-full min-h-[280px] rounded-xl overflow-hidden border border-surface-border bg-usc-green-light shadow-sm">
                {!heroImgFailed ? (
                  <img
                    src={ASSET_IMAGES.campusHero}
                    alt="University of San Carlos Campus Courtyard"
                    referrerPolicy="no-referrer"
                    onError={() => setHeroImgFailed(true)}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-usc-green-light p-8 text-center">
                    <span className="text-lg font-serif font-bold text-usc-green-dark">
                      University of San Carlos · CampusConnect
                    </span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 text-surface-white">
                  <p className="text-xs font-medium text-usc-gold">
                    Academic Year 2026–2027 · 1st Semester
                  </p>
                  <p className="text-sm font-bold font-serif mt-0.5">
                    60+ Accredited Student Organizations & Academic Councils
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Full-width 4-column metric strip below hero split */}
          <div className="mt-10 grid grid-cols-2 lg:grid-cols-4 gap-4 pt-8 border-t border-surface-border">
            <div>
              <p className="text-2xl font-bold text-usc-green-dark font-mono tabular-nums">4</p>
              <p className="text-xs text-text-secondary mt-0.5">
                USC Campuses Connected (TC, Main, North, South)
              </p>
            </div>
            <div>
              <p className="text-2xl font-bold text-usc-green-dark font-mono tabular-nums">60+</p>
              <p className="text-xs text-text-secondary mt-0.5">
                Accredited Student Orgs & Academic Councils
              </p>
            </div>
            <div>
              <p className="text-2xl font-bold text-usc-green-dark font-mono tabular-nums">100%</p>
              <p className="text-xs text-text-secondary mt-0.5">
                Real-Time Seat Capacity & Digital Pass Tracking
              </p>
            </div>
            <div>
              <p className="text-2xl font-bold text-usc-green-dark font-mono tabular-nums">CES</p>
              <p className="text-xs text-text-secondary mt-0.5">
                Verified Attendance Logs for Student Activities
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Events Spotlight */}
      <section className="py-14 bg-surface-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-usc-green-dark mb-1">
                <Star className="w-3.5 h-3.5 text-usc-gold fill-usc-gold" />
                <span>Featured Highlights</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-text-primary font-serif">
                Featured Carolinian Events
              </h2>
            </div>
            <Link
              to="/events"
              className="text-xs font-semibold text-usc-green hover:text-usc-green-dark"
            >
              View All Campus Events →
            </Link>
          </div>

          {loading ? (
            <LoadingState message="Loading featured USC events..." />
          ) : error ? (
            <ErrorState message={error} onRetry={refetch} />
          ) : featuredEvents.length === 0 ? (
            <EmptyState
              title="No featured events currently scheduled"
              description="Check the full campus directory for upcoming organization activities."
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-14 bg-surface-gray border-y border-surface-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-10">
            <p className="text-xs font-semibold text-usc-blue mb-1">How CampusConnect Works</p>
            <h2 className="text-2xl sm:text-3xl font-bold text-text-primary font-serif">
              From Discovery to Verified Attendance in Three Steps
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-xl border border-surface-border bg-surface-white p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-usc-green-light text-usc-green mb-4">
                <Search className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-text-primary font-serif">
                01. Discover by Campus & Category
              </h3>
              <p className="mt-2 text-sm text-text-secondary leading-relaxed">
                Filter events across Talamban, Downtown Main, North, and South campuses by category,
                date, or student organization without digging through social feeds.
              </p>
            </div>

            <div className="rounded-xl border border-surface-border bg-surface-white p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-usc-blue-light text-usc-blue mb-4">
                <CalendarCheck className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-text-primary font-serif">
                02. One-Click Seat Registration
              </h3>
              <p className="mt-2 text-sm text-text-secondary leading-relaxed">
                Reserve your spot with live capacity indicators. Receive an instant USC digital
                ticket code and real-time organizer announcements.
              </p>
            </div>

            <div className="rounded-xl border border-surface-border bg-surface-white p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-usc-gold-light text-usc-green-dark mb-4">
                <QrCode className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-text-primary font-serif">
                03. Check-In & Automated Reports
              </h3>
              <p className="mt-2 text-sm text-text-secondary leading-relaxed">
                Organizers check in attendees by USC ID or ticket code at the venue door and export
                attendance summaries in CSV or PDF format.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Upcoming Events Directory Preview */}
      <section className="py-14 bg-surface-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-xs font-semibold text-usc-green-dark mb-1">
                University Schedule
              </p>
              <h2 className="text-2xl sm:text-3xl font-bold text-text-primary font-serif">
                Upcoming & Active Events
              </h2>
            </div>
            <Link
              to="/calendar"
              className="text-xs font-semibold text-usc-blue hover:text-usc-blue-dark"
            >
              Open Monthly Calendar →
            </Link>
          </div>

          {!loading && !error && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

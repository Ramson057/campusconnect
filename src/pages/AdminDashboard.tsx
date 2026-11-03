import { Link } from 'react-router-dom';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Calendar, CheckCircle2, Users, TrendingUp } from 'lucide-react';
import { reportService } from '../services/reportService';
import { authService } from '../services/authService';
import { eventService } from '../services/eventService';
import { useFetch } from '../hooks/useFetch';
import { USC_THEME } from '../config/theme';
import { formatEventDate } from '../utils/dateUtils';
import { Badge, getStatusBadgeProps } from '../components/Badge';
import { Card } from '../components/Card';
import { Table } from '../components/Table';
import { LoadingState, ErrorState } from '../components/StateFeedback';

export function AdminDashboard() {
  const { data, loading, error, refetch } = useFetch(async () => {
    const [metrics, usersRes, eventsRes] = await Promise.all([
      reportService.getDashboardMetrics(),
      authService.getUsers({ page: 1, limit: 10 }),
      eventService.getEvents({ page: 1, limit: 10 }),
    ]);
    return { metrics, users: usersRes.data, events: eventsRes.data };
  }, []);

  if (loading) {
    return <LoadingState message="Loading USC organizer analytics..." />;
  }

  if (error || !data) {
    return <ErrorState message={error || 'Failed to load dashboard.'} onRetry={refetch} />;
  }

  const { metrics, users, events } = data;

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-usc-green-dark">
            Office of Student Affairs & Accredited Organizations
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold text-text-primary font-serif">
            Organizer & Admin Analytics Dashboard
          </h1>
        </div>
        <div className="flex items-center gap-2.5">
          <Link
            to="/admin/events"
            className="rounded-lg bg-usc-green px-4 py-2 text-xs font-semibold text-surface-white hover:bg-usc-green-dark transition-colors"
          >
            + Create / Manage Events
          </Link>
          <Link
            to="/admin/attendance"
            className="rounded-lg bg-usc-blue px-4 py-2 text-xs font-semibold text-surface-white hover:bg-usc-blue-dark transition-colors"
          >
            Open Check-In Desk
          </Link>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card padding="md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-text-secondary">Total Events</span>
            <Calendar className="w-4 h-4 text-usc-green" />
          </div>
          <p className="mt-2 text-2xl font-bold text-text-primary font-mono tabular-nums">
            {metrics.totalEvents}
          </p>
          <p className="mt-1 text-[11px] text-text-muted">Across 4 USC Campuses</p>
        </Card>

        <Card padding="md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-text-secondary">Total Registrations</span>
            <TrendingUp className="w-4 h-4 text-usc-blue" />
          </div>
          <p className="mt-2 text-2xl font-bold text-usc-green-dark font-mono tabular-nums">
            {metrics.totalRegistrations}
          </p>
          <p className="mt-1 text-[11px] text-text-muted">1st Semester AY 2026–2027</p>
        </Card>

        <Card padding="md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-text-secondary">Attendance Rate</span>
            <CheckCircle2 className="w-4 h-4 text-usc-green" />
          </div>
          <p className="mt-2 text-2xl font-bold text-usc-blue font-mono tabular-nums">
            {metrics.overallAttendanceRate}%
          </p>
          <p className="mt-1 text-[11px] text-text-muted">Verified check-ins vs. seats</p>
        </Card>

        <Card padding="md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-text-secondary">Active Users</span>
            <Users className="w-4 h-4 text-usc-gold-dark" />
          </div>
          <p className="mt-2 text-2xl font-bold text-text-primary font-mono tabular-nums">
            {metrics.activeUsers}
          </p>
          <p className="mt-1 text-[11px] text-text-muted">Students & Org Officers</p>
        </Card>
      </div>

      {/* Recharts Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card padding="md">
          <h2 className="text-base font-bold text-text-primary font-serif mb-1">
            Registrations & Verified Attendance Over Time
          </h2>
          <p className="text-xs text-text-secondary mb-4">
            Monthly student participation across USC campuses
          </p>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={metrics.registrationsTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke={USC_THEME.colors.surfaceBorder} />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line
                  type="monotone"
                  dataKey="registrations"
                  name="Registrations"
                  stroke={USC_THEME.colors.primary}
                  strokeWidth={2.5}
                />
                <Line
                  type="monotone"
                  dataKey="attendance"
                  name="Checked-In"
                  stroke={USC_THEME.colors.secondary}
                  strokeWidth={2.5}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card padding="md">
          <h2 className="text-base font-bold text-text-primary font-serif mb-1">
            Most Popular Campus Events
          </h2>
          <p className="text-xs text-text-secondary mb-4">
            Registered seats vs. venue capacity
          </p>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics.popularEvents}>
                <CartesianGrid strokeDasharray="3 3" stroke={USC_THEME.colors.surfaceBorder} />
                <XAxis dataKey="name" interval={0} tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar
                  dataKey="registered"
                  name="Registered"
                  fill={USC_THEME.colors.primary}
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="attended"
                  name="Attended"
                  fill={USC_THEME.colors.highlight}
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Event Management Summary Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-text-primary font-serif">
            Event Capacity & Status Overview
          </h2>
          <Link to="/admin/events" className="text-xs font-semibold text-usc-green hover:underline">
            Full Event Manager →
          </Link>
        </div>
        <Table
          rowKey={(e) => e.id}
          data={events}
          columns={[
            {
              key: 'title',
              header: 'Event Title',
              render: (e) => (
                <div>
                  <Link
                    to={`/events/${e.id}`}
                    className="font-semibold text-text-primary hover:text-usc-green"
                  >
                    {e.title}
                  </Link>
                  <p className="text-xs text-text-muted">{e.organizer}</p>
                </div>
              ),
            },
            {
              key: 'date',
              header: 'Date & Campus',
              render: (e) => (
                <div className="text-xs">
                  <p className="font-medium text-text-primary">{formatEventDate(e.date)}</p>
                  <p className="text-text-muted">{e.campus}</p>
                </div>
              ),
            },
            {
              key: 'capacity',
              header: 'Registrations',
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
                const badge = getStatusBadgeProps(e.status);
                return <Badge variant={badge.variant}>{badge.label}</Badge>;
              },
            },
          ]}
        />
      </div>

      {/* User Directory Table */}
      <div className="space-y-3">
        <h2 className="text-lg font-bold text-text-primary font-serif">
          Registered Carolinian Users & Organizers
        </h2>
        <Table
          rowKey={(u) => u.id}
          data={users}
          columns={[
            {
              key: 'name',
              header: 'Name & Email',
              render: (u) => (
                <div>
                  <p className="font-semibold text-text-primary">{u.name}</p>
                  <p className="text-xs text-text-muted">{u.email}</p>
                </div>
              ),
            },
            {
              key: 'studentId',
              header: 'USC ID',
              render: (u) => <span className="font-mono text-xs">{u.studentId}</span>,
            },
            {
              key: 'course',
              header: 'Program / Office',
              render: (u) => (
                <span className="text-xs text-text-secondary">
                  {u.course} · {u.yearLevel}
                </span>
              ),
            },
            {
              key: 'role',
              header: 'Role',
              render: (u) => (
                <Badge variant={u.role === 'admin' ? 'upcoming' : 'open'}>
                  {u.role === 'admin' ? 'Organizer / Admin' : 'Student'}
                </Badge>
              ),
            },
          ]}
        />
      </div>
    </div>
  );
}

import { NavLink, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  CalendarPlus,
  QrCode,
  FileSpreadsheet,
  Bell,
} from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';

const adminLinks = [
  { to: '/admin', label: 'Analytics Overview', icon: LayoutDashboard, end: true },
  { to: '/admin/events', label: 'Manage Events', icon: CalendarPlus, end: false },
  { to: '/admin/attendance', label: 'Attendance & Check-In', icon: QrCode, end: false },
  { to: '/admin/reports', label: 'Event Reports', icon: FileSpreadsheet, end: false },
  { to: '/notifications', label: 'Post Announcements', icon: Bell, end: false },
];

export function AdminLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-surface-gray text-text-primary">
      <Navbar />
      <div className="mx-auto w-full max-w-7xl flex-1 px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          <aside className="w-full lg:w-60 shrink-0">
            <div className="rounded-xl border border-surface-border bg-surface-white p-4">
              <p className="px-3 text-xs font-bold text-usc-green-dark font-serif mb-2">
                Organizer Workspace
              </p>
              <nav aria-label="Organizer Sidebar" className="space-y-1">
                {adminLinks.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={item.end}
                      className={({ isActive }) =>
                        `flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
                          isActive
                            ? 'bg-usc-green text-surface-white'
                            : 'text-text-secondary hover:bg-surface-gray hover:text-text-primary'
                        }`
                      }
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{item.label}</span>
                    </NavLink>
                  );
                })}
              </nav>
            </div>
          </aside>

          <main className="flex-1 min-w-0">
            <Outlet />
          </main>
        </div>
      </div>
      <Footer />
    </div>
  );
}

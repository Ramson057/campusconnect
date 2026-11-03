import { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  Bell,
  Shield,
  User as UserIcon,
  LogOut,
  Menu,
  X,
  CheckCheck,
  Repeat,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useNotifications } from '../hooks/useNotifications';
import { useToast } from '../hooks/useToast';
import { formatRelativeTimestamp } from '../utils/dateUtils';

export function Navbar() {
  const { user, isAuthenticated, logout, switchDemoRole } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [bellOpen, setBellOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const bellRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) {
        setBellOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const isAdmin = user?.role === 'admin';

  const navItems = isAdmin
    ? [
        { to: '/events', label: 'Events' },
        { to: '/calendar', label: 'Calendar' },
        { to: '/admin', label: 'Admin Dashboard' },
        { to: '/admin/events', label: 'Manage Events' },
        { to: '/admin/attendance', label: 'Check-In' },
        { to: '/admin/reports', label: 'Reports' },
      ]
    : [
        { to: '/', label: 'Home' },
        { to: '/events', label: 'Events' },
        { to: '/calendar', label: 'Calendar' },
        { to: '/dashboard', label: 'My Dashboard' },
        { to: '/notifications', label: 'Announcements' },
      ];

  const handleToggleRole = () => {
    const nextRole = isAdmin ? 'student' : 'admin';
    switchDemoRole(nextRole);
    setProfileOpen(false);
    showToast(
      `Switched to ${nextRole === 'admin' ? 'Organizer / Admin' : 'Student'} view`,
      'info',
      nextRole === 'admin'
        ? 'You now have access to event management, attendance check-in, and analytics.'
        : 'Viewing CampusConnect as a Carolinian student.'
    );
    navigate(nextRole === 'admin' ? '/admin' : '/dashboard');
  };

  const handleLogout = () => {
    logout();
    setProfileOpen(false);
    showToast('Signed out of CampusConnect', 'info');
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 border-b border-surface-border bg-surface-white/95 backdrop-blur-xs">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-8 px-4 sm:px-6 lg:px-8 h-16">
        {/* Zone 1: USC Logo Placeholder & Brand Wordmark */}
        <Link
          to="/"
          className="inline-flex items-center gap-2.5 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-usc-green rounded-lg"
        >
          <span
            aria-hidden="true"
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-usc-green text-usc-gold font-serif font-bold text-sm border border-usc-gold/40 shadow-xs"
          >
            USC
          </span>
          <span className="text-lg font-bold tracking-tight text-usc-green-dark font-serif whitespace-nowrap shrink-0">
            CampusConnect
          </span>
        </Link>

        {/* Zone 2: Role-Aware Navigation Links */}
        <nav
          aria-label="Primary Navigation"
          className="hidden lg:flex items-center gap-6 text-sm font-medium text-text-secondary"
        >
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/' || item.to === '/admin'}
              className={({ isActive }) =>
                `py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 ${
                  isActive
                    ? 'border-usc-green text-usc-green-dark font-semibold'
                    : 'border-transparent text-text-secondary hover:text-usc-green'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Zone 3: Notification Bell, Role Switcher & Profile Menu */}
        <div className="flex items-center gap-3 shrink-0">
          {isAuthenticated && user ? (
            <>
              <button
                type="button"
                onClick={handleToggleRole}
                className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-surface-border bg-surface-gray px-3 py-1.5 text-xs font-semibold text-text-primary hover:border-usc-green hover:bg-usc-green-light transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                title="Switch between Student and Organizer/Admin role"
              >
                <Repeat className="w-3.5 h-3.5 text-usc-green" />
                <span>{isAdmin ? 'Role: Organizer' : 'Role: Student'}</span>
              </button>

              {/* Notification Bell Dropdown */}
              <div className="relative" ref={bellRef}>
                <button
                  type="button"
                  onClick={() => setBellOpen((o) => !o)}
                  aria-label={`Notifications (${unreadCount} unread)`}
                  aria-expanded={bellOpen}
                  className="relative rounded-lg p-2 text-text-secondary hover:bg-surface-gray hover:text-usc-green transition-colors cursor-pointer"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-usc-red px-1 text-[10px] font-bold text-surface-white tabular-nums">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {bellOpen && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl border border-surface-border bg-surface-white shadow-xl overflow-hidden z-50">
                    <div className="flex items-center justify-between border-b border-surface-border bg-surface-gray px-4 py-3">
                      <span className="text-xs font-bold text-text-primary">
                        Notifications & Announcements
                      </span>
                      {unreadCount > 0 && (
                        <button
                          type="button"
                          onClick={() => markAllAsRead()}
                          className="inline-flex items-center gap-1 text-xs font-medium text-usc-green hover:text-usc-green-dark cursor-pointer"
                        >
                          <CheckCheck className="w-3.5 h-3.5" />
                          Mark all read
                        </button>
                      )}
                    </div>

                    <div className="max-h-80 overflow-y-auto divide-y divide-surface-border">
                      {notifications.slice(0, 5).map((n) => (
                        <div
                          key={n.id}
                          onClick={() => {
                            if (!n.isRead) markAsRead(n.id);
                            setBellOpen(false);
                            if (n.eventId) navigate(`/events/${n.eventId}`);
                          }}
                          className={`p-3.5 text-left transition-colors cursor-pointer hover:bg-surface-gray ${
                            !n.isRead ? 'bg-usc-green-light/40' : ''
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-xs font-semibold text-text-primary line-clamp-1">
                              {n.title}
                            </p>
                            {!n.isRead && (
                              <span
                                aria-label="Unread"
                                className="mt-1 h-2 w-2 rounded-full bg-usc-red shrink-0"
                              />
                            )}
                          </div>
                          <p className="mt-1 text-xs text-text-secondary line-clamp-2">
                            {n.message}
                          </p>
                          <p className="mt-1.5 text-[11px] text-text-muted">
                            {n.senderOrganization} · {formatRelativeTimestamp(n.createdAt)}
                          </p>
                        </div>
                      ))}
                    </div>

                    <div className="border-t border-surface-border bg-surface-gray px-4 py-2.5 text-center">
                      <Link
                        to="/notifications"
                        onClick={() => setBellOpen(false)}
                        className="text-xs font-semibold text-usc-green hover:text-usc-green-dark"
                      >
                        View All Announcements →
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* Profile Dropdown */}
              <div className="relative" ref={profileRef}>
                <button
                  type="button"
                  onClick={() => setProfileOpen((o) => !o)}
                  aria-label="Open user profile menu"
                  aria-expanded={profileOpen}
                  className="inline-flex items-center gap-2 rounded-lg border border-surface-border bg-surface-white px-2.5 py-1.5 text-xs font-semibold text-text-primary hover:bg-surface-gray transition-colors cursor-pointer"
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-usc-green text-surface-white text-xs font-bold">
                    {user.name.charAt(0)}
                  </span>
                  <span className="hidden md:inline max-w-[120px] truncate">
                    {user.name}
                  </span>
                </button>

                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-64 rounded-xl border border-surface-border bg-surface-white shadow-xl py-2 z-50">
                    <div className="px-4 py-2.5 border-b border-surface-border">
                      <p className="text-xs font-bold text-text-primary truncate">
                        {user.name}
                      </p>
                      <p className="text-[11px] text-text-secondary truncate">
                        {user.email}
                      </p>
                      <p className="mt-1 text-[11px] font-medium text-usc-green-dark">
                        {isAdmin ? 'Organizer / Administrator' : `${user.course} · ${user.yearLevel}`}
                      </p>
                    </div>

                    <div className="py-1">
                      <Link
                        to="/profile"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs text-text-primary hover:bg-surface-gray"
                      >
                        <UserIcon className="w-4 h-4 text-usc-green" />
                        User Profile & Membership
                      </Link>
                      <Link
                        to={isAdmin ? '/admin' : '/dashboard'}
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs text-text-primary hover:bg-surface-gray"
                      >
                        <Shield className="w-4 h-4 text-usc-blue" />
                        {isAdmin ? 'Admin Console' : 'Student Dashboard'}
                      </Link>
                      <button
                        type="button"
                        onClick={handleToggleRole}
                        className="flex w-full items-center gap-2.5 px-4 py-2 text-xs text-text-primary hover:bg-surface-gray text-left cursor-pointer"
                      >
                        <Repeat className="w-4 h-4 text-usc-green" />
                        Switch to {isAdmin ? 'Student' : 'Organizer / Admin'} View
                      </button>
                    </div>

                    <div className="border-t border-surface-border pt-1">
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2.5 px-4 py-2 text-xs font-medium text-usc-red hover:bg-usc-red-light text-left cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="rounded-lg px-3.5 py-2 text-xs font-semibold text-usc-green-dark hover:bg-usc-green-light transition-colors whitespace-nowrap shrink-0"
              >
                Log In
              </Link>
              <Link
                to="/signup"
                className="rounded-lg bg-usc-green px-4 py-2 text-xs font-semibold text-surface-white hover:bg-usc-green-dark transition-colors whitespace-nowrap shrink-0"
              >
                Sign Up
              </Link>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((m) => !m)}
            aria-label="Toggle navigation menu"
            className="lg:hidden rounded-lg p-2 text-text-secondary hover:bg-surface-gray"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-surface-border bg-surface-white px-4 pt-3 pb-4 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                `block rounded-lg px-3 py-2 text-sm font-medium ${
                  isActive
                    ? 'bg-usc-green-light text-usc-green-dark font-semibold'
                    : 'text-text-secondary hover:bg-surface-gray'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
          {isAuthenticated && (
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                handleToggleRole();
              }}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg border border-surface-border bg-surface-gray px-3 py-2 text-xs font-semibold text-text-primary"
            >
              <Repeat className="w-3.5 h-3.5 text-usc-green" />
              Switch to {isAdmin ? 'Student' : 'Organizer / Admin'} View
            </button>
          )}
        </div>
      )}
    </header>
  );
}

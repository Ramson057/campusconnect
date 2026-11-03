import { Navigate, Route, Routes } from 'react-router-dom';
import { StudentLayout } from '../layouts/StudentLayout';
import { AdminLayout } from '../layouts/AdminLayout';
import { AuthLayout } from '../layouts/AuthLayout';
import { ProtectedRoute } from './ProtectedRoute';
import { Home } from '../pages/Home';
import { Login } from '../pages/Login';
import { Signup } from '../pages/Signup';
import { Events } from '../pages/Events';
import { EventDetails } from '../pages/EventDetails';
import { Calendar } from '../pages/Calendar';
import { StudentDashboard } from '../pages/StudentDashboard';
import { Profile } from '../pages/Profile';
import { Notifications } from '../pages/Notifications';
import { AdminDashboard } from '../pages/AdminDashboard';
import { ManageEvents } from '../pages/ManageEvents';
import { Attendance } from '../pages/Attendance';
import { EventReports } from '../pages/EventReports';

export function AppRoutes() {
  return (
    <Routes>
      {/* Public & Student Portal Layout */}
      <Route element={<StudentLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/events" element={<Events />} />
        <Route path="/events/:id" element={<EventDetails />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <StudentDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <Notifications />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Authentication Layout */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
      </Route>

      {/* Organizer / Admin Workspace Layout */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="events" element={<ManageEvents />} />
        <Route path="attendance" element={<Attendance />} />
        <Route path="reports" element={<EventReports />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { UserRole } from '../types/models';
import { useAuth } from '../hooks/useAuth';
import { Card } from '../components/Card';
import { Button } from '../components/Button';

export interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, isAuthenticated, switchDemoRole } = useAuth();
  const location = useLocation();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    const requiredRole = allowedRoles[0];
    return (
      <div className="mx-auto max-w-xl px-4 py-16">
        <Card className="text-center" padding="lg">
          <h2 className="text-xl font-bold text-text-primary font-serif">
            Organizer / Administrator Access Required
          </h2>
          <p className="mt-2 text-sm text-text-secondary">
            You are currently signed in as <strong>{user.name}</strong> ({user.role}). Switch to an
            Organizer / Administrator account to manage USC events, attendance check-ins, and
            reports.
          </p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <Button
              variant="primary"
              onClick={() => switchDemoRole(requiredRole)}
            >
              Switch to {requiredRole === 'admin' ? 'Organizer / Admin' : 'Student'} Role
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}

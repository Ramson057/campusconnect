import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GraduationCap, ShieldCheck } from 'lucide-react';
import { UserRole } from '../types/models';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { validateLoginForm } from '../utils/validators';
import { Card } from '../components/Card';
import { Input } from '../components/Input';
import { Button } from '../components/Button';

export function Login() {
  const { login, isLoading } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [role, setRole] = useState<UserRole>('student');
  const [email, setEmail] = useState('25102710@usc.edu.ph');
  const [password, setPassword] = useState('carolinian2026');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleRoleSwitch = (nextRole: UserRole) => {
    setRole(nextRole);
    setErrors({});
    if (nextRole === 'admin') {
      setEmail('osa.events@usc.edu.ph');
    } else {
      setEmail('25102710@usc.edu.ph');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateLoginForm(email, password);
    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }

    setErrors({});
    try {
      const loggedInUser = await login({ email, password, role });
      showToast(
        `Welcome back, ${loggedInUser.name}!`,
        'success',
        `Signed in as ${loggedInUser.role === 'admin' ? 'Organizer / Administrator' : 'Student'}.`
      );
      navigate(loggedInUser.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : 'Unable to sign in.',
        'error'
      );
    }
  };

  return (
    <div className="w-full max-w-md">
      <Card padding="lg">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-text-primary font-serif">
            Sign In to CampusConnect
          </h1>
          <p className="mt-1 text-xs text-text-secondary">
            Use your University of San Carlos account credentials
          </p>
        </div>

        {/* Role Selector */}
        <div className="mb-6">
          <p className="block text-xs font-semibold text-text-primary mb-2">
            Select Portal Role
          </p>
          <div className="grid grid-cols-2 gap-2 p-1 rounded-lg bg-surface-gray border border-surface-border">
            <button
              type="button"
              onClick={() => handleRoleSwitch('student')}
              className={`flex items-center justify-center gap-2 rounded-md py-2 px-3 text-xs font-semibold transition-colors cursor-pointer ${
                role === 'student'
                  ? 'bg-usc-green text-surface-white shadow-xs'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>Student</span>
            </button>
            <button
              type="button"
              onClick={() => handleRoleSwitch('admin')}
              className={`flex items-center justify-center gap-2 rounded-md py-2 px-3 text-xs font-semibold transition-colors cursor-pointer ${
                role === 'admin'
                  ? 'bg-usc-green text-surface-white shadow-xs'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Organizer / Admin</span>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <Input
            label="USC Institutional Email"
            type="email"
            placeholder={role === 'admin' ? 'osa.events@usc.edu.ph' : '25102710@usc.edu.ph'}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
          />

          <Input
            label="Password"
            type="password"
            placeholder="Enter at least 6 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
          />

          <Button type="submit" variant="primary" fullWidth disabled={isLoading}>
            {isLoading
              ? 'Signing in...'
              : `Sign In as ${role === 'admin' ? 'Organizer / Admin' : 'Student'}`}
          </Button>
        </form>

        <p className="mt-6 text-center text-xs text-text-secondary">
          Don’t have a CampusConnect account yet?{' '}
          <Link to="/signup" className="font-semibold text-usc-green hover:text-usc-green-dark">
            Create an Account
          </Link>
        </p>
      </Card>
    </div>
  );
}

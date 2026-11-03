import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GraduationCap, ShieldCheck } from 'lucide-react';
import { UserRole } from '../types/models';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { validateSignupForm } from '../utils/validators';
import { USC_COURSES, YEAR_LEVELS } from '../utils/constants';
import { Card } from '../components/Card';
import { Input } from '../components/Input';
import { Select } from '../components/Select';
import { Button } from '../components/Button';

export function Signup() {
  const { register, isLoading } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [role, setRole] = useState<UserRole>('student');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [studentId, setStudentId] = useState('');
  const [password, setPassword] = useState('');
  const [course, setCourse] = useState(USC_COURSES[0]);
  const [yearLevel, setYearLevel] = useState(YEAR_LEVELS[2]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateSignupForm({
      name,
      email,
      studentId,
      password,
      role,
      course,
      yearLevel,
    });

    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }

    setErrors({});
    try {
      const user = await register({
        name,
        email,
        studentId,
        password,
        role,
        course,
        yearLevel,
      });
      showToast(
        'Carolinian Account Created!',
        'success',
        `Welcome to CampusConnect, ${user.name}.`
      );
      navigate(user.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : 'Registration failed.',
        'error'
      );
    }
  };

  return (
    <div className="w-full max-w-lg">
      <Card padding="lg">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-text-primary font-serif">
            Create Your CampusConnect Account
          </h1>
          <p className="mt-1 text-xs text-text-secondary">
            Register as a USC Student or Accredited Organization Officer
          </p>
        </div>

        {/* Role Selector */}
        <div className="mb-5">
          <p className="block text-xs font-semibold text-text-primary mb-2">
            Account Role
          </p>
          <div className="grid grid-cols-2 gap-2 p-1 rounded-lg bg-surface-gray border border-surface-border">
            <button
              type="button"
              onClick={() => setRole('student')}
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
              onClick={() => setRole('admin')}
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
            label="Full Name"
            placeholder="e.g. Maria Clara Santos"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={errors.name}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="USC Institutional Email"
              type="email"
              placeholder="25109921@usc.edu.ph"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
            />
            <Input
              label={role === 'admin' ? 'Employee / Org Officer ID' : 'USC Student ID Number'}
              placeholder="e.g. 25109921"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              error={errors.studentId}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label={role === 'admin' ? 'Primary Department / Program' : 'Degree Program'}
              value={course}
              onChange={(e) => setCourse(e.target.value)}
              options={USC_COURSES.map((c) => ({ value: c, label: c }))}
              error={errors.course}
            />
            <Select
              label="Year Level / Standing"
              value={yearLevel}
              onChange={(e) => setYearLevel(e.target.value)}
              options={YEAR_LEVELS.map((y) => ({ value: y, label: y }))}
            />
          </div>

          <Input
            label="Password"
            type="password"
            placeholder="Create a password (min. 6 characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
          />

          <Button type="submit" variant="primary" fullWidth disabled={isLoading}>
            {isLoading ? 'Creating Account...' : 'Complete Registration'}
          </Button>
        </form>

        <p className="mt-6 text-center text-xs text-text-secondary">
          Already registered?{' '}
          <Link to="/login" className="font-semibold text-usc-green hover:text-usc-green-dark">
            Sign In
          </Link>
        </p>
      </Card>
    </div>
  );
}

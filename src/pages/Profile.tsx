import React, { useState } from 'react';
import { Camera, Check, Shield } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { isValidEmail } from '../utils/validators';
import { USC_COURSES, USC_ORGANIZATIONS, YEAR_LEVELS } from '../utils/constants';
import { Card } from '../components/Card';
import { Input } from '../components/Input';
import { Select } from '../components/Select';
import { Button } from '../components/Button';

export function Profile() {
  const { user, updateCurrentUser } = useAuth();
  const { showToast } = useToast();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [studentId, setStudentId] = useState(user?.studentId || '');
  const [course, setCourse] = useState(user?.course || USC_COURSES[0]);
  const [yearLevel, setYearLevel] = useState(user?.yearLevel || YEAR_LEVELS[2]);
  const [organizations, setOrganizations] = useState<string[]>(user?.organizations || []);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!user) return null;

  const toggleOrganization = (org: string) => {
    setOrganizations((prev) =>
      prev.includes(org) ? prev.filter((o) => o !== org) : [...prev, org]
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors: Record<string, string> = {};
    if (!name.trim() || name.trim().length < 2) {
      nextErrors.name = 'Full name is required.';
    }
    if (!isValidEmail(email)) {
      nextErrors.email = 'Valid USC institutional email is required.';
    }
    if (!studentId.trim()) {
      nextErrors.studentId = 'USC ID number is required.';
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    setSaving(true);
    try {
      await updateCurrentUser({
        name: name.trim(),
        email: email.trim(),
        studentId: studentId.trim(),
        course,
        yearLevel,
        organizations,
      });
      showToast('Profile Updated', 'success', 'Your Carolinian academic record has been saved.');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to update profile.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <p className="text-xs font-semibold text-usc-green-dark">Account & Academic Identity</p>
        <h1 className="text-3xl font-bold text-text-primary font-serif">
          Carolinian User Profile
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          Manage your student credentials, degree program, and accredited USC organization
          memberships.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Photo Placeholder & Identity Summary */}
        <div className="md:col-span-4">
          <Card padding="lg" className="text-center">
            <div className="relative mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-usc-green text-surface-white text-3xl font-serif font-bold border-4 border-usc-gold">
              {name.charAt(0) || 'U'}
              <span
                title="Profile photo placeholder"
                className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full bg-surface-white text-usc-green-dark border border-surface-border shadow-xs"
              >
                <Camera className="w-3.5 h-3.5" />
              </span>
            </div>

            <h2 className="mt-4 text-lg font-bold text-text-primary font-serif">{name}</h2>
            <p className="text-xs text-text-secondary">{email}</p>
            <p className="mt-2 inline-flex items-center gap-1 rounded-md bg-usc-green-light px-2.5 py-1 text-xs font-semibold text-usc-green-dark">
              <Shield className="w-3.5 h-3.5" />
              {user.role === 'admin' ? 'Organizer / Admin' : `Student · ${studentId}`}
            </p>
          </Card>
        </div>

        {/* Editable Form */}
        <div className="md:col-span-8">
          <Card padding="lg">
            <form onSubmit={handleSave} noValidate className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  error={errors.name}
                />
                <Input
                  label="USC ID Number"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  error={errors.studentId}
                />
              </div>

              <Input
                label="Institutional Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={errors.email}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select
                  label="Course / Degree Program"
                  value={course}
                  onChange={(e) => setCourse(e.target.value)}
                  options={USC_COURSES.map((c) => ({ value: c, label: c }))}
                />
                <Select
                  label="Year Level"
                  value={yearLevel}
                  onChange={(e) => setYearLevel(e.target.value)}
                  options={YEAR_LEVELS.map((y) => ({ value: y, label: y }))}
                />
              </div>

              <div>
                <p className="block text-xs font-semibold text-text-primary mb-2">
                  Accredited Organization Memberships ({organizations.length} selected)
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {USC_ORGANIZATIONS.map((org) => {
                    const active = organizations.includes(org);
                    return (
                      <button
                        key={org}
                        type="button"
                        onClick={() => toggleOrganization(org)}
                        className={`flex items-center justify-between gap-2 rounded-lg border px-3 py-2 text-left text-xs transition-colors cursor-pointer ${
                          active
                            ? 'border-usc-green bg-usc-green-light text-usc-green-dark font-semibold'
                            : 'border-surface-border bg-surface-white text-text-secondary hover:bg-surface-gray'
                        }`}
                      >
                        <span className="truncate">{org}</span>
                        {active && <Check className="w-3.5 h-3.5 shrink-0 text-usc-green" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <Button type="submit" variant="primary" disabled={saving}>
                  {saving ? 'Saving Changes...' : 'Save Profile Changes'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}

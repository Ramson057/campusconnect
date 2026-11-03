import test from 'node:test';
import assert from 'node:assert/strict';
import {
  computeEventStatus,
  getSpotsRemaining,
  getCapacityPercentage,
  calculateAttendanceRate,
  canUserRegister,
  filterEventsList,
} from './eventRules';
import { validateLoginForm, validateSignupForm, validateEventForm } from './validators';
import { buildCalendarMonthGrid } from './dateUtils';
import { EventItem } from '../types/models';

test('computeEventStatus marks past events as ended and full events as full', () => {
  assert.equal(computeEventStatus('2026-10-15', 40, 100, '2026-11-02'), 'ended');
  assert.equal(computeEventStatus('2026-11-15', 100, 100, '2026-11-02'), 'full');
  assert.equal(computeEventStatus('2026-11-15', 45, 100, '2026-11-02'), 'open');
});

test('getSpotsRemaining and getCapacityPercentage compute accurate metrics', () => {
  assert.equal(getSpotsRemaining({ capacity: 100, registeredCount: 45 }), 55);
  assert.equal(getSpotsRemaining({ capacity: 50, registeredCount: 55 }), 0);
  assert.equal(getCapacityPercentage({ capacity: 200, registeredCount: 150 }), 75);
  assert.equal(calculateAttendanceRate(84, 100), 84);
  assert.equal(calculateAttendanceRate(0, 0), 0);
});

test('canUserRegister blocks full, ended, and duplicate registrations', () => {
  assert.deepEqual(
    canUserRegister({ status: 'open', capacity: 100, registeredCount: 45 }, false),
    { allowed: true }
  );
  assert.deepEqual(
    canUserRegister({ status: 'full', capacity: 100, registeredCount: 100 }, false),
    { allowed: false, reason: 'Event Full' }
  );
  assert.deepEqual(
    canUserRegister({ status: 'ended', capacity: 100, registeredCount: 60 }, false),
    { allowed: false, reason: 'Event Ended' }
  );
  assert.deepEqual(
    canUserRegister({ status: 'open', capacity: 100, registeredCount: 45 }, true),
    { allowed: false, reason: 'Already registered' }
  );
});

test('filterEventsList filters by search, category, campus, and status', () => {
  const sampleEvents: EventItem[] = [
    {
      id: 'evt-1',
      title: 'USC Engineering Week 2026',
      description: 'Annual robotics and engineering showcase',
      date: '2026-11-12',
      startTime: '08:00',
      endTime: '17:00',
      venue: 'Bunzel Atrium',
      campus: 'Talamban Campus (TC)',
      category: 'Engineering & Tech',
      organizer: 'Collegiate Engineering Council (CEC)',
      organizerId: 'usr-admin-1',
      capacity: 150,
      registeredCount: 95,
      checkedInCount: 0,
      isFeatured: true,
      status: 'open',
      imageUrl: '/test.jpg',
      createdAt: '2026-10-01T08:00:00Z',
      updatedAt: '2026-10-01T08:00:00Z',
    },
    {
      id: 'evt-2',
      title: 'Carolinian Career Fair',
      description: 'Corporate networking at Main Campus',
      date: '2026-11-18',
      startTime: '09:00',
      endTime: '16:00',
      venue: 'Wrocklage Yard',
      campus: 'Downtown Campus (Main)',
      category: 'Career & Networking',
      organizer: 'USC Career & Placement Office',
      organizerId: 'usr-admin-1',
      capacity: 100,
      registeredCount: 100,
      checkedInCount: 0,
      isFeatured: false,
      status: 'full',
      imageUrl: '/test2.jpg',
      createdAt: '2026-10-01T08:00:00Z',
      updatedAt: '2026-10-01T08:00:00Z',
    },
  ];

  assert.equal(filterEventsList(sampleEvents, { search: 'robotics' }).length, 1);
  assert.equal(filterEventsList(sampleEvents, { campus: 'Downtown Campus (Main)' }).length, 1);
  assert.equal(filterEventsList(sampleEvents, { status: 'full' }).length, 1);
  assert.equal(filterEventsList(sampleEvents, { category: 'Sports & Intramurals' }).length, 0);
});

test('validators reject empty inputs and accept valid USC payloads', () => {
  const badLogin = validateLoginForm('not-an-email', '123');
  assert.equal(badLogin.valid, false);
  assert.ok(badLogin.errors.email);
  assert.ok(badLogin.errors.password);

  const goodLogin = validateLoginForm('25102710@usc.edu.ph', 'carolinian2026');
  assert.equal(goodLogin.valid, true);

  const badEvent = validateEventForm({
    title: 'Hi',
    description: 'Too short',
    date: '',
    startTime: '',
    endTime: '',
    venue: '',
    campus: 'Talamban Campus (TC)',
    category: 'Engineering & Tech',
    organizer: '',
    capacity: 2,
  });
  assert.equal(badEvent.valid, false);

  const goodSignup = validateSignupForm({
    name: 'Maria Clara Santos',
    email: '25102710@usc.edu.ph',
    studentId: '25102710',
    password: 'password123',
    role: 'student',
    course: 'BS Computer Science',
    yearLevel: '3rd Year',
  });
  assert.equal(goodSignup.valid, true);
});

test('buildCalendarMonthGrid produces valid 35 or 42 day grid', () => {
  const november2026 = buildCalendarMonthGrid(2026, 10); // 10 = November
  assert.equal(november2026.length, 35);
  assert.equal(november2026[0].dateStr, '2026-11-01');
  assert.equal(november2026[0].isCurrentMonth, true);
});

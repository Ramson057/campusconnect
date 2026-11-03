/**
 * Form validation helpers for CampusConnect.
 * Never silently substitutes fallback values when required inputs are empty or invalid.
 */

export interface ValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}

export function isValidEmail(email: string): boolean {
  const trimmed = email.trim();
  if (!trimmed) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
}

export function validateLoginForm(email: string, password: string): ValidationResult {
  const errors: Record<string, string> = {};
  if (!email.trim()) {
    errors.email = 'Email address is required.';
  } else if (!isValidEmail(email)) {
    errors.email = 'Enter a valid USC or institutional email address.';
  }

  if (!password || password.trim().length === 0) {
    errors.password = 'Password is required.';
  } else if (password.trim().length < 6) {
    errors.password = 'Password must be at least 6 characters.';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

export interface SignupFormInput {
  name: string;
  email: string;
  studentId: string;
  password: string;
  role: 'student' | 'admin';
  course: string;
  yearLevel: string;
}

export function validateSignupForm(input: SignupFormInput): ValidationResult {
  const errors: Record<string, string> = {};

  if (!input.name.trim() || input.name.trim().length < 2) {
    errors.name = 'Full name is required (minimum 2 characters).';
  }

  if (!input.email.trim()) {
    errors.email = 'Institutional email is required.';
  } else if (!isValidEmail(input.email)) {
    errors.email = 'Please enter a valid email (e.g. 25102710@usc.edu.ph).';
  }

  if (!input.studentId.trim() || input.studentId.trim().length < 5) {
    errors.studentId = 'Valid USC ID number is required (e.g. 25102710).';
  }

  if (!input.password || input.password.length < 6) {
    errors.password = 'Password must be at least 6 characters long.';
  }

  if (!input.course.trim()) {
    errors.course = 'Please select your degree program or department.';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

export interface EventFormInput {
  title: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  venue: string;
  campus: string;
  category: string;
  organizer: string;
  capacity: number;
}

export function validateEventForm(input: EventFormInput): ValidationResult {
  const errors: Record<string, string> = {};

  if (!input.title.trim() || input.title.trim().length < 4) {
    errors.title = 'Event title must be at least 4 characters.';
  }
  if (!input.description.trim() || input.description.trim().length < 15) {
    errors.description = 'Provide a descriptive summary (at least 15 characters).';
  }
  if (!input.date.trim()) {
    errors.date = 'Event date is required.';
  }
  if (!input.startTime.trim()) {
    errors.startTime = 'Start time is required.';
  }
  if (!input.endTime.trim()) {
    errors.endTime = 'End time is required.';
  }
  if (!input.venue.trim()) {
    errors.venue = 'Specific venue or hall is required.';
  }
  if (!input.organizer.trim()) {
    errors.organizer = 'Organizing body is required.';
  }
  if (!Number.isFinite(input.capacity) || input.capacity < 5 || input.capacity > 10000) {
    errors.capacity = 'Capacity must be between 5 and 10,000 seats.';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

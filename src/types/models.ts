/**
 * Consistent backend-friendly data models for CampusConnect (University of San Carlos).
 * All models use camelCase properties and ISO-8601 timestamps (createdAt, updatedAt).
 */

export type UserRole = 'student' | 'admin';

export type EventStatus = 'open' | 'full' | 'ended' | 'upcoming';

export type EventCategory =
  | 'Academic & Symposium'
  | 'Engineering & Tech'
  | 'Sports & Intramurals'
  | 'Career & Networking'
  | 'Organization & Culture'
  | 'Community & Outreach';

export type CampusLocation =
  | 'Talamban Campus (TC)'
  | 'Downtown Campus (Main)'
  | 'North Campus'
  | 'South Campus'
  | 'Montessori Academy';

export interface User {
  id: string;
  name: string;
  email: string;
  studentId: string;
  role: UserRole;
  course: string;
  yearLevel: string;
  department: string;
  organizations: string[];
  avatarUrl?: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface EventItem {
  id: string;
  title: string;
  description: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  venue: string;
  campus: CampusLocation;
  category: EventCategory;
  organizer: string;
  organizerId: string;
  capacity: number;
  registeredCount: number;
  checkedInCount: number;
  isFeatured: boolean;
  status: EventStatus;
  imageUrl: string;
  createdAt: string;
  updatedAt: string;
}

export interface Registration {
  id: string;
  eventId: string;
  userId: string;
  userName: string;
  userEmail: string;
  studentId: string;
  course: string;
  yearLevel: string;
  ticketCode: string;
  status: 'registered' | 'cancelled';
  registeredAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface AttendanceRecord {
  id: string;
  eventId: string;
  registrationId: string;
  userId: string;
  userName: string;
  userEmail: string;
  studentId: string;
  course: string;
  ticketCode: string;
  checkedIn: boolean;
  checkedInAt: string | null;
  checkedInBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  eventId?: string;
  eventTitle?: string;
  senderName: string;
  senderOrganization: string;
  recipientRole: 'all' | 'student' | 'admin';
  isRead: boolean;
  type: 'announcement' | 'registration' | 'reminder' | 'alert';
  createdAt: string;
  updatedAt: string;
}

export interface EventReportSummary {
  eventId: string;
  eventTitle: string;
  organizer: string;
  category: EventCategory;
  date: string;
  venue: string;
  capacity: number;
  registeredCount: number;
  attendedCount: number;
  attendanceRate: number; // 0 to 100
  status: EventStatus;
}

export interface DashboardMetrics {
  totalEvents: number;
  totalRegistrations: number;
  overallAttendanceRate: number;
  activeUsers: number;
  registrationsTrend: Array<{
    month: string;
    registrations: number;
    attendance: number;
  }>;
  popularEvents: Array<{
    name: string;
    registered: number;
    capacity: number;
    attended: number;
  }>;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface EventFilterParams extends PaginationParams {
  search?: string;
  category?: string;
  campus?: string;
  organizer?: string;
  date?: string;
  status?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

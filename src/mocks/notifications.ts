import { NotificationItem } from '../types/models';

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-301',
    title: 'Registration Confirmed: USC Engineering Week 2026',
    message:
      'Your seat at the Lawrence Bunzel Atrium is reserved. Present your ticket code USC-ENG-2510 or USC ID at the registration desk by 8:15 AM.',
    eventId: 'evt-usc-eng-week',
    eventTitle: 'USC Engineering Week 2026: Tech & Robotics Expo',
    senderName: 'Engr. Clarissa Villareal',
    senderOrganization: 'Collegiate Engineering Council (CEC)',
    recipientRole: 'all',
    isRead: false,
    type: 'registration',
    createdAt: '2026-11-02T07:30:00Z',
    updatedAt: '2026-11-02T07:30:00Z',
  },
  {
    id: 'notif-302',
    title: 'Shuttle Advisory for USC Days & Intramurals Opening',
    message:
      'Additional campus shuttles will run every 15 minutes from Main Gate to the Talamban Sports Complex starting at 6:30 AM on November 18.',
    eventId: 'evt-usc-days-intramurals',
    eventTitle: 'USC Days & University Intramurals 2026 Opening',
    senderName: 'USC Athletics Director',
    senderOrganization: 'USC Athletics & Recreation Office',
    recipientRole: 'all',
    isRead: false,
    type: 'announcement',
    createdAt: '2026-11-01T16:45:00Z',
    updatedAt: '2026-11-01T16:45:00Z',
  },
  {
    id: 'notif-303',
    title: 'Capacity Alert: Carolinian Career & Internship Fair Full',
    message:
      'All 100 slots for the Downtown Campus Career Fair have been filled. Walk-in waitlists will open at 1:30 PM at Arthur Dingman Hall.',
    eventId: 'evt-usc-career-fair',
    eventTitle: 'Carolinian Career & Internship Fair 2026',
    senderName: 'Career Placement Coordinator',
    senderOrganization: 'USC Career & Placement Office',
    recipientRole: 'all',
    isRead: true,
    type: 'alert',
    createdAt: '2026-10-31T14:15:00Z',
    updatedAt: '2026-10-31T18:00:00Z',
  },
  {
    id: 'notif-304',
    title: 'Certificate of Attendance Ready: JPIA Tax Reform Forum',
    message:
      'Your attendance at the JPIA Carolinian Financial Literacy & Tax Reform Forum has been verified. CES points have been credited to your student ledger.',
    eventId: 'evt-jpia-tax-forum',
    eventTitle: 'JPIA Carolinian Financial Literacy & Tax Reform Forum',
    senderName: 'JPIA-USC Secretariat',
    senderOrganization: 'Junior Philippine Institute of Accountants (JPIA-USC)',
    recipientRole: 'student',
    isRead: true,
    type: 'reminder',
    createdAt: '2026-10-20T10:00:00Z',
    updatedAt: '2026-10-20T12:00:00Z',
  },
];

# CampusConnect — Backend REST API Contract

This document specifies all HTTP endpoints, request payloads, query parameters, and response schemas expected by the `src/services/*` layer of **CampusConnect** (University of San Carlos).

When the backend is ready:
1. Set `VITE_API_BASE_URL` in `.env` (default `http://localhost:8080/api/v1`).
2. Set `VITE_USE_MOCK_API="false"` in `.env` or toggle `USE_MOCK_API = false` in `src/config/env.ts`.
3. No UI components or pages need to change—only `src/services/*` communicates with the API.

---

## Authentication Headers

All protected endpoints expect a standard JWT Bearer header:
```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

---

## 1. Authentication & Users (`src/services/authService.ts`)

### `POST /api/v1/auth/login`
Authenticates a USC student or organizer/administrator.
- **Request Body**:
```json
{
  "email": "25102710@usc.edu.ph",
  "password": "carolinian2026",
  "role": "student"
}
```
- **Response (`200 OK`)**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5c...",
  "user": {
    "id": "usr-student-1",
    "name": "Mateo Lorenzo",
    "email": "25102710@usc.edu.ph",
    "studentId": "25102710",
    "role": "student",
    "course": "BS Computer Science",
    "yearLevel": "3rd Year",
    "department": "School of Arts and Sciences",
    "organizations": ["Computer Driven Enthusiasts (CoDE)"],
    "status": "active",
    "createdAt": "2026-08-10T08:00:00Z",
    "updatedAt": "2026-10-28T14:30:00Z"
  }
}
```

### `POST /api/v1/auth/register`
Registers a new Student or Organizer account.
- **Request Body**:
```json
{
  "name": "Maria Clara Santos",
  "email": "25109921@usc.edu.ph",
  "studentId": "25109921",
  "password": "securePassword123",
  "role": "student",
  "course": "BS Computer Science",
  "yearLevel": "3rd Year"
}
```
- **Response (`201 Created`)**: `{ "token": "string", "user": User }`

### `PUT /api/v1/users/:id`
Updates user profile fields and organization memberships.
- **Request Body**: `Partial<User>`
- **Response (`200 OK`)**: `User`

### `GET /api/v1/users?page=1&limit=20`
Lists users for the Admin Dashboard.
- **Response (`200 OK`)**: `PaginatedResponse<User>`

---

## 2. Events (`src/services/eventService.ts`)

### `GET /api/v1/events`
Returns paginated and filtered campus events.
- **Query Params**: `page`, `limit`, `search`, `category`, `campus`, `organizer`, `date`, `status`
- **Response (`200 OK`)**:
```json
{
  "data": [
    {
      "id": "evt-usc-eng-week",
      "title": "USC Engineering Week 2026: Tech & Robotics Expo",
      "description": "Full event description...",
      "date": "2026-11-12",
      "startTime": "08:30",
      "endTime": "17:00",
      "venue": "Lawrence Bunzel Building Atrium",
      "campus": "Talamban Campus (TC)",
      "category": "Engineering & Tech",
      "organizer": "Collegiate Engineering Council (CEC)",
      "organizerId": "usr-admin-1",
      "capacity": 120,
      "registeredCount": 84,
      "checkedInCount": 42,
      "isFeatured": true,
      "status": "open",
      "imageUrl": "/assets/event.jpg",
      "createdAt": "2026-10-05T08:00:00Z",
      "updatedAt": "2026-10-29T10:00:00Z"
    }
  ],
  "total": 7,
  "page": 1,
  "limit": 6,
  "totalPages": 2
}
```

### `GET /api/v1/events/:id`
- **Response (`200 OK`)**: `EventItem`

### `POST /api/v1/events`
Creates a new event (Admin/Organizer role required).
- **Request Body**: `CreateEventPayload`
- **Response (`201 Created`)**: `EventItem`

### `PUT /api/v1/events/:id`
Updates an existing event.
- **Request Body**: `Partial<EventItem>`
- **Response (`200 OK`)**: `EventItem`

### `DELETE /api/v1/events/:id`
Deletes an event.
- **Response (`200 OK`)**: `{ "success": true, "id": "evt-usc-eng-week" }`

---

## 3. Registrations (`src/services/registrationService.ts`)

### `GET /api/v1/registrations/user/:userId`
Returns all active event registrations for a student.
- **Response (`200 OK`)**: `Registration[]`

### `GET /api/v1/events/:eventId/registrations`
Returns all registrations for a specific event.
- **Response (`200 OK`)**: `Registration[]`

### `POST /api/v1/events/:eventId/register`
Registers a student for an open event and generates a `ticketCode` (e.g., `USC-ENG-2510`).
- **Request Body**:
```json
{
  "userId": "usr-student-1",
  "userName": "Mateo Lorenzo",
  "userEmail": "25102710@usc.edu.ph",
  "studentId": "25102710",
  "course": "BS Computer Science",
  "yearLevel": "3rd Year"
}
```
- **Response (`201 Created`)**: `Registration`

### `DELETE /api/v1/events/:eventId/register/:userId`
Cancels a student's registration and decrements `registeredCount`.
- **Response (`200 OK`)**: `{ "success": true }`

---

## 4. Attendance & Check-In (`src/services/attendanceService.ts`)

### `GET /api/v1/events/:eventId/attendance`
Fetches the attendee roster and check-in statuses for an event.
- **Response (`200 OK`)**: `AttendanceRecord[]`

### `PATCH /api/v1/attendance/:attendanceId/toggle`
Toggles a student's check-in state (`checkedIn: boolean`).
- **Request Body**: `{ "checkedIn": true, "verifierName": "Engr. Clarissa Villareal" }`
- **Response (`200 OK`)**: `AttendanceRecord`

### `POST /api/v1/events/:eventId/checkin-code`
Checks in an attendee using their `ticketCode` (e.g., `USC-ENG-8841`) or `studentId` (`26108841`).
- **Request Body**: `{ "codeOrStudentId": "USC-ENG-8841", "verifierName": "Engr. Clarissa Villareal" }`
- **Response (`200 OK`)**: `AttendanceRecord`

---

## 5. Notifications & Announcements (`src/services/notificationService.ts`)

### `GET /api/v1/notifications`
- **Response (`200 OK`)**: `NotificationItem[]`

### `PATCH /api/v1/notifications/:id/read`
- **Response (`200 OK`)**: `NotificationItem`

### `PATCH /api/v1/notifications/read-all`
- **Response (`200 OK`)**: `{ "success": true }`

### `POST /api/v1/notifications/announcements`
Broadcasts an organizer announcement to students.
- **Request Body**:
```json
{
  "title": "Shuttle Advisory for USC Days",
  "message": "Shuttles depart Main Gate every 15 minutes.",
  "eventId": "evt-usc-days-intramurals",
  "eventTitle": "USC Days & University Intramurals 2026 Opening",
  "senderName": "Engr. Clarissa Villareal",
  "senderOrganization": "USC Athletics & Recreation Office"
}
```
- **Response (`201 Created`)**: `NotificationItem`

---

## 6. Analytics & Reports (`src/services/reportService.ts`)

### `GET /api/v1/reports/dashboard`
Returns aggregate counts (`totalEvents`, `totalRegistrations`, `overallAttendanceRate`, `activeUsers`) and chart series (`registrationsTrend`, `popularEvents`).
- **Response (`200 OK`)**: `DashboardMetrics`

### `GET /api/v1/reports/events`
Returns per-event capacity, registration, and attendance rate summaries.
- **Response (`200 OK`)**: `EventReportSummary[]`

### `GET /api/v1/reports/events/:eventId/export?format=csv|pdf`
Exports the attendee report for an event.
- **Response (`200 OK`)**: `{ "filename": "string", "content": "string", "rowCount": 4 }`

-- ============================================================================
-- CampusConnect — University of San Carlos Event & Attendance Platform
-- Supabase (PostgreSQL) Schema, Row-Level Security Policies & Seed Data
--
-- HOW TO RUN IN SUPABASE:
-- 1. Open your project in https://supabase.com/dashboard
-- 2. Click "SQL Editor" in the left sidebar -> click "+ New query"
-- 3. Paste this entire file and click "Run" (or Ctrl+Enter / Cmd+Enter)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. USERS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  student_id TEXT NOT NULL,
  password_hash TEXT NOT NULL DEFAULT 'carolinian2026',
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'admin')),
  course TEXT NOT NULL,
  year_level TEXT NOT NULL,
  department TEXT NOT NULL,
  organizations_json JSONB NOT NULL DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_role ON public.users (role);
CREATE INDEX IF NOT EXISTS idx_users_student_id ON public.users (student_id);

-- ----------------------------------------------------------------------------
-- 2. EVENTS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.events (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  date TEXT NOT NULL, -- YYYY-MM-DD
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  venue TEXT NOT NULL,
  campus TEXT NOT NULL,
  category TEXT NOT NULL,
  organizer TEXT NOT NULL,
  organizer_id TEXT NOT NULL,
  capacity INTEGER NOT NULL DEFAULT 100,
  registered_count INTEGER NOT NULL DEFAULT 0,
  checked_in_count INTEGER NOT NULL DEFAULT 0,
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'full', 'ended', 'upcoming')),
  image_url TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_events_date ON public.events (date);
CREATE INDEX IF NOT EXISTS idx_events_category ON public.events (category);
CREATE INDEX IF NOT EXISTS idx_events_campus ON public.events (campus);
CREATE INDEX IF NOT EXISTS idx_events_status ON public.events (status);

-- ----------------------------------------------------------------------------
-- 3. REGISTRATIONS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.registrations (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  user_email TEXT NOT NULL,
  student_id TEXT NOT NULL,
  course TEXT NOT NULL,
  year_level TEXT NOT NULL,
  ticket_code TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'registered' CHECK (status IN ('registered', 'cancelled')),
  registered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_event_user UNIQUE (event_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_reg_user ON public.registrations (user_id);
CREATE INDEX IF NOT EXISTS idx_reg_event ON public.registrations (event_id);

-- ----------------------------------------------------------------------------
-- 4. ATTENDANCE TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.attendance (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  registration_id TEXT NOT NULL REFERENCES public.registrations(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  user_email TEXT NOT NULL,
  student_id TEXT NOT NULL,
  course TEXT NOT NULL,
  ticket_code TEXT NOT NULL,
  checked_in BOOLEAN NOT NULL DEFAULT FALSE,
  checked_in_at TIMESTAMPTZ NULL,
  checked_in_by TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_att_event ON public.attendance (event_id);
CREATE INDEX IF NOT EXISTS idx_att_ticket ON public.attendance (ticket_code);

-- ----------------------------------------------------------------------------
-- 5. NOTIFICATIONS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.notifications (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  event_id TEXT NULL,
  event_title TEXT NULL,
  sender_name TEXT NOT NULL,
  sender_organization TEXT NOT NULL,
  recipient_role TEXT NOT NULL DEFAULT 'all' CHECK (recipient_role IN ('all', 'student', 'admin')),
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  type TEXT NOT NULL DEFAULT 'announcement' CHECK (type IN ('announcement', 'registration', 'reminder', 'alert')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES FOR SUPABASE API ACCESS
-- ============================================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public access to users" ON public.users;
CREATE POLICY "Allow public access to users" ON public.users FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public access to events" ON public.events;
CREATE POLICY "Allow public access to events" ON public.events FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public access to registrations" ON public.registrations;
CREATE POLICY "Allow public access to registrations" ON public.registrations FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public access to attendance" ON public.attendance;
CREATE POLICY "Allow public access to attendance" ON public.attendance FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public access to notifications" ON public.notifications;
CREATE POLICY "Allow public access to notifications" ON public.notifications FOR ALL USING (true) WITH CHECK (true);

-- ============================================================================
-- SEED DATA (University of San Carlos — CampusConnect)
-- ============================================================================

INSERT INTO public.users (id, name, email, student_id, password_hash, role, course, year_level, department, organizations_json, status)
VALUES
  ('usr-student-1', 'Mateo Lorenzo', '25102710@usc.edu.ph', '25102710', 'carolinian2026', 'student', 'BS Computer Science', '3rd Year', 'School of Arts and Sciences — DCISM', '["Computer Driven Enthusiasts (CoDE)", "USC Supreme Student Council (SSC)"]'::jsonb, 'active'),
  ('usr-admin-1', 'Engr. Clarissa Villareal', 'osa.events@usc.edu.ph', 'ADM-00184', 'carolinian2026', 'admin', 'Office of Student Affairs & Organization Council', 'Administrator / Adviser', 'Office of Student Affairs (OSA)', '["USC Supreme Student Council (SSC)", "Collegiate Engineering Council (CEC)"]'::jsonb, 'active'),
  ('usr-student-2', 'Hannah Beatrice Lim', '24103912@usc.edu.ph', '24103912', 'carolinian2026', 'student', 'BS Civil Engineering', '4th Year', 'School of Engineering', '["Collegiate Engineering Council (CEC)"]'::jsonb, 'active'),
  ('usr-student-3', 'Rafael Miguel Mendoza', '26108841@usc.edu.ph', '26108841', 'carolinian2026', 'student', 'BS Accountancy', '2nd Year', 'School of Business and Economics', '["Junior Philippine Institute of Accountants (JPIA-USC)"]'::jsonb, 'active'),
  ('usr-student-4', 'Sofia Isabelle Tan', '25104490@usc.edu.ph', '25104490', 'carolinian2026', 'student', 'BS Architecture', '3rd Year', 'School of Architecture, Fine Arts and Design', '["Carolinian Volunteers Society"]'::jsonb, 'active'),
  ('usr-student-5', 'Gabriel Andre Ouano', '23101129@usc.edu.ph', '23101129', 'carolinian2026', 'student', 'BS Electronics Engineering', '4th Year', 'School of Engineering', '["Collegiate Engineering Council (CEC)"]'::jsonb, 'inactive')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.events (id, title, description, date, start_time, end_time, venue, campus, category, organizer, organizer_id, capacity, registered_count, checked_in_count, is_featured, status, image_url)
VALUES
  ('evt-usc-eng-week', 'USC Engineering Week 2026: Tech & Robotics Expo', 'Join the School of Engineering and the Collegiate Engineering Council for a week-long showcase of autonomous robotics, structural design competitions, embedded systems workshops, and keynote sessions with Cebu tech industry leaders.', '2026-11-12', '08:30', '17:00', 'Lawrence Bunzel Building Atrium', 'Talamban Campus (TC)', 'Engineering & Tech', 'Collegiate Engineering Council (CEC)', 'usr-admin-1', 120, 84, 42, true, 'open', '/src/assets/images/event_engineering_week_1793667757140.jpg'),
  ('evt-usc-days-intramurals', 'USC Days & University Intramurals 2026 Opening', 'Experience the vibrant Green and Gold spirit at the annual University of San Carlos Intramurals. Features the Torch Parade of Schools, Cheerdance Exhibition, and opening varsity matches across Talamban sports complexes.', '2026-11-18', '07:30', '18:00', 'USC Talamban Sports Complex & Stadium', 'Talamban Campus (TC)', 'Sports & Intramurals', 'USC Athletics & Recreation Office', 'usr-admin-1', 300, 245, 190, true, 'open', '/src/assets/images/event_intramurals_1793667756895.jpg'),
  ('evt-usc-career-fair', 'Carolinian Career & Internship Fair 2026', 'Connect directly with over 45 multinational corporations, software development houses, accounting firms, and engineering conglomerates recruiting graduating Carolinians and internship applicants.', '2026-11-08', '09:00', '16:30', 'Arthur Dingman Hall & Wrocklage Yard', 'Downtown Campus (Main)', 'Career & Networking', 'USC Career & Placement Office', 'usr-admin-1', 100, 100, 68, true, 'full', '/src/assets/images/event_career_fair_1793667759976.jpg'),
  ('evt-usc-org-fair', 'Tribu Carolinian: Student Organization Recruitment Week', 'Discover your campus home among 60+ accredited academic, cultural, socio-civic, and religious student organizations.', '2026-11-21', '09:00', '17:00', 'Josef Baumgartner Learning Resource Center Quad', 'Talamban Campus (TC)', 'Organization & Culture', 'USC Supreme Student Council (SSC)', 'usr-admin-1', 200, 112, 0, false, 'open', '/src/assets/images/event_org_recruitment_1793667759721.jpg'),
  ('evt-code-ai-summit', 'DCISM Cloud & Software Engineering Colloquium', 'An intensive technical symposium hosted by Computer Driven Enthusiasts (CoDE) covering distributed systems, cybersecurity fundamentals, and production web engineering.', '2026-11-26', '13:00', '17:30', 'Michael Richartz Conference Center', 'Talamban Campus (TC)', 'Academic & Symposium', 'Computer Driven Enthusiasts (CoDE)', 'usr-admin-1', 80, 58, 0, false, 'open', '/src/assets/images/event_engineering_week_1793667757140.jpg'),
  ('evt-jpia-tax-forum', 'JPIA Carolinian Financial Literacy & Tax Reform Forum', 'First-semester seminar on corporate taxation updates, auditing standards, and CPA licensure preparation featuring distinguished USC Accountancy alumni.', '2026-10-18', '13:00', '17:00', 'Albert van Gansewinkel Hall Auditorium', 'Downtown Campus (Main)', 'Academic & Symposium', 'Junior Philippine Institute of Accountants (JPIA-USC)', 'usr-admin-1', 150, 142, 134, false, 'ended', '/src/assets/images/event_career_fair_1793667759976.jpg'),
  ('evt-witness-word-outreach', 'Scientia et Virtus: Coastal Ecological & Community Outreach', 'Completed mangrove rehabilitation and community literacy drive organized by the Carolinian Volunteers Society in partnership with USC CES.', '2026-10-24', '06:30', '12:30', 'South Campus Assembly Grounds', 'South Campus', 'Community & Outreach', 'Carolinian Volunteers Society', 'usr-admin-1', 90, 86, 81, false, 'ended', '/src/assets/images/event_org_recruitment_1793667759721.jpg')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.registrations (id, event_id, user_id, user_name, user_email, student_id, course, year_level, ticket_code, status)
VALUES
  ('reg-101', 'evt-usc-eng-week', 'usr-student-1', 'Mateo Lorenzo', '25102710@usc.edu.ph', '25102710', 'BS Computer Science', '3rd Year', 'USC-ENG-2510', 'registered'),
  ('reg-102', 'evt-usc-days-intramurals', 'usr-student-1', 'Mateo Lorenzo', '25102710@usc.edu.ph', '25102710', 'BS Computer Science', '3rd Year', 'USC-INT-2510', 'registered'),
  ('reg-103', 'evt-jpia-tax-forum', 'usr-student-1', 'Mateo Lorenzo', '25102710@usc.edu.ph', '25102710', 'BS Computer Science', '3rd Year', 'USC-TAX-2510', 'registered'),
  ('reg-104', 'evt-witness-word-outreach', 'usr-student-1', 'Mateo Lorenzo', '25102710@usc.edu.ph', '25102710', 'BS Computer Science', '3rd Year', 'USC-OUT-2510', 'registered'),
  ('reg-105', 'evt-usc-eng-week', 'usr-student-2', 'Hannah Beatrice Lim', '24103912@usc.edu.ph', '24103912', 'BS Civil Engineering', '4th Year', 'USC-ENG-3912', 'registered'),
  ('reg-106', 'evt-usc-eng-week', 'usr-student-3', 'Rafael Miguel Mendoza', '26108841@usc.edu.ph', '26108841', 'BS Accountancy', '2nd Year', 'USC-ENG-8841', 'registered'),
  ('reg-107', 'evt-usc-eng-week', 'usr-student-4', 'Sofia Isabelle Tan', '25104490@usc.edu.ph', '25104490', 'BS Architecture', '3rd Year', 'USC-ENG-4490', 'registered'),
  ('reg-108', 'evt-usc-career-fair', 'usr-student-2', 'Hannah Beatrice Lim', '24103912@usc.edu.ph', '24103912', 'BS Civil Engineering', '4th Year', 'USC-CAR-3912', 'registered'),
  ('reg-109', 'evt-usc-career-fair', 'usr-student-3', 'Rafael Miguel Mendoza', '26108841@usc.edu.ph', '26108841', 'BS Accountancy', '2nd Year', 'USC-CAR-8841', 'registered')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.attendance (id, event_id, registration_id, user_id, user_name, user_email, student_id, course, ticket_code, checked_in, checked_in_at, checked_in_by)
VALUES
  ('att-201', 'evt-usc-eng-week', 'reg-101', 'usr-student-1', 'Mateo Lorenzo', '25102710@usc.edu.ph', '25102710', 'BS Computer Science', 'USC-ENG-2510', true, '2026-11-02T08:42:00Z', 'Engr. Clarissa Villareal'),
  ('att-202', 'evt-usc-eng-week', 'reg-105', 'usr-student-2', 'Hannah Beatrice Lim', '24103912@usc.edu.ph', '24103912', 'BS Civil Engineering', 'USC-ENG-3912', true, '2026-11-02T08:50:00Z', 'Engr. Clarissa Villareal'),
  ('att-203', 'evt-usc-eng-week', 'reg-106', 'usr-student-3', 'Rafael Miguel Mendoza', '26108841@usc.edu.ph', '26108841', 'BS Accountancy', 'USC-ENG-8841', false, NULL, NULL),
  ('att-204', 'evt-usc-eng-week', 'reg-107', 'usr-student-4', 'Sofia Isabelle Tan', '25104490@usc.edu.ph', '25104490', 'BS Architecture', 'USC-ENG-4490', false, NULL, NULL),
  ('att-205', 'evt-usc-career-fair', 'reg-108', 'usr-student-2', 'Hannah Beatrice Lim', '24103912@usc.edu.ph', '24103912', 'BS Civil Engineering', 'USC-CAR-3912', true, '2026-11-01T09:12:00Z', 'Engr. Clarissa Villareal'),
  ('att-206', 'evt-usc-career-fair', 'reg-109', 'usr-student-3', 'Rafael Miguel Mendoza', '26108841@usc.edu.ph', '26108841', 'BS Accountancy', 'USC-CAR-8841', false, NULL, NULL),
  ('att-207', 'evt-jpia-tax-forum', 'reg-103', 'usr-student-1', 'Mateo Lorenzo', '25102710@usc.edu.ph', '25102710', 'BS Computer Science', 'USC-TAX-2510', true, '2026-10-18T13:05:00Z', 'Engr. Clarissa Villareal')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.notifications (id, title, message, event_id, event_title, sender_name, sender_organization, recipient_role, is_read, type)
VALUES
  ('notif-301', 'Registration Confirmed: USC Engineering Week 2026', 'Your seat at the Lawrence Bunzel Atrium is reserved. Present your ticket code USC-ENG-2510 or USC ID at the registration desk by 8:15 AM.', 'evt-usc-eng-week', 'USC Engineering Week 2026: Tech & Robotics Expo', 'Engr. Clarissa Villareal', 'Collegiate Engineering Council (CEC)', 'all', false, 'registration'),
  ('notif-302', 'Shuttle Advisory for USC Days & Intramurals Opening', 'Additional campus shuttles will run every 15 minutes from Main Gate to the Talamban Sports Complex starting at 6:30 AM on November 18.', 'evt-usc-days-intramurals', 'USC Days & University Intramurals 2026 Opening', 'USC Athletics Director', 'USC Athletics & Recreation Office', 'all', false, 'announcement'),
  ('notif-303', 'Capacity Alert: Carolinian Career & Internship Fair Full', 'All 100 slots for the Downtown Campus Career Fair have been filled. Walk-in waitlists will open at 1:30 PM at Arthur Dingman Hall.', 'evt-usc-career-fair', 'Carolinian Career & Internship Fair 2026', 'Career Placement Coordinator', 'USC Career & Placement Office', 'all', true, 'alert'),
  ('notif-304', 'Certificate of Attendance Ready: JPIA Tax Reform Forum', 'Your attendance at the JPIA Carolinian Financial Literacy & Tax Reform Forum has been verified. CES points have been credited to your student ledger.', 'evt-jpia-tax-forum', 'JPIA Carolinian Financial Literacy & Tax Reform Forum', 'JPIA-USC Secretariat', 'Junior Philippine Institute of Accountants (JPIA-USC)', 'student', true, 'reminder')
ON CONFLICT (id) DO NOTHING;

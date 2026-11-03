-- ============================================================================
-- CampusConnect — University of San Carlos Event & Attendance Platform
-- MySQL 8.0+ / MariaDB (XAMPP / MySQL Workbench) Database Schema & Seed Data
-- ============================================================================

CREATE DATABASE IF NOT EXISTS campusconnect_usc
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE campusconnect_usc;

-- ----------------------------------------------------------------------------
-- 1. USERS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(160) NOT NULL UNIQUE,
  student_id VARCHAR(40) NOT NULL,
  password_hash VARCHAR(255) NOT NULL DEFAULT 'carolinian2026',
  role ENUM('student', 'admin') NOT NULL DEFAULT 'student',
  course VARCHAR(160) NOT NULL,
  year_level VARCHAR(60) NOT NULL,
  department VARCHAR(200) NOT NULL,
  organizations_json JSON NOT NULL,
  status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_users_role (role),
  INDEX idx_users_student_id (student_id)
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- 2. EVENTS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS events (
  id VARCHAR(64) PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  date DATE NOT NULL,
  start_time VARCHAR(10) NOT NULL,
  end_time VARCHAR(10) NOT NULL,
  venue VARCHAR(180) NOT NULL,
  campus VARCHAR(100) NOT NULL,
  category VARCHAR(100) NOT NULL,
  organizer VARCHAR(160) NOT NULL,
  organizer_id VARCHAR(64) NOT NULL,
  capacity INT NOT NULL DEFAULT 100,
  registered_count INT NOT NULL DEFAULT 0,
  checked_in_count INT NOT NULL DEFAULT 0,
  is_featured TINYINT(1) NOT NULL DEFAULT 0,
  status ENUM('open', 'full', 'ended', 'upcoming') NOT NULL DEFAULT 'open',
  image_url VARCHAR(500) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_events_date (date),
  INDEX idx_events_category (category),
  INDEX idx_events_campus (campus),
  INDEX idx_events_status (status)
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- 3. REGISTRATIONS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS registrations (
  id VARCHAR(64) PRIMARY KEY,
  event_id VARCHAR(64) NOT NULL,
  user_id VARCHAR(64) NOT NULL,
  user_name VARCHAR(120) NOT NULL,
  user_email VARCHAR(160) NOT NULL,
  student_id VARCHAR(40) NOT NULL,
  course VARCHAR(160) NOT NULL,
  year_level VARCHAR(60) NOT NULL,
  ticket_code VARCHAR(40) NOT NULL UNIQUE,
  status ENUM('registered', 'cancelled') NOT NULL DEFAULT 'registered',
  registered_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_event_user (event_id, user_id),
  CONSTRAINT fk_reg_event FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
  CONSTRAINT fk_reg_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- 4. ATTENDANCE TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS attendance (
  id VARCHAR(64) PRIMARY KEY,
  event_id VARCHAR(64) NOT NULL,
  registration_id VARCHAR(64) NOT NULL,
  user_id VARCHAR(64) NOT NULL,
  user_name VARCHAR(120) NOT NULL,
  user_email VARCHAR(160) NOT NULL,
  student_id VARCHAR(40) NOT NULL,
  course VARCHAR(160) NOT NULL,
  ticket_code VARCHAR(40) NOT NULL,
  checked_in TINYINT(1) NOT NULL DEFAULT 0,
  checked_in_at DATETIME NULL,
  checked_in_by VARCHAR(120) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_att_event (event_id),
  INDEX idx_att_ticket (ticket_code),
  CONSTRAINT fk_att_event FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
  CONSTRAINT fk_att_reg FOREIGN KEY (registration_id) REFERENCES registrations(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- 5. NOTIFICATIONS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS notifications (
  id VARCHAR(64) PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  event_id VARCHAR(64) NULL,
  event_title VARCHAR(200) NULL,
  sender_name VARCHAR(120) NOT NULL,
  sender_organization VARCHAR(160) NOT NULL,
  recipient_role ENUM('all', 'student', 'admin') NOT NULL DEFAULT 'all',
  is_read TINYINT(1) NOT NULL DEFAULT 0,
  type ENUM('announcement', 'registration', 'reminder', 'alert') NOT NULL DEFAULT 'announcement',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ============================================================================
-- SEED DATA (University of San Carlos — CampusConnect)
-- ============================================================================

INSERT IGNORE INTO users (id, name, email, student_id, password_hash, role, course, year_level, department, organizations_json, status)
VALUES
  ('usr-student-1', 'Mateo Lorenzo', '25102710@usc.edu.ph', '25102710', 'carolinian2026', 'student', 'BS Computer Science', '3rd Year', 'School of Arts and Sciences — DCISM', '["Computer Driven Enthusiasts (CoDE)", "USC Supreme Student Council (SSC)"]', 'active'),
  ('usr-admin-1', 'Engr. Clarissa Villareal', 'osa.events@usc.edu.ph', 'ADM-00184', 'carolinian2026', 'admin', 'Office of Student Affairs & Organization Council', 'Administrator / Adviser', 'Office of Student Affairs (OSA)', '["USC Supreme Student Council (SSC)", "Collegiate Engineering Council (CEC)"]', 'active'),
  ('usr-student-2', 'Hannah Beatrice Lim', '24103912@usc.edu.ph', '24103912', 'carolinian2026', 'student', 'BS Civil Engineering', '4th Year', 'School of Engineering', '["Collegiate Engineering Council (CEC)"]', 'active'),
  ('usr-student-3', 'Rafael Miguel Mendoza', '26108841@usc.edu.ph', '26108841', 'carolinian2026', 'student', 'BS Accountancy', '2nd Year', 'School of Business and Economics', '["Junior Philippine Institute of Accountants (JPIA-USC)"]', 'active'),
  ('usr-student-4', 'Sofia Isabelle Tan', '25104490@usc.edu.ph', '25104490', 'carolinian2026', 'student', 'BS Architecture', '3rd Year', 'School of Architecture, Fine Arts and Design', '["Carolinian Volunteers Society"]', 'active');

INSERT IGNORE INTO events (id, title, description, date, start_time, end_time, venue, campus, category, organizer, organizer_id, capacity, registered_count, checked_in_count, is_featured, status, image_url)
VALUES
  ('evt-usc-eng-week', 'USC Engineering Week 2026: Tech & Robotics Expo', 'Join the School of Engineering and the Collegiate Engineering Council for a week-long showcase of autonomous robotics, structural design competitions, embedded systems workshops, and keynote sessions with Cebu tech industry leaders.', '2026-11-12', '08:30', '17:00', 'Lawrence Bunzel Building Atrium', 'Talamban Campus (TC)', 'Engineering & Tech', 'Collegiate Engineering Council (CEC)', 'usr-admin-1', 120, 84, 42, 1, 'open', '/src/assets/images/event_engineering_week_1793667757140.jpg'),
  ('evt-usc-days-intramurals', 'USC Days & University Intramurals 2026 Opening', 'Experience the vibrant Green and Gold spirit at the annual University of San Carlos Intramurals. Features the Torch Parade of Schools, Cheerdance Exhibition, and opening varsity matches across Talamban sports complexes.', '2026-11-18', '07:30', '18:00', 'USC Talamban Sports Complex & Stadium', 'Talamban Campus (TC)', 'Sports & Intramurals', 'USC Athletics & Recreation Office', 'usr-admin-1', 300, 245, 190, 1, 'open', '/src/assets/images/event_intramurals_1793667756895.jpg'),
  ('evt-usc-career-fair', 'Carolinian Career & Internship Fair 2026', 'Connect directly with over 45 multinational corporations, software development houses, accounting firms, and engineering conglomerates recruiting graduating Carolinians and internship applicants.', '2026-11-08', '09:00', '16:30', 'Arthur Dingman Hall & Wrocklage Yard', 'Downtown Campus (Main)', 'Career & Networking', 'USC Career & Placement Office', 'usr-admin-1', 100, 100, 68, 1, 'full', '/src/assets/images/event_career_fair_1793667759976.jpg'),
  ('evt-usc-org-fair', 'Tribu Carolinian: Student Organization Recruitment Week', 'Discover your campus home among 60+ accredited academic, cultural, socio-civic, and religious student organizations.', '2026-11-21', '09:00', '17:00', 'Josef Baumgartner Learning Resource Center Quad', 'Talamban Campus (TC)', 'Organization & Culture', 'USC Supreme Student Council (SSC)', 'usr-admin-1', 200, 112, 0, 0, 'open', '/src/assets/images/event_org_recruitment_1793667759721.jpg'),
  ('evt-code-ai-summit', 'DCISM Cloud & Software Engineering Colloquium', 'An intensive technical symposium hosted by Computer Driven Enthusiasts (CoDE) covering distributed systems, cybersecurity fundamentals, and production web engineering.', '2026-11-26', '13:00', '17:30', 'Michael Richartz Conference Center', 'Talamban Campus (TC)', 'Academic & Symposium', 'Computer Driven Enthusiasts (CoDE)', 'usr-admin-1', 80, 58, 0, 0, 'open', '/src/assets/images/event_engineering_week_1793667757140.jpg'),
  ('evt-jpia-tax-forum', 'JPIA Carolinian Financial Literacy & Tax Reform Forum', 'First-semester seminar on corporate taxation updates, auditing standards, and CPA licensure preparation featuring distinguished USC Accountancy alumni.', '2026-10-18', '13:00', '17:00', 'Albert van Gansewinkel Hall Auditorium', 'Downtown Campus (Main)', 'Academic & Symposium', 'Junior Philippine Institute of Accountants (JPIA-USC)', 'usr-admin-1', 150, 142, 134, 0, 'ended', '/src/assets/images/event_career_fair_1793667759976.jpg'),
  ('evt-witness-word-outreach', 'Scientia et Virtus: Coastal Ecological & Community Outreach', 'Completed mangrove rehabilitation and community literacy drive organized by the Carolinian Volunteers Society in partnership with USC CES.', '2026-10-24', '06:30', '12:30', 'South Campus Assembly Grounds', 'South Campus', 'Community & Outreach', 'Carolinian Volunteers Society', 'usr-admin-1', 90, 86, 81, 0, 'ended', '/src/assets/images/event_org_recruitment_1793667759721.jpg');

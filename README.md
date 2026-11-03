# CampusConnect — University of San Carlos Event & Attendance Platform

**CampusConnect** is a full-stack web application (**React + Vite + Tailwind CSS + Node.js + Express + Supabase PostgreSQL / MySQL**) for the **University of San Carlos (USC)** where Carolinian students can discover campus events, register for seats, and view digital attendance passes, and where accredited student organizations and the Office of Student Affairs (OSA) can create events, check in attendees, broadcast announcements, and export attendance reports.

---

## Setting Up Supabase (Recommended Cloud PostgreSQL Database)

1. **Create a New Project in Supabase**:
   - Go to [https://supabase.com/dashboard](https://supabase.com/dashboard) and click **New Project**.
   - Name your project `campusconnect-usc`, set a database password, choose **Southeast Asia (Singapore)** as the region, and wait ~60 seconds for provisioning.

2. **Run the SQL Schema & Seed Script**:
   - In your Supabase project’s left sidebar, click **SQL Editor**.
   - Click **+ New query**.
   - Open `database/campusconnect_supabase.sql` from this repository, copy the entire contents, paste it into the Supabase SQL Editor, and click **Run** (`Ctrl+Enter` / `Cmd+Enter`).
   - Click **Table Editor** in the left sidebar — you will see all 5 tables (`users`, `events`, `registrations`, `attendance`, `notifications`) populated with USC seed data!

3. **Copy Your Supabase URL & Key**:
   - In the left sidebar of Supabase, click **Project Settings** (the gear icon at the bottom) → **API**.
   - Copy:
     - **Project URL** (`https://xxxxxxxxxxxx.supabase.co`)
     - **Project API Keys → `anon` `public`** key (`eyJhbGci...`)

4. **Paste into `.env` (or AI Studio Secrets)**:
   - Create `.env` from `.env.example` (`cp .env.example .env`) and paste your values:
     ```env
     SUPABASE_URL="https://xxxxxxxxxxxx.supabase.co"
     SUPABASE_ANON_KEY="eyJhbGci..."
     ```
   - Restart the server (`npm run dev`). You will see:
     ```text
     [Supabase] Connected to Supabase PostgreSQL project: https://xxxxxxxxxxxx.supabase.co
     ```

---

## Alternative: Setting Up Local MySQL (XAMPP / MySQL Workbench)

If you prefer running offline with XAMPP or MySQL Workbench:
1. Import `database/campusconnect_mysql.sql` in phpMyAdmin (`http://localhost/phpmyadmin`) or MySQL Workbench.
2. Leave `SUPABASE_URL` blank and configure `DB_HOST="127.0.0.1"`, `DB_USER="root"`, `DB_PASSWORD=""`, `DB_NAME="campusconnect_usc"` in `.env`.

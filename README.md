# College Attendance Tracker System

A complete 3-tier attendance tracking system built with **React**, **Tailwind CSS**, **Node.js**, **Express**, and **MongoDB Atlas**.

---

##  System Architecture & Access URLs

| Portal | URL Path | Credentials / Access | Description |
| :--- | :--- | :--- | :--- |
| **Student Portal** | `/` | Enter Roll Number (e.g. `101`, `102`) | Passwordless student dashboard with attendance percentages, safe skips, class history, and PDF download. Zero links to teacher or admin portals. |
| **Teacher Portal** | `/teacher` | Teacher ID + Password (e.g. `TECH101` / `password123`) | Class creation, roll number range generator, daily attendance marking, session edits, and PDF registers. |
| **Management Panel** | `/admin-panel-x9k2` *(or `/sys-admin-mgmt-2026`)* | **User**: `superadmin`<br>**Password**: `Admin@Secure2026!` | Hidden master control panel to add, edit, disable/enable teacher logins, reset passwords, and set permissions without touching code. |

---

##  Features

- **Student Portal**:
  - Roll number lookup (no password required).
  - Subject-by-subject attendance overview.
  - Safe skip calculator and classes needed to reach 75%.
  - Complete session-by-session history.
  - Clean PDF report card download.

- **Teacher Portal**:
  - Dynamic login against MongoDB database.
  - Add classes with subject code, section, semester, and student roll number ranges (e.g. `101-130`).
  - Mark attendance per date with quick "Mark All Present" / "Mark All Absent".
  - Edit or delete previous attendance records.
  - Export attendance matrix to PDF.

- **Management Control Layer**:
  - Hidden URL for college administration.
  - Add and edit teacher accounts dynamically.
  - Reset teacher passwords on the fly.
  - One-click account activation / deactivation (`⏻`).
  - Set granular permissions per teacher (create classes, edit attendance, export PDF).
  - Overall system stats.

- **Production & Deployment**:
  - Express server with keep-alive ping worker for Render free-tier hosting.
  - MongoDB Atlas cloud connection.

---

## 🚀Quick Start

### 1. Install Dependencies
```bash
# Install root, client, and server dependencies
npm install
cd client && npm install
cd ../server && npm install
cd ..
```

### 2. Configure Environment
In `server/.env`:
```env
PORT=5001
MONGODB_URI=your_mongodb_atlas_connection_string
ADMIN_USERNAME=superadmin
ADMIN_PASSWORD=Admin@Secure2026!
ADMIN_KEY=mgmt_k9x2p_secret_access_2026
```

### 3. Run Locally
```bash
npm run dev
```
- Client runs on `http://localhost:3000`
- Server runs on `http://localhost:5001`

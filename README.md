# SkillSync — Full-Stack P2P Skill Exchange Platform

**SkillSync** is a full-stack peer-to-peer knowledge sharing and learning marketplace. Built with **React.js, Vite, Redux Toolkit, Node.js, Express.js, and MongoDB**, it enables students and professionals to act dynamically as both **learners and mentors**—teaching skills they know, discovering mentors for skills they want to learn, scheduling 1-on-1 sessions, exchanging virtual platform credits, and submitting reviews.

---

## 🚀 Key Features

### 1. Dynamic User Roles & Authentication
- Any user can teach skills (mentor) and book other skills (learner) seamlessly.
- Privileged **Administrator** role for platform management.
- Secure JWT authentication with bcrypt password hashing.
- Full registration flow with **100 Starter Bonus Credits** allocated upon registration.
- Profile management: Bio, location, skills of interest, teachable skills, and weekly availability schedule.
- Light and Dark mode UI support.

### 2. Skill Catalog & Mentor Discovery
- Users can list skills to teach with category, proficiency level (`Beginner`, `Intermediate`, `Advanced`, `Expert`), credit rates per session, and tags.
- Search with keyword matching, category filtering, level filtering, minimum mentor rating filtering, and sorting options.
- Mentor profiles featuring their teachable skills, average rating, student reviews, and availability slots.

### 3. Session Scheduling & Double-Booking Prevention
- Learner selects date, start time, duration, and learning goals.
- Automated credit sufficiency validation prior to booking.
- Real-time double-booking conflict prevention checking both mentor and learner schedules.
- Status management: `REQUESTED`, `ACCEPTED`, `REJECTED`, `CANCELLED`, `COMPLETED`, `RESCHEDULED`.

### 4. Dual-Confirmation Manual Session Completion (Offline/External)
> **Scope Decision Note**: Video conferencing APIs (WebRTC, Zoom, Google Meet, Jitsi) are intentionally excluded. Sessions are conducted offline or externally.
- Safe 2-step verification workflow:
  1. Mentor confirms session conducted (`mentorConfirmedCompletion = true`).
  2. Learner confirms session conducted (`learnerConfirmedCompletion = true`).
  3. Only after **BOTH** parties confirm:
     - Session status transitions to `COMPLETED`.
     - Credits are transferred atomically from learner to mentor.
     - Transactions are recorded with audit logs.
     - Both participants become eligible to leave feedback reviews.
- Designed with future meeting link extension fields (`meetingProvider`, `meetingUrl`, `meetingId`).

### 5. Virtual Credit Wallet & Ledger
- Balance tracking with breakdown: Current balance, total credits earned from teaching, total credits spent on learning.
- Detailed transaction history with type tags (`INITIAL_BONUS`, `SESSION_CREDIT_EARNED`, `SESSION_CREDIT_SPENT`, `ADMIN_ADJUSTMENT`, `REFUND`).
- Protection against direct frontend balance manipulation.

### 6. Ratings & Reviews
- 1–5 Star rating and written feedback system.
- Restricted strictly to participants of completed sessions.
- Prevention of duplicate reviews for the same session.
- Automatic mentor average rating and review count recalculation.

### 7. In-App Notifications
- Real-time alerts for session requests, acceptances, rejections, cancellations, reschedules, completion reminders, credits earned/spent, and reviews.
- Unread notification counter, mark as read, and mark all as read.

### 8. Admin Control Center & Content Moderation
- Dashboard Analytics: Total users (active/suspended), total skills, session breakdown, credits exchanged, and pending reports.
- User management: Suspend / activate users with reason logs.
- Skill moderation: Deactivate / approve listings.
- Issue resolution: Manage disputes and abuse reports with admin action notes.
- Wallet adjustments: Allocate or adjust credits for dispute resolutions.

---

## 🛠 Technology Stack

- **Frontend**: React 19, Vite, React Router v7, Redux Toolkit, Axios, Lucide Icons, Custom Responsive CSS Design System with CSS variables (Light & Dark theme).
- **Backend**: Node.js, Express.js, Mongoose, MongoDB, JWT (jsonwebtoken), bcryptjs, Joi validation, Nodemailer, CORS, Helmet.
- **Database**: MongoDB (runs on local instance or MongoDB Atlas).

---

## 📁 Project Architecture

```text
p2p-skill-exchange/
├── backend/
│   ├── config/
│   │   ├── config.js              # Environment settings
│   │   └── database.js            # MongoDB connection
│   ├── controllers/               # API route controllers
│   ├── middleware/
│   │   ├── authMiddleware.js      # JWT verification & optional auth
│   │   ├── authorizationMiddleware.js # Role checks (adminOnly)
│   │   ├── errorHandler.js        # Centralized error handler
│   │   └── validationMiddleware.js# Joi schemas
│   ├── models/
│   │   ├── User.js
│   │   ├── Skill.js
│   │   ├── Session.js
│   │   ├── Wallet.js
│   │   ├── Transaction.js
│   │   ├── Review.js
│   │   ├── Notification.js
│   │   └── Report.js
│   ├── routes/                    # Express REST endpoints
│   ├── services/                  # Core business logic layer
│   ├── utils/
│   │   ├── seedData.js            # Database seeding utility
│   │   └── testSuite.js           # Automated integration test runner
│   ├── .env.example
│   ├── package.json
│   └── server.js
│
├── frontend/
│   ├── src/
│   │   ├── components/            # Reusable UI components & modals
│   │   ├── pages/                 # Full application pages
│   │   ├── layouts/               # Main layout with header/footer
│   │   ├── services/              # Centralized Axios API services
│   │   ├── redux/                 # Redux Toolkit slices and store
│   │   ├── context/               # Theme context (Light/Dark mode)
│   │   ├── styles/                # Modern CSS design system
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── .gitignore
└── README.md
```

---

## ⚡ Quick Start Guide

### Prerequisites
- [Node.js](https://nodejs.org/) (v16+)
- [MongoDB](https://www.mongodb.com/) (running locally on port 27017 or a MongoDB Atlas URI)

---

### Step 1: Backend Setup

```bash
cd backend
npm install
cp .env.example .env
```

Ensure `.env` contains:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/p2p_skill_exchange
JWT_SECRET=supersecretjwtkey_p2p_skill_exchange_dev_2026_secure
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:5173
INITIAL_USER_CREDITS=100
```

#### Seed Demo Data (Optional but Recommended)
Populate sample users, skills, sessions, transactions, reviews, and reports:
```bash
npm run seed
```

#### Start Backend Server
```bash
# Production / standard mode
npm start

# Or with nodemon for live reload
npm run dev
```
Backend API will start at **`http://localhost:5000`**.

---

### Step 2: Frontend Setup

Open a new terminal window:
```bash
cd frontend
npm install
npm run dev
```
Frontend web application will run at **`http://localhost:5173`**.

---

## 👥 Demo User Credentials

The database seed script provides ready-to-use demo accounts:

| Role / Name | Email | Password | Primary Skills |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@skillsync.p2p` | `AdminPassword123!` | System Administrator |
| **Swapna Khire** | `swapna@example.com` | `Password123!` | React, Full-Stack Development |
| **Rahul Verma** | `rahul@example.com` | `Password123!` | Python, Data Science, DSA |
| **Dishita Rao** | `dishita@example.com` | `Password123!` | UI/UX Design, Figma Masterclass |
| **Navya Tiwari** | `navya@example.com` | `Password123!` | Conversational French |
| **Pratiti Patlia** | `pratiti@example.com` | `Password123!` | Public Speaking & Pitching |

*Tip: The login page includes **One-Click Demo Login** buttons to sign in instantly.*

---

## 🧪 Automated Testing

Run the end-to-end integration test suite verifying authentication, scheduling, conflict prevention, dual confirmation manual completion, credit transfers, reviews, and admin actions:

```bash
cd backend
node utils/testSuite.js
```

---

## 🌐 API Overview

| Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register new user + allocate 100 starter credits | Public |
| `POST` | `/api/auth/login` | Log in and receive JWT token | Public |
| `GET` | `/api/auth/me` | Fetch authenticated user data | Bearer Token |
| `GET` | `/api/users/profile` | View profile and teaching skills | Bearer Token |
| `PUT` | `/api/users/profile` | Update profile information | Bearer Token |
| `PUT` | `/api/users/availability` | Update weekly availability calendar | Bearer Token |
| `GET` | `/api/users/mentors/:id` | View public mentor profile | Public / Optional |
| `GET` | `/api/skills/search` | Search skills with filters (category, level, rating) | Public |
| `POST` | `/api/skills` | Create a new skill listing | Bearer Token |
| `PUT` | `/api/skills/:id` | Update skill listing | Owner / Admin |
| `DELETE`| `/api/skills/:id` | Delete skill listing | Owner / Admin |
| `POST` | `/api/sessions/request` | Request a learning session | Learner |
| `GET` | `/api/sessions/my-sessions` | Get user sessions (as learner or mentor) | Bearer Token |
| `PUT` | `/api/sessions/:id/accept` | Accept pending session request | Mentor |
| `PUT` | `/api/sessions/:id/reject` | Decline session request | Mentor |
| `PUT` | `/api/sessions/:id/cancel` | Cancel scheduled session | Participant |
| `PUT` | `/api/sessions/:id/reschedule`| Propose new session date & time | Participant |
| `PUT` | `/api/sessions/:id/confirm-completion` | Confirm session conducted (dual-confirmation) | Participant |
| `GET` | `/api/wallet/balance` | Get wallet balance & stats | Bearer Token |
| `GET` | `/api/wallet/transactions` | Get transaction ledger | Bearer Token |
| `POST` | `/api/reviews` | Submit star rating and written review | Participant |
| `GET` | `/api/notifications` | Get in-app notifications | Bearer Token |
| `POST` | `/api/reports` | Report inappropriate content or dispute | Bearer Token |
| `GET` | `/api/admin/analytics` | View platform statistics & metrics | Admin Only |
| `PUT` | `/api/admin/users/:id/suspend` | Suspend user account | Admin Only |
| `PUT` | `/api/admin/skills/:id/moderate`| Moderate skill listing | Admin Only |
| `PUT` | `/api/admin/reports/:id/resolve`| Resolve user reports | Admin Only |

---

## 🔮 Future Enhancements

1. **Video Conferencing Integration**: Built-in support prepared in the `Session` schema for integrating Zoom SDK, Google Meet API, or Jitsi Meet.
2. **In-App Messaging / Chat**: Direct chat between peers before session scheduling.
3. **Advanced Calendar Sync**: Export sessions to Google Calendar or iCal format.
4. **Badges & Certifications**: Peer endorsements and verified mentor badges.

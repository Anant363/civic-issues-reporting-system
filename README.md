# 🏙️ CivicPulse — Civic Issue Reporting System

A full-stack MERN application that allows citizens to report civic issues
(garbage overflow, road damage, water leakage, etc.) and lets admins manage
them through an approval workflow.

---

## 📁 Project Structure

```
civic-issue-reporter/
├── backend/
│   ├── config/
│   │   └── db.js                  # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js      # Register, Login, Me
│   │   └── issueController.js     # Full CRUD + admin actions
│   ├── middleware/
│   │   ├── authMiddleware.js      # JWT protect
│   │   ├── adminMiddleware.js     # Admin-only guard
│   │   └── errorMiddleware.js     # Global error handler + 404
│   ├── models/
│   │   ├── User.js                # User schema (citizen/admin)
│   │   └── Issue.js               # Issue schema
│   ├── routes/
│   │   ├── authRoutes.js
│   │   └── issueRoutes.js
│   ├── utils/
│   │   ├── asyncHandler.js        # Async wrapper
│   │   └── jwt.js                 # Token generate/verify
│   ├── app.js                     # Express app setup
│   ├── server.js                  # Entry point
│   ├── seed.js                    # Database seeder
│   ├── .env.example
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Navbar.jsx
    │   │   ├── IssueCard.jsx
    │   │   ├── IssueList.jsx
    │   │   ├── Spinner.jsx
    │   │   └── Alert.jsx
    │   ├── context/
    │   │   └── AuthContext.jsx    # Global auth state
    │   ├── pages/
    │   │   ├── Home.jsx           # Public issue board
    │   │   ├── Login.jsx
    │   │   ├── Register.jsx
    │   │   ├── ReportIssue.jsx
    │   │   ├── UserDashboard.jsx  # Personal issue tracker
    │   │   └── AdminDashboard.jsx # Full admin panel
    │   ├── services/
    │   │   ├── api.js             # Axios instance
    │   │   ├── authService.js
    │   │   └── issueService.js
    │   ├── utils/
    │   │   └── constants.js
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── index.html
    ├── vite.config.js
    ├── tailwind.config.js
    ├── postcss.config.js
    └── package.json
```

---

## ⚙️ Setup Instructions

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)
- npm or yarn

---

### 1. Clone / Download the project

```bash
# Navigate to the project root
cd civic-issue-reporter
```

---

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env
```

Edit `.env`:
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/civic_issues
JWT_SECRET=your_super_secret_key_min_32_chars
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

**Seed the database (recommended for first run):**
```bash
node seed.js
```

**Start the backend server:**
```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

Backend runs at: `http://localhost:5000`

---

### 3. Frontend Setup

Open a new terminal:

```bash
cd frontend

# Install dependencies
npm install

# Start the dev server
npm run dev
```

Frontend runs at: `http://localhost:5173`

The Vite dev server proxies `/api` requests to `http://localhost:5000`
automatically — no CORS issues in development.

---

## 🧪 Demo Credentials (after seeding)

| Role    | Email                    | Password   |
|---------|--------------------------|------------|
| Admin   | admin@civicpulse.com     | admin123   |
| Citizen | citizen@example.com      | citizen123 |
| Citizen | priya@example.com        | priya123   |

---

## 🌐 API Reference

### Auth

| Method | Endpoint             | Access  | Description          |
|--------|----------------------|---------|----------------------|
| POST   | /api/auth/register   | Public  | Register new user    |
| POST   | /api/auth/login      | Public  | Login, get JWT       |
| GET    | /api/auth/me         | Private | Get own profile      |

### Issues

| Method | Endpoint                    | Access        | Description                   |
|--------|-----------------------------|---------------|-------------------------------|
| GET    | /api/issues/public          | Public        | Get approved public issues    |
| POST   | /api/issues                 | Private       | Report new issue              |
| GET    | /api/issues/my              | Private       | Get logged-in user's issues   |
| GET    | /api/issues/admin/all       | Admin         | Get all issues                |
| GET    | /api/issues/admin/stats     | Admin         | Get dashboard statistics      |
| PATCH  | /api/issues/:id/approve     | Admin         | Approve an issue              |
| PATCH  | /api/issues/:id/reject      | Admin         | Reject an issue               |
| PATCH  | /api/issues/:id/status      | Admin         | Update status                 |
| DELETE | /api/issues/:id             | Admin         | Delete an issue               |
| GET    | /api/issues/:id             | Public/Private| Get single issue              |

---

## 📬 Sample API Requests

### Register
```json
POST /api/auth/register
{
  "name": "Amit Kumar",
  "email": "amit@example.com",
  "password": "secret123"
}
```

### Login
```json
POST /api/auth/login
{
  "email": "citizen@example.com",
  "password": "citizen123"
}
```

### Create Issue
```json
POST /api/issues
Authorization: Bearer <token>
{
  "title": "Broken road near hospital",
  "description": "Large pothole causing accidents daily near the main hospital gate.",
  "category": "Road Damage",
  "location": "Civil Hospital Gate, Sector 10",
  "isAnonymous": false
}
```

### Approve Issue (Admin)
```
PATCH /api/issues/<issue_id>/approve
Authorization: Bearer <admin_token>
```

### Update Status (Admin)
```json
PATCH /api/issues/<issue_id>/status
Authorization: Bearer <admin_token>
{
  "status": "In Progress"
}
```

### Reject Issue (Admin)
```json
PATCH /api/issues/<issue_id>/reject
Authorization: Bearer <admin_token>
{
  "reason": "Duplicate report already exists"
}
```

---

## 🔑 Key Features

- **JWT Authentication** — Secure token-based auth with 7-day expiry
- **Anonymous Reporting** — Users can hide their name publicly while still tracking their reports in their dashboard
- **Admin Approval Workflow** — Issues only appear publicly after admin approval
- **Status Tracking** — Pending → In Progress → Resolved
- **Responsive UI** — Works on mobile and desktop
- **Error Handling** — Full server-side and client-side error handling
- **Category Filtering** — Filter public issues by category and status
- **Dashboard Statistics** — Admin gets category breakdown and status counts

---

## 🏗️ Build for Production

```bash
# Frontend
cd frontend && npm run build

# Serve the dist folder with any static server or your Express backend
```

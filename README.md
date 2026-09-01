# Donation Management System

A full-stack MERN application for managing donor records, tracking donations, and visualising donation activity through an interactive dashboard.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Environment Setup](#environment-setup)
- [Installation](#installation)
- [Running the Application](#running-the-application)
- [Seeding the Database](#seeding-the-database)
- [Features](#features)
- [API Reference](#api-reference)
- [Key Technical Decisions](#key-technical-decisions)
- [Further Enhancements](#further-enhancements)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite, React Router DOM v7 |
| UI / Styling | Vanilla CSS, Bootstrap 5 (grid only), Lucide React icons |
| HTTP Client | Axios |
| Backend | Node.js, Express 5 |
| Database | MongoDB Atlas via Mongoose 9 |
| Dev Server | Nodemon |

---

## Project Structure

```
Donation_Management/
├── Backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js
│   │   ├── controllers/
│   │   │   └── donationController.js
│   │   ├── middleware/
│   │   │   └── errorHandler.js
│   │   ├── models/
│   │   │   └── Donation.js
│   │   └── routes/
│   │       └── donationRoutes.js
│   ├── Server.js
│   ├── seed.js
│   ├── .env
│   └── package.json
│
└── Client/
    ├── src/
    │   ├── api/
    │   │   └── donationApi.js
    │   ├── components/
    │   │   ├── Sidebar.jsx
    │   │   └── Topbar.jsx
    │   ├── pages/
    │   │   ├── Dashboard.jsx
    │   │   ├── DonationForm.jsx
    │   │   └── DonationList.jsx
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── index.html
    └── package.json
```

---

## Prerequisites

- Node.js v18 or higher
- npm v9 or higher (bundled with Node.js)
- A MongoDB Atlas account with a free cluster

Note: Port 5000 is occupied by AirPlay Receiver on macOS. This project uses port 5001 for the backend.

---

## Environment Setup

Create a `.env` file inside the `Backend/` directory:

```
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<dbname>?retryWrites=true&w=majority
PORT=5001
NODE_ENV=development
```

Replace `<username>`, `<password>`, `<cluster>`, and `<dbname>` with your MongoDB Atlas credentials. Do not commit this file to version control.

---

## Installation

Install dependencies for the backend and frontend separately.

### Backend

```bash
cd Backend
npm install
```

### Frontend

```bash
cd Client
npm install
```

---

## Running the Application

Open two separate terminal windows and run each server simultaneously.

### Terminal 1 — Backend

```bash
cd Backend
npm run dev
```

The backend starts at `http://localhost:5001`.

Expected output:
```
Server is running on port 5001
MongoDB Connected: <your-cluster>.mongodb.net
```

### Terminal 2 — Frontend

```bash
cd Client
npm run dev
```

The frontend starts at `http://localhost:5173`. Open that URL in your browser.

---

## Seeding the Database

To populate the database with 50 sample donations for development and testing:

```bash
cd Backend
node seed.js
```

The seeder clears the existing collection, inserts 50 records with randomised data, and prints a breakdown by type and status. It is safe to run multiple times.

---

## Features

### Core Functionality

| Feature | Description |
|---|---|
| Donation Form | Add new donations with full field validation — donor name, email, phone, amount, type, payment method, date, status, and notes |
| Edit Donation | Pre-filled edit form with the same validation rules |
| Delete Donation | Confirm-before-delete modal to prevent accidental deletions |
| View Record | Detail modal showing all fields for a selected donor |
| Donor List | Paginated table with real-time visual feedback |
| Dashboard | Stat cards, bar charts by type and payment method, and a recent donations feed |

### Search and Filtering

| Feature | Description |
|---|---|
| Debounced Search | A 500ms debounce is applied before the API request fires, preventing excessive network calls while the user is typing |
| Multi-field Filters | Filter by donation type, payment method, status, and date range, all combinable |
| Instant Clear | An X button inside the search bar clears the query immediately |
| Reset All | A single button resets every active filter to its default state |

### Data Integrity

| Feature | Description |
|---|---|
| Unique Email | A MongoDB unique index enforces one email per donor, applied on both create and update |
| Unique Phone | The same uniqueness constraint is applied to phone numbers |
| Duplicate Error Messages | Field-specific messages are returned, for example: Email address already associated with another donor |

### Pagination

| Feature | Description |
|---|---|
| Server-side Pagination | All filtering and pagination is handled by MongoDB, keeping response payloads small |
| Smart Page Buttons | Renders a limited set of page buttons with ellipsis for large datasets |
| Record Count | Shows "Showing X-Y of Z records" at all times |

### Error Handling

| Feature | Description |
|---|---|
| Global Error Middleware | errorHandler.js in Express catches Mongoose ValidationError, CastError, and MongoDB duplicate key errors globally |
| Controller-level Handling | Each controller catches errors and returns structured JSON responses with no unhandled promise rejections |
| Frontend API Errors | Error messages from the backend are surfaced directly as styled alert banners in the UI |
| Loading States | Spinner overlays are shown during all async operations — list load, form submit, view, and delete |

### Dashboard Logic

| Feature | Description |
|---|---|
| Completed-only Aggregates | Dashboard totals include only donations with status Completed. Pending, Rejected, and Cancelled are excluded |
| This Month Stats | Separate counters for the current calendar month, filtered by donation date |
| Bar Charts | Relative horizontal bars for donation type distribution and payment method breakdown |

### UI and UX

| Feature | Description |
|---|---|
| Lucide React Icons | SVG icon set used throughout the application |
| Plus Jakarta Sans | Imported from Google Fonts for modern, high-contrast typography |
| Responsive Layout | Three breakpoints for desktop, tablet, and mobile |
| Glassmorphism Topbar | backdrop-filter blur on the sticky topbar for a frosted-glass appearance |
| Animated Modals | Spring animation on modal open using cubic-bezier |
| Micro-animations | Hover lift on stat cards, slide-in on alerts, and transitions on sidebar items |

---

## API Reference

Base URL: `http://localhost:5001/api/donations`

| Method | Endpoint | Description |
|---|---|---|
| GET | / | List all donations with optional search, filter, and pagination |
| GET | /:id | Get a single donation by ID |
| POST | / | Create a new donation |
| PUT | /:id | Update an existing donation |
| DELETE | /:id | Delete a donation |
| GET | /dashboard | Get aggregated dashboard statistics |

### Query Parameters for GET /

| Param | Type | Description |
|---|---|---|
| page | number | Page number, default is 1 |
| limit | number | Records per page, default is 8 |
| search | string | Search by donor name or email |
| donationType | string | Filter by donation type |
| paymentMethod | string | Filter by payment method |
| currentStatus | string | Filter by status |
| fromDate | date | Range start in YYYY-MM-DD format |
| toDate | date | Range end in YYYY-MM-DD format |

---

## Key Technical Decisions

### CommonJS over ESM on the Backend

The backend uses CommonJS (`require` / `module.exports`) rather than ES Modules. This avoids the `__dirname` and `import.meta` complexity that ESM introduces in Node.js server environments and keeps compatibility straightforward with nodemon and dotenv.

### Mongoose Unique Indexes Synced Explicitly

After adding `unique: true` to the email and phone fields in the Mongoose schema, the indexes were not automatically applied to the existing collection. `Donation.syncIndexes()` was called explicitly to rebuild the indexes against live data, ensuring the constraint is enforced at the database level.

### findByIdAndUpdate with runValidators: true

The update controller uses `{ new: true, runValidators: true }` so Mongoose schema validators run on PUT requests, not just on create. Without this option, invalid data could be written to the database on updates.

### Dashboard Filtered to Completed Status Only

Dashboard aggregates exclude Pending, Rejected, and Cancelled records. This ensures the total amount figures reflect only verified, settled transactions, making the dashboard a financial summary rather than a raw record count.

### Debounce via useCallback and useEffect

Search debouncing is implemented by pairing `useCallback` to stabilise the fetch function reference with a `useEffect` that holds a 500ms `setTimeout`. This avoids creating a new timer on every keystroke and correctly cleans up the previous timer via the effect's return function, preventing stale API calls from racing each other.

### State-based Form Validation

Form validation uses `useState` with a custom `validate()` function instead of a third-party library. This keeps the validation logic fully transparent, avoids an external dependency, and gives direct control over when and how errors are shown.

### Centralised Axios Service Layer

All API calls are routed through `Client/src/api/donationApi.js` with a single Axios instance configured against the base URL. Switching environments only requires changing the base URL in one place, and any future interceptors for auth tokens or logging can be added centrally.

---

## Further Enhancements

### Role-Based Access Control (RBAC)

A three-tier access model has been designed and is planned for implementation:

| Role | Access |
|---|---|
| Superadmin | Full access. Seeded via .env, no sign-up required. Can promote or demote any registered user to Admin. |
| Admin | Full CRUD access across all donations and donor records. |
| User | Read-only access. Can view the Dashboard and Donor List but cannot add, edit, or delete records. The Add Donor form is hidden from this role. |

Implementation plan:

- User Mongoose model with a role field (user, admin, superadmin)
- JWT-based authentication using jsonwebtoken and bcryptjs
- Auth routes for register, login, and logout
- Express protect middleware to verify JWT on protected routes
- Express authorize middleware to gate write operations by role
- React AuthContext with useContext for client-side role state
- Protected route wrapper that redirects unauthenticated users to login
- Role-conditional rendering that hides the Add Donation form from the user role
- Superadmin-only user management page for promoting and demoting registered users

Sign-up flow:

1. Any visitor can register and is assigned the user role by default.
2. The Superadmin reviews registered users and promotes selected ones to admin.
3. Superadmin credentials are seeded directly from .env on server startup and are never exposed through the sign-up form.

### Other Planned Improvements

- Export to CSV and PDF for filtered donor lists and dashboard reports
- Email notifications to donors on status change using Nodemailer
- Audit log tracking who created, edited, or deleted each record with timestamps
- Interactive charts using Recharts or Chart.js to replace the static bar charts
- Dark mode toggle stored in localStorage
- Unit and integration tests using Jest, Supertest, Vitest, and Testing Library

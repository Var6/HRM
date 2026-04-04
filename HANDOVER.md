# HRM System — Developer Handover Guide

> **Citizen Saving & Credit Cooperative Society**
> Stack: Next.js 16 (App Router) · TypeScript · MongoDB (Mongoose) · Tailwind CSS · Docker

---

## Table of Contents

1. [Directory Tree](#1-directory-tree)
2. [How the App Works](#2-how-the-app-works)
3. [Environment Setup](#3-environment-setup)
4. [What to Change & Where](#4-what-to-change--where)
   - [Company Name / Branding](#41-company-name--branding)
   - [Admin Credentials](#42-admin-credentials)
   - [MongoDB Connection](#43-mongodb-connection)
   - [Cloudinary (Photo Uploads)](#44-cloudinary-photo-uploads)
   - [Email / Payslip Sending](#45-email--payslip-sending)
   - [Sidebar Navigation Links](#46-sidebar-navigation-links)
   - [Employee Fields / Schema](#47-employee-fields--schema)
   - [Payroll Logic](#48-payroll-logic)
   - [Leave Types & Balances](#49-leave-types--balances)
   - [Adding a New Page](#410-adding-a-new-page)
   - [Adding a New API Route](#411-adding-a-new-api-route)
5. [Auth Flow](#5-auth-flow)
6. [Docker](#6-docker)
7. [Common Issues & Fixes](#7-common-issues--fixes)

---

## 1. Directory Tree

```
HRM/
├── app/                          # Next.js App Router — every folder = a URL
│   ├── page.tsx                  # Home/landing page (/)
│   ├── layout.tsx                # Root HTML shell, loads globals.css
│   ├── globals.css               # Global Tailwind styles
│   ├── not-found.tsx             # 404 page
│   │
│   ├── login/
│   │   └── page.tsx              # ★ UNIFIED login page (employee + admin toggle)
│   │
│   ├── hr/login/
│   │   └── page.tsx              # Redirects → /login  (keep for old links)
│   │
│   ├── employee/
│   │   ├── login/page.tsx        # Redirects → /login  (keep for old links)
│   │   ├── dashboard/page.tsx    # Employee home after login
│   │   ├── profile/page.tsx      # View/edit own profile
│   │   ├── leaves/page.tsx       # Apply & view leave requests
│   │   ├── attendance-requests/  # Attendance correction requests
│   │   ├── checkin/page.tsx      # Daily check-in/out
│   │   ├── data-requests/        # Request data changes
│   │   ├── expenses/page.tsx     # Expense claims
│   │   ├── leave-encashment/     # Leave encashment requests
│   │   └── payslips/page.tsx     # View/download payslips
│   │
│   ├── Dashboard/                # HR Admin area (requires hrSession in localStorage)
│   │   ├── layout.tsx            # Wraps all admin pages: Sidebar + NotificationBell
│   │   ├── page.tsx              # Admin dashboard home
│   │   ├── employees/
│   │   │   ├── page.tsx          # Employee list
│   │   │   └── [slug]/page.tsx   # Individual employee detail/edit
│   │   ├── attendance/
│   │   │   ├── page.tsx          # Attendance overview
│   │   │   └── [employeeId]/     # Per-employee attendance
│   │   ├── attendance-requests/  # Approve/reject attendance corrections
│   │   ├── payroll/
│   │   │   ├── page.tsx          # Payroll list & bulk processing
│   │   │   └── [slug]/page.tsx   # Monthly payroll detail for one employee
│   │   ├── payrolldetails/
│   │   │   ├── page.tsx          # Payroll history list
│   │   │   └── [employee]/       # Payroll history for one employee
│   │   ├── approvals/page.tsx    # Leave/request approvals
│   │   ├── requests/page.tsx     # All pending requests
│   │   ├── reports/page.tsx      # Salary, PF/ESI, TDS, bank transfer reports
│   │   ├── recruitment/          # Job postings & applicants
│   │   ├── performance/          # Employee performance reviews
│   │   ├── holidays/page.tsx     # Holiday calendar management
│   │   └── exit-interviews/      # Exit interview records
│   │
│   └── api/                      # All backend API routes (Next.js Route Handlers)
│       ├── employee-auth/login/  # POST — employee login
│       ├── employees/            # GET/POST list; [id] GET/PUT/DELETE one
│       ├── attendance/           # GET/POST; [employeeId] per-employee
│       ├── attendance-requests/  # CRUD attendance corrections
│       ├── checkins/             # Employee check-in/out records
│       ├── leaves/               # CRUD leave requests; [id] one leave
│       ├── leave-encashments/    # Leave encashment CRUD
│       ├── holidays/             # Holiday CRUD
│       ├── payroll/              # Main payroll processing
│       │   ├── route.ts          # GET list / POST process payroll
│       │   ├── [id]/download/    # GET — download payslip HTML
│       │   ├── approve-with-lop/ # POST — approve with loss-of-pay
│       │   ├── employee/         # GET payroll for one employee
│       │   ├── history/          # Payroll history
│       │   ├── hold-salary/      # PUT — put salary on hold
│       │   ├── manual-deductions/# POST — add manual deductions
│       │   ├── send-payslip/     # POST — email payslip
│       │   ├── update-status/    # PUT — mark paid/unpaid
│       │   └── reports/          # Sub-routes: salary-register, pf-esic, tds,
│       │                         #   bank-transfer, department-analysis, loan-advance
│       ├── notifications/        # CRUD + mark-read + clear-all + unread count
│       ├── performance/          # Performance reviews CRUD
│       ├── increments/           # Salary increment CRUD
│       ├── data-change-requests/ # Employee data change requests
│       ├── exit-interviews/      # Exit interview CRUD
│       ├── expense-claims/       # Expense claim CRUD
│       ├── upload/               # POST — upload image to Cloudinary
│       └── seeds/employees/      # POST — seed test employees (dev only)
│
├── components/
│   ├── ui/
│   │   ├── sidebar.tsx           # ★ Admin sidebar nav (edit to add menu items)
│   │   ├── navbar.tsx            # Top navbar (employee portal)
│   │   ├── footer.tsx            # Footer
│   │   ├── NotificationBell.tsx  # Bell icon + dropdown for admin notifications
│   │   └── ToastProvider.tsx     # Global toast notifications
│   ├── employee/
│   │   └── EmployeeNavbar.tsx    # Navbar for employee-facing pages
│   ├── payslip/
│   │   ├── ApprovalModal.tsx     # Bulk payroll approval modal
│   │   ├── DownloadPayslipButton.tsx  # Download button on payslip page
│   │   └── PayslipDocument.tsx   # Payslip PDF layout component
│   └── ux/
│       └── login.tsx             # (legacy, unused — kept for reference)
│
├── models/                       # Mongoose schemas — one file per collection
│   ├── Employee.ts               # ★ Main employee document
│   ├── Attendance.ts             # Daily attendance records
│   ├── AttendanceRequest.ts      # Correction requests
│   ├── EmployeeCheckin.ts        # Check-in/out timestamps
│   ├── LeaveRequest.ts           # Leave applications
│   ├── LeaveEncashment.ts        # Leave encashment requests
│   ├── PayrollHistory.ts         # Processed payroll records
│   ├── Notification.ts           # Admin notifications
│   ├── Holiday.ts                # Holiday list
│   ├── Increment.ts              # Salary increment history
│   ├── Performance.ts            # Performance reviews
│   ├── DataChangeRequest.ts      # Employee data-edit requests
│   ├── ExitInterview.ts          # Exit interview data
│   └── ExpenseClaim.ts           # Expense claims
│
├── lib/
│   ├── mongodb.ts                # ★ DB connection (reads MONGODB_URI from .env)
│   ├── cloudinary.ts             # Cloudinary SDK config (reads env vars)
│   ├── attendance-utils.ts       # Shared attendance calculation helpers
│   ├── notification-helpers.ts   # Create/query notifications
│   ├── payroll-export-helpers.ts # Excel export helpers for payroll reports
│   └── payslip-utils.tsx         # Payslip generation utilities
│
├── types/
│   └── types.ts                  # ★ All shared TypeScript interfaces
│
├── .env.local                    # ★ Secret config — NEVER commit this
├── dockerfile                    # Multi-stage Docker build
├── next.config.ts                # Next.js config
├── package.json
└── tsconfig.json
```

---

## 2. How the App Works

```
Browser
  │
  ├─ / (home)          → Two cards → both go to /login
  │
  ├─ /login            → Toggle: Employee | HR Admin
  │     Employee tab   → POST /api/employee-auth/login
  │                      ✓ stores employeeData in localStorage
  │                      ✓ redirect → /employee/dashboard
  │     Admin tab      → checks hardcoded creds (see §4.2)
  │                      ✓ stores hrSession in localStorage
  │                      ✓ redirect → /Dashboard
  │
  ├─ /employee/*       → Employee self-service pages
  │     Auth check     → reads localStorage.employeeData
  │
  └─ /Dashboard/*      → HR admin pages
        Auth check     → reads localStorage.hrSession
        Layout         → Sidebar (components/ui/sidebar.tsx)
                         NotificationBell (components/ui/NotificationBell.tsx)
```

**Data flow for every API call:**
```
Page component
  → fetch('/api/...')
    → app/api/.../route.ts
      → connectDB()   (lib/mongodb.ts)
        → Mongoose Model query
          → MongoDB Atlas / local MongoDB
```

---

## 3. Environment Setup

Create `.env.local` in the project root (never commit this file):

```env
# MongoDB — local dev
MONGODB_URI=mongodb://localhost:27017/hrm

# MongoDB — production Atlas example
# MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/hrm

# Cloudinary — for employee photo uploads
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Run locally:
```bash
npm install
npm run dev       # http://localhost:3000
```

---

## 4. What to Change & Where

### 4.1 Company Name / Branding

| What | File | What to edit |
|------|------|-------------|
| Name on login page | `app/login/page.tsx` | Line with `"Citizen Saving & Credit"` and `"Cooperative Society"` |
| Name on home page header | `app/page.tsx` | `"Citizen Saving & Credit"` and `"Cooperative Society"` text |
| Name in admin sidebar | `components/ui/sidebar.tsx` | `"HRM Pro"` heading text |
| Name in payslips | `app/api/payroll/[id]/download/route.ts` | `"CSCC Society"` in `generatePayslipHTML()` |
| Contact email on login | `app/employee/login/page.tsx` (old) or `app/login/page.tsx` | `hr@citizencooperative.in` |
| Copyright footer | `app/page.tsx` | `© 2026 Citizen Saving...` line at bottom |

---

### 4.2 Admin Credentials

Admin login is currently **hardcoded** in one place only:

**File:** `app/login/page.tsx`

```ts
// Lines near the top of the file
const ADMIN_USERNAME = 'Citizen Cooperative';
const ADMIN_PASSWORD = 'India@1947';
```

Change both values to your desired credentials. The login check is in `handleSubmit()` in the same file.

> **Security note:** These are plain-text hardcoded credentials. For a production system, move them to `.env.local` and read via `process.env`.

---

### 4.3 MongoDB Connection

**File:** `.env.local`

```env
MONGODB_URI=mongodb://localhost:27017/hrm
```

- Local MongoDB: `mongodb://localhost:27017/hrm`
- MongoDB Atlas: `mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/<dbname>`

The connection code lives in `lib/mongodb.ts` — you do not need to touch it.

---

### 4.4 Cloudinary (Photo Uploads)

Employee photo upload uses Cloudinary. Config is in `.env.local`:

```env
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

The SDK is configured in `lib/cloudinary.ts`. The upload API endpoint is `app/api/upload/route.ts`.

To change the upload folder (currently uploads to root of Cloudinary):
- Edit `app/api/upload/route.ts` — add `folder: 'hrm-employees'` to the upload options.

---

### 4.5 Email / Payslip Sending

Payslip emails are sent via `app/api/payroll/send-payslip/route.ts`.
Check that file for the email provider config (SMTP credentials). Add SMTP env vars to `.env.local` as needed.

---

### 4.6 Sidebar Navigation Links

**File:** `components/ui/sidebar.tsx`

The `navItems` array controls what appears in the HR admin sidebar:

```ts
const navItems = [
  { icon: Home,     label: 'Dashboard',   href: '/Dashboard' },
  { icon: Users,    label: 'Employees',   href: '/Dashboard/employees' },
  { icon: Calendar, label: 'Attendance',  href: '/Dashboard/attendance' },
  { icon: Clock,    label: 'Requests',    href: '/Dashboard/requests' },
  { icon: FileText, label: 'Payroll',     href: '/Dashboard/payroll' },
  { icon: BarChart3,label: 'Reports',     href: '/Dashboard/reports' },
  { icon: Briefcase,label: 'Recruitment', href: '/Dashboard/recruitment' },
  { icon: Award,    label: 'Performance', href: '/Dashboard/performance' },
];
```

- **Add a link:** Add a new object to the array. Import the icon from `lucide-react`.
- **Remove a link:** Delete the object from the array.
- **Rename:** Change the `label` string.

---

### 4.7 Employee Fields / Schema

The Employee MongoDB document is defined in **`models/Employee.ts`**.

To add a new field (e.g., `emergencyContact`):

1. **Add to Mongoose schema** in `models/Employee.ts`:
   ```ts
   emergencyContact: String,
   ```

2. **Add to TypeScript type** in `types/types.ts` — find the relevant interface and add:
   ```ts
   emergencyContact?: string;
   ```

3. **Show it in the UI** — edit `app/Dashboard/employees/[slug]/page.tsx` to render the field.

4. **Allow editing** — add an input field in the same page's form, make sure the PUT request to `/api/employees/[id]` includes the field.

---

### 4.8 Payroll Logic

Payroll is processed in **`app/api/payroll/route.ts`** (POST handler).

Key calculations happen there:
- Gross salary = sum of all earnings components
- Deductions = PF + ESI + TDS + advance + loan + LOP
- Net salary = Gross - Total deductions

**Earnings components** are stored per-employee in `Employee.salary.earnings` (set when editing an employee).

**To change PF/ESI rates:**
Search for `0.12` (12% PF) or `0.0075` / `0.0325` (ESI rates) in `app/api/payroll/route.ts` and update.

**Payslip HTML template:**
`app/api/payroll/[id]/download/route.ts` — function `generatePayslipHTML()` at the bottom. Edit the HTML/CSS there to change the payslip layout.

---

### 4.9 Leave Types & Balances

Leave types are defined in the `LeaveSchema` in `models/Employee.ts`:

```ts
const LeaveSchema = new mongoose.Schema({
  casualLeave:        Number,
  earnedLeave:        Number,
  halfDayLeave:       Number,
  sickLeave:          Number,
  extraordinaryLeave: Number,
});
```

To add a leave type:
1. Add the field to `LeaveSchema` in `models/Employee.ts`
2. Update `types/types.ts` if a Leave interface exists there
3. Update the leave UI in `app/employee/leaves/page.tsx` and `app/Dashboard/approvals/page.tsx`

---

### 4.10 Adding a New Page

Example: adding `/Dashboard/training`

1. Create the file:
   ```
   app/Dashboard/training/page.tsx
   ```

2. Basic page template:
   ```tsx
   'use client';
   export default function TrainingPage() {
     return <div className="p-6">Training content here</div>;
   }
   ```
   It will automatically use `app/Dashboard/layout.tsx` (Sidebar + header).

3. Add to sidebar — see §4.6.

---

### 4.11 Adding a New API Route

Example: `/api/training`

1. Create:
   ```
   app/api/training/route.ts
   ```

2. Template:
   ```ts
   import { NextRequest, NextResponse } from 'next/server';
   import { connectDB } from '@/lib/mongodb';
   // import YourModel from '@/models/YourModel';

   export async function GET(req: NextRequest) {
     await connectDB();
     // const data = await YourModel.find();
     return NextResponse.json({ success: true, data: [] });
   }

   export async function POST(req: NextRequest) {
     await connectDB();
     const body = await req.json();
     // const doc = await YourModel.create(body);
     return NextResponse.json({ success: true });
   }
   ```

3. For routes with a URL parameter (e.g., `/api/training/[id]`):
   ```
   app/api/training/[id]/route.ts
   ```
   ```ts
   export async function GET(
     req: NextRequest,
     { params }: { params: Promise<{ id: string }> }   // ← must be Promise in Next.js 15+
   ) {
     const { id } = await params;
     // ...
   }
   ```

---

## 5. Auth Flow

There is **no JWT or session library** — auth state lives in `localStorage`.

| Role | localStorage key | Set by | Checked by |
|------|-----------------|--------|------------|
| Employee | `employeeData` | `app/login/page.tsx` after API success | Each employee page on mount |
| HR Admin | `hrSession` | `app/login/page.tsx` after credential match | Each Dashboard page on mount |

**To log out:**
Pages call `localStorage.removeItem('employeeData')` or `localStorage.removeItem('hrSession')` and redirect to `/login`.

**To add route protection:**
Each page currently does its own `useEffect` check. There is no middleware-level protection. If you want to add it, create `middleware.ts` at the project root and use Next.js middleware to check cookies instead of localStorage.

---

## 6. Docker

Build image:
```bash
docker build -t hrm:latest .
```

Run container (connect to a running MongoDB):
```bash
docker run -p 3000:3000 \
  -e MONGODB_URI=mongodb://host.docker.internal:27017/hrm \
  -e CLOUDINARY_CLOUD_NAME=xxx \
  -e CLOUDINARY_API_KEY=xxx \
  -e CLOUDINARY_API_SECRET=xxx \
  hrm:latest
```

> `host.docker.internal` lets the container reach MongoDB running on your host machine.

The `dockerfile` is a multi-stage build:
- `deps` stage — installs `node_modules`
- `builder` stage — runs `npm run build`
- `runner` stage — copies the built app, runs `npm start` on port 3000

---

## 7. Common Issues & Fixes

| Error | Cause | Fix |
|-------|-------|-----|
| `Please add MONGODB_URI in .env.local` | Missing env var | Create `.env.local` with `MONGODB_URI=...` |
| `Property 'X' does not exist on type 'SalaryStructure'` | Field used in code but missing from TS type | Add the field to the interface in `types/types.ts` |
| `params` type error in API route | Next.js 15+ requires `params: Promise<{...}>` | Use `const { id } = await params;` pattern — see §4.11 |
| Build error: `interface` inside function body | TypeScript syntax error | `interface` declarations cannot go inside functions. Move them to the top of the file or `types/types.ts` |
| MongoDB connection refused in Docker | Container can't reach `localhost` MongoDB | Use `host.docker.internal` instead of `localhost` in `MONGODB_URI` |
| Employee can't log in | Password is mobile number by default | Employee password = their `mobileNumber` field in the DB |
| Cloudinary upload fails | Wrong env vars | Double-check `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` in `.env.local` |

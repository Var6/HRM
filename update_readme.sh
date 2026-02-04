#!/bin/bash

cat > /Users/rishabhranjan/Desktop/HRM/README_NEW.md << 'ENDOFFILE'
# HRM - Human Resource Management System

A comprehensive HRMS built with Next.js, TypeScript, MongoDB, and Tailwind CSS. Features employee self-service, HR administration, attendance tracking, payroll management, and performance reviews.

![Next.js](https://img.shields.io/badge/Next.js-16.1.6-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green)
![License](https://img.shields.io/badge/license-MIT-blue)

---

## 🚀 Features

### Employee Self-Service Portal
- ✅ **Daily Check-in/Check-out** - Geolocation-based attendance tracking
- ✅ **Attendance Requests** - Request past attendance marking with approval workflow
- ✅ **Leave Management** - Apply for leaves, view balance, track approvals
- ✅ **Leave Encashment** - Convert unused leaves to cash
- ✅ **Expense Claims** - Submit expense reimbursements with receipts
- ✅ **Profile Management** - Update personal information
- ✅ **Payslip Access** - View and download monthly payslips

### HR Administration
- ✅ **Employee Management** - Add, edit, view employee records
- ✅ **Attendance Tracking** - Mark attendance, view reports, approve requests
- ✅ **Leave Approvals** - Approve/reject leave requests
- ✅ **Unified Approvals Dashboard** - Expenses, encashments, exit interviews
- ✅ **Payroll Management** - Generate payslips, salary processing
- ✅ **Exit Interviews** - Conduct comprehensive exit surveys
- ✅ **Performance Reviews** - Employee performance management
- ✅ **Recruitment** - Job postings and applicant tracking
- ✅ **Holiday Calendar** - Manage company holidays
- ✅ **Notifications** - System-wide announcements

### Reports & Analytics
- 📊 Monthly attendance reports
- 📊 Leave balance tracking
- 📊 Payroll summaries
- 📊 Expense analytics
- 📊 Performance metrics

---

## 🛠️ Tech Stack

- **Framework:** Next.js 16.1.6 (App Router)
- **Language:** TypeScript
- **Database:** MongoDB with Mongoose ODM
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **File Upload:** Cloudinary (configured)
- **Authentication:** Session-based (localStorage)
- **Deployment:** Vercel-ready

---

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- MongoDB Atlas account or local MongoDB
- npm/yarn/pnpm

### Setup Steps

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd HRM
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**
Create a `.env.local` file:
```env
MONGODB_URI=your_mongodb_connection_string
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

4. **Seed the database (optional)**
```bash
npm run dev
# In another terminal:
curl -X POST http://localhost:3000/api/seeds/employees
```

5. **Start development server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔐 Login Credentials

### HR Portal
```
URL: http://localhost:3000/hr/login
Username: Citizen Cooperative
Password: India@1947
```

### Employee Portal
```
URL: http://localhost:3000/employee/login
Employee Code: EMP001 to EMP005
Password: 9876543210
```

---

## 📁 Project Structure

```
HRM/
├── app/
│   ├── api/                    # API routes
│   │   ├── attendance/         # Attendance APIs
│   │   ├── checkins/          # Check-in/check-out APIs
│   │   ├── employees/         # Employee management
│   │   ├── expense-claims/    # Expense claim APIs
│   │   ├── leave-encashments/ # Leave encashment APIs
│   │   ├── leaves/            # Leave management
│   │   ├── payroll/           # Payroll processing
│   │   └── ...
│   ├── Dashboard/             # HR admin pages
│   │   ├── attendance/        # Attendance management
│   │   ├── approvals/         # Unified approvals
│   │   ├── employees/         # Employee directory
│   │   ├── payroll/           # Payroll management
│   │   └── ...
│   └── employee/              # Employee portal pages
│       ├── checkin/           # Daily check-in
│       ├── attendance-requests/ # Request attendance
│       ├── expenses/          # Expense claims
│       ├── leaves/            # Leave requests
│       └── ...
├── components/                # React components
│   ├── employee/             # Employee-specific components
│   ├── payslip/              # Payslip components
│   └── ui/                   # Shared UI components
├── models/                   # Mongoose schemas
│   ├── Employee.ts
│   ├── Attendance.ts
│   ├── EmployeeCheckin.ts
│   ├── LeaveRequest.ts
│   ├── ExpenseClaim.ts
│   └── ...
├── lib/                      # Utilities & helpers
└── types/                    # TypeScript types
```

---

## 🎯 Key Features Guide

### 1. Employee Check-in
Employees can check-in/check-out daily with geolocation tracking:
- Navigate to `/employee/checkin`
- Click "Check In" (allows location access)
- System captures location and timestamp
- Click "Check Out" to end the day
- View last 7 days history

### 2. Attendance Requests
Request attendance for past dates:
- Go to `/employee/attendance-requests`
- Select date, status (Present/Half Day), reason
- HR approves from `/Dashboard/attendance-requests`
- Attendance auto-created on approval

### 3. Leave Encashment
Convert unused leaves to cash:
- Visit `/employee/leave-encashment`
- Select leave type, enter days and rate
- System calculates total amount
- HR approves from `/Dashboard/approvals`

### 4. Expense Claims
Submit reimbursement requests:
- Go to `/employee/expenses`
- Add multiple expenses (Travel, Food, Medical, etc.)
- Upload receipts (optional)
- HR reviews and approves

### 5. Exit Interviews
Comprehensive exit process:
- HR conducts from `/Dashboard/exit-interviews`
- Captures ratings, feedback, settlement
- Auto-updates employee status to "Left"

---

## 📊 API Documentation

Comprehensive API documentation available in:
- [REPORTS_API_DOCUMENTATION.md](REPORTS_API_DOCUMENTATION.md)

### Key Endpoints

**Authentication:**
- `POST /api/employee-auth/login` - Employee login
- `POST /api/hr-auth/login` - HR login

**Attendance:**
- `GET/POST /api/checkins` - Check-in/check-out
- `GET/POST /api/attendance` - Attendance records
- `GET/POST/PATCH /api/attendance-requests` - Attendance requests

**Leave Management:**
- `GET/POST /api/leaves` - Leave requests
- `GET/POST/PATCH /api/leave-encashments` - Leave encashment

**Expenses:**
- `GET/POST/PATCH /api/expense-claims` - Expense claims

**Payroll:**
- `GET/POST /api/payroll` - Payroll management

---

## 🏗️ Build & Deploy

### Development
```bash
npm run dev
```

### Production Build
```bash
npm run build
npm start
```

### Deploy to Vercel
```bash
vercel
```

The app is optimized for Vercel deployment with automatic builds and previews.

---

## 📚 Documentation

- [NEW_FEATURES_IMPLEMENTATION.md](NEW_FEATURES_IMPLEMENTATION.md) - Latest features guide
- [FRAPPE_HRMS_FEATURES.md](FRAPPE_HRMS_FEATURES.md) - Feature comparison
- [FOLDER_STRUCTURE.md](FOLDER_STRUCTURE.md) - Detailed folder structure
- [QUICK_REFERENCE.md](QUICK_REFERENCE.md) - Quick navigation guide
- [PAYROLL_ENHANCEMENTS.md](PAYROLL_ENHANCEMENTS.md) - Payroll features

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License.

---

## 👥 Support

For issues and questions:
- Create an issue on GitHub
- Email: support@yourcompany.com

---

## 🎉 Acknowledgments

Built with inspiration from:
- [Frappe HRMS](https://github.com/frappe/hrms)
- Next.js documentation
- MongoDB best practices

---

**Last Updated:** February 5, 2026  
**Version:** 2.0.0  
**Status:** ✅ Production Ready
ENDOFFILE

# Replace the old README with the new one
mv /Users/rishabhranjan/Desktop/HRM/README_NEW.md /Users/rishabhranjan/Desktop/HRM/README.md

echo "README.md has been successfully updated!"

# School Management System (SMS)

A production-grade, offline-first School Management System designed for Pakistani private and public schools. Featuring lifetime student academic records, 3-copy monthly fee challans with arrears and sibling discounts, biometric/clerk staff check-in with automatic late & absent salary deductions, examination gazettes with A4 report cards, institutional expenses & profit reports, and one-click database backups.

---

## Tech Stack

- **Frontend**: Next.js 16 (App Router, Turbopack, Tailwind CSS, TypeScript)
- **Backend**: Express.js (Node.js ES Modules, RESTful APIs, JWT Auth, Bcrypt)
- **Database & ORM**: SQLite (`prisma/dev.db`) via Prisma ORM 6 (fully PostgreSQL-compatible schema)
- **Formatters**: Pakistani Rupee (`Rs.`), `DD/MM/YYYY`, CNIC/B-Form (`12345-1234567-1`), Phone (`03XX-XXXXXXX`)

---

## Quick Start (3 Commands)

1. **Install dependencies**:
   ```bash
   npm install && npm --prefix express-backend install && npm --prefix frontend install
   ```
2. **Setup Database & Seed Demo Data**:
   ```bash
   npm run setup
   ```
   *(Pushes schema to SQLite and seeds 124 students across 10 classes, 19 staff members, 3 months attendance, challans, exam results, and payroll).*

3. **Start Application (Concurrent Backend & Frontend)**:
   ```bash
   npm run dev
   ```
   - **Frontend**: [http://localhost:3000](http://localhost:3000) (Opens directly at `/login`)
   - **Backend API**: [http://localhost:5000/api](http://localhost:5000/api)

---

## Demo Login Accounts

| Role | Username | Password | Access Privileges |
|------|----------|----------|-------------------|
| **Admin** | `admin` | `admin123` | Full control: system settings, all modules, DB backup download, audit logs |
| **Principal** | `principal` | `principal123` | Read-all visibility + administrative approvals (leaves, exam lock, promotions) |
| **Accountant** | `accountant` | `accountant123` | Financial operations: fee challans, payments, expenses, payroll execution |
| **Teacher** | `teacher` | `teacher123` | Classroom operations: student attendance, marks entry, daily diary, own salary slips |

---

## Folder Structure

```
school-management/
├── dev.js                     # Unified dev orchestrator (starts Express + Next.js)
├── docker-compose.yml         # Container configuration for backend & frontend
├── package.json               # Root scripts: setup, dev, dev:backend, dev:frontend
├── README.md                  # System manual and demo walkthrough
│
├── express-backend/           # RESTful API Server
│   ├── prisma/
│   │   ├── schema.prisma      # 17 models: Student, Staff, FeeChallan, Payroll, etc.
│   │   ├── dev.db             # Persistent SQLite database
│   │   └── seed.js            # Realistic seed generator (124 students, Pakistani CNICs)
│   ├── src/
│   │   ├── controllers/       # Business logic (attendance, fees, payroll, exams, etc.)
│   │   ├── routes/            # Express endpoint routers (/api/students, /api/fees...)
│   │   ├── db.js              # Prisma client singleton
│   │   └── index.js           # Main Express server entry point
│   ├── Dockerfile
│   └── package.json
│
└── frontend/                  # Next.js 16 Web Application
    ├── src/
    │   ├── app/               # App Router pages (/login, /students, /fees, /payroll...)
    │   ├── components/        # Layout (Sidebar, Topbar) & UI (Modal, Button, Badge)
    │   ├── lib/formatters.ts  # Pakistani currency (PKR), CNIC, Phone, Date formatters
    │   ├── services/          # Client API services (studentService, feeService...)
    │   └── types/             # TypeScript data contracts and role definitions
    ├── Dockerfile
    └── package.json
```

---

## How to Reset Demo Data

To wipe and re-seed the system with fresh Pakistani demo records at any time:
```bash
npm run setup
```
This re-initializes `express-backend/prisma/dev.db` with default settings, 124 students (Prep to Class 10), 19 teachers and staff, class fee schedules, sample challans, attendance, and exam records.

---

## How to Backup Database

1. Log in as **Admin**.
2. Navigate to **Database Backup** in the sidebar (`/backup`).
3. Click the **"Download Database (.db)"** button.
4. An immediate download of `dev.db` with current timestamp is initiated. Store this file in a secure location. To restore, simply place the `.db` file in `express-backend/prisma/dev.db`.
5. Review the system **Audit Log** on the same screen to inspect changes made to fees, attendance, marks, and salaries.

---

## Live Client Demo Walkthrough

Follow this step-by-step sequence during the live client demonstration:

1. **New Admission with B-Form & Documents**:
   - Log in as `admin` or `principal`.
   - Go to **Students** (`/students`) and click **"New Admission"**.
   - Fill in Student Name (English + Urdu: e.g. *Muhammad Hamza / محمد حمزہ*), B-Form (`37405-1234567-1`), DOB, Gender, Religion (`Islam`), Blood Group (`B+`).
   - Enter Father CNIC (`37405-7654321-3`). If siblings exist in the system with this Father CNIC, notice the automatic **Sibling Detected (20% Tuition Discount)** indicator.
   - Check mandatory documents verified (B-Form, Father CNIC, Birth Certificate, Previous School Leaving Certificate, Photos).
   - Click **"Register Student"**. The student is assigned a permanent, lifetime Admission / General Register (GR) Number.

2. **Print Admission Form**:
   - On the Students directory, click the student's name or **"View Profile"**.
   - Click **"Print Admission Form"**.
   - An A4 official admission document opens in print preview, complete with school letterhead, student details, parent particulars, document verification list, and office signature lines.

3. **Generate and Print Fee Challan**:
   - Go to **Fee Management** (`/fees`).
   - Click **"Generate Monthly Challan"**, select the current month (e.g. `February 2026`) and Target (`Whole School` or specific class).
   - Click **"Generate"**. Challans are calculated with tuition, exam fees, annual funds, sibling discounts, and unpaid arrears brought forward.
   - Click **"Print Challan"** on any issued record. An official Pakistani 3-copy challan opens on a single A4 page with **Bank Copy**, **School Copy**, and **Student Copy** side-by-side, complete with due date and late surcharge notice.

4. **Receive Fee Payment**:
   - In **Fee Management**, click **"Receive Payment"** on an unpaid or partial challan.
   - Select Payment Method (`Cash` or `Bank Transfer`), enter the amount received (supports partial or full settlement), and click **"Record Payment"**.
   - Click **"Print Receipt"** to print the payment voucher.

5. **Student Daily Attendance**:
   - Go to **Attendance** (`/attendance`).
   - Select Date and Class (e.g. `Class 10 - A`).
   - Mark students as `Present`, `Absent`, `Late`, or `Half Day`. Click **"Save Attendance"**.

6. **Teacher Check-in and Automatic Late Calculation**:
   - Go to **Staff Attendance** (`/staff-attendance`).
   - Notice the School Start Time configured from Settings (e.g. `08:00 AM`).
   - Record check-in for a teacher at `08:15 AM`. The system automatically computes and tags the record as **LATE (15 min)**.

7. **Run Monthly Payroll with Automatic Deductions**:
   - Log in as `accountant` or `admin` and go to **Payroll** (`/payroll`).
   - Select Month (`February 2026`) and click **"Generate Monthly Payroll"**.
   - Observe automatic deductions applied:
     - Teachers with 3 lates have **1 full day salary deducted** (`Basic / Working Days`).
     - Absent days without approved leave have unexcused absence cuts.
   - Click **"Adjust"** on any row to add manual bonuses or allowances with an audit reason.
   - Click **"Print Pay Slip"** for an A4 individual salary certificate, or **"Print Payroll Sheet"** for the master monthly register.
   - Click **"Mark as Paid"** to finalize bank transfer.

8. **Enter Marks and Print Student Report Card**:
   - Go to **Exams & Results** (`/exams`).
   - Select Exam Term (`Mid-Term Examination 2026`), Class (`Class 10 - A`), and Subject (`Mathematics`).
   - Enter marks (validation prevents entering marks above Maximum Marks). Click **"Save Marks"**.
   - As Principal, click **"Lock Results"** to prevent further tampering.
   - Open **"Result Gazette"** to view class-wide positions, percentages, and pass/fail summary.
   - Click **"Print Report Card"** on any student to render the complete A4 academic grade card with subject-wise breakdown, percentage, grade, position, attendance rate, and principal remarks.

9. **Dashboard Overview**:
   - Navigate to **Dashboard** (`/dashboard`).
   - Observe live real-time metrics pulled directly from the SQLite database: Total Active Students, Present Staff, Monthly Fee Collection (PKR), Pending Defaulters, and Recent Admissions.

---

## Phase 2 Roadmap (Upcoming Modules)

- **Parent & Student Mobile Portal**: Dedicated portal for parents to view attendance, exam report cards, and fee challans online.
- **SMS & WhatsApp Notifications**: Automated SMS/WhatsApp alerts for absent students, fee challan issuance, and payment receipts.
- **Library Management**: Book catalogue, barcode circulation, issue/return tracking, and overdue book fines.
- **Transport & Route Management**: Van routes, driver profiles, student vehicle allocation, and monthly transport fees.
- **Class Timetable & Teacher Scheduling**: Weekly timetable builder with teacher substitution alerts for absent staff.

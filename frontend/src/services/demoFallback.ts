// Demo Fallback Store for Vercel Client Demonstration when backend is offline

export function getDemoFallback(endpoint: string, options: RequestInit = {}): any {
  const cleanEndpoint = endpoint.split("?")[0].toLowerCase();
  const body = options.body ? JSON.parse(options.body as string) : {};

  // Auth Login
  if (cleanEndpoint.includes("login") || cleanEndpoint.includes("auth")) {
    const { username } = body;
    const lowerUser = (username || "").toLowerCase();
    let role = "Admin";
    let name = "Talha Khan";

    if (lowerUser.includes("principal")) {
      role = "Principal";
      name = "Prof. Muhammad Tariq Mehmood";
    } else if (lowerUser.includes("accountant")) {
      role = "Accountant";
      name = "Bilal Siddiqui";
    } else if (lowerUser.includes("teacher")) {
      role = "Teacher";
      name = "Sir Ahmed Farooq";
    }

    return {
      token: "demo-jwt-token-verified-2026",
      user: {
        id: 1,
        name,
        email: `${role.toLowerCase()}@alilm.edu.pk`,
        role,
      },
    };
  }

  // School Settings
  if (cleanEndpoint.includes("setting")) {
    return {
      id: 1,
      schoolName: "Al-Ilm Public High School",
      schoolUrduName: "العلم پبلک ہائی اسکول",
      regNo: "REG-LHR-2014-8842",
      address: "Street 4, Sector B-1, Johar Town, Lahore",
      phone: "042-35123456",
      mobile: "0300-1234567",
      email: "admin@alilm.edu.pk",
      principalName: "Prof. Muhammad Tariq Mehmood",
      sessionYear: "2025-2026",
      schoolStartTime: "08:00",
      lateGraceMinutes: 15,
      lateFinePerDay: 50,
      lateRuleDays: 3,
      casualLeaveQuota: 10,
      medicalLeaveQuota: 8,
      annualLeaveQuota: 10,
      workingDaysPerMonth: 26,
    };
  }

  // Dashboard Stats
  if (cleanEndpoint.includes("dashboard")) {
    return {
      role: "Admin",
      overview: {
        totalStudents: 124,
        totalTeachers: 19,
        totalClasses: 10,
        studentAttendancePct: 92,
        staffPresent: 18,
        staffLate: 1,
        feeCollected: 382000,
        feeOutstanding: 43000,
        defaultersCount: 6,
        totalExpenses: 78700,
        pendingLeaves: 2,
      },
      attendanceToday: {
        date: "15/11/2026",
        present: 112,
        absent: 8,
        late: 4,
        totalMarked: 124,
      },
      recentStudents: [
        {
          id: 1,
          admissionNo: "SMS-001",
          grNumber: "GR-1001",
          name: "Bilal Bhatti",
          fatherName: "Farhan Bhatti",
          fatherCnic: "35201-2007890-1",
          admissionDate: "2026-01-10",
          status: "Active",
          classSection: { name: "Play Group", section: "A" },
        },
        {
          id: 2,
          admissionNo: "SMS-002",
          grNumber: "GR-1002",
          name: "Anaya Ansari",
          fatherName: "Ali Ansari",
          fatherCnic: "35201-2011234-2",
          admissionDate: "2026-01-12",
          status: "Active",
          classSection: { name: "Play Group", section: "A" },
        },
        {
          id: 3,
          admissionNo: "SMS-003",
          grNumber: "GR-1003",
          name: "Hussein Jutt",
          fatherName: "Ahmed Jutt",
          fatherCnic: "35201-2015678-1",
          admissionDate: "2026-01-15",
          status: "Active",
          classSection: { name: "Play Group", section: "A" },
        },
      ],
      classDistribution: [
        { name: "Play Group (A)", count: 8, capacity: 40, tuitionFee: 4500 },
        { name: "Nursery (A)", count: 12, capacity: 35, tuitionFee: 5000 },
        { name: "Prep (A)", count: 14, capacity: 40, tuitionFee: 5200 },
        { name: "Class 1 (A)", count: 15, capacity: 35, tuitionFee: 5500 },
        { name: "Class 9 (A)", count: 20, capacity: 35, tuitionFee: 6500 },
        { name: "Class 10 (A)", count: 20, capacity: 35, tuitionFee: 7000 },
      ],
      setting: {
        schoolStartTime: "08:00 AM",
      },
    };
  }

  // Classes & Sections
  if (cleanEndpoint.includes("class")) {
    return [
      { id: 1, name: "Play Group", section: "A", classTeacher: "Sir Ahmed Farooq", room: "Room 101", capacity: 40, studentCount: 8 },
      { id: 2, name: "Nursery", section: "A", classTeacher: "Miss Fatima Zahra", room: "Room 102", capacity: 35, studentCount: 12 },
      { id: 3, name: "Prep", section: "A", classTeacher: "Sir Tariq Mehmood", room: "Room 103", capacity: 40, studentCount: 14 },
      { id: 4, name: "Class 1", section: "A", classTeacher: "Miss Ayesha Malik", room: "Room 104", capacity: 35, studentCount: 15 },
      { id: 5, name: "Class 2", section: "A", classTeacher: "Sir Bilal Qureshi", room: "Room 105", capacity: 30, studentCount: 15 },
      { id: 6, name: "Class 9", section: "A", classTeacher: "Sir Usman Ali", room: "Room 201", capacity: 35, studentCount: 20 },
      { id: 7, name: "Class 10", section: "A", classTeacher: "Sir Hamza Sheikh", room: "Room 202", capacity: 35, studentCount: 20 },
    ];
  }

  // Students Register
  if (cleanEndpoint.includes("student")) {
    return [
      {
        id: 1,
        admissionNo: "SMS-001",
        grNumber: "GR-1001",
        name: "Bilal Bhatti",
        fullName: "Bilal Bhatti",
        urduName: "بلال بھٹی",
        fatherName: "Farhan Bhatti",
        fatherCnic: "35201-2007890-1",
        fatherPhone: "0300-2109876",
        dob: "2018-05-12",
        admissionDate: "2026-01-10",
        gender: "Male",
        classSection: { name: "Play Group", section: "A" },
        status: "Active",
      },
      {
        id: 2,
        admissionNo: "SMS-002",
        grNumber: "GR-1002",
        name: "Anaya Ansari",
        fullName: "Anaya Ansari",
        urduName: "عنایہ انصاری",
        fatherName: "Ali Ansari",
        fatherCnic: "35201-2011234-2",
        fatherPhone: "0300-2154321",
        dob: "2018-08-20",
        admissionDate: "2026-01-12",
        gender: "Female",
        classSection: { name: "Play Group", section: "A" },
        status: "Active",
      },
      {
        id: 3,
        admissionNo: "SMS-003",
        grNumber: "GR-1003",
        name: "Hussein Jutt",
        fullName: "Hussein Jutt",
        urduName: "حسین جٹ",
        fatherName: "Ahmed Jutt",
        fatherCnic: "35201-2015678-1",
        fatherPhone: "0300-2201234",
        dob: "2018-02-14",
        admissionDate: "2026-01-15",
        gender: "Male",
        classSection: { name: "Play Group", section: "A" },
        status: "Active",
      },
      {
        id: 4,
        admissionNo: "SMS-004",
        grNumber: "GR-1004",
        name: "Khadija Chaudhry",
        fullName: "Khadija Chaudhry",
        urduName: "خدیجہ چوہدری",
        fatherName: "Farhan Chaudhry",
        fatherCnic: "35201-2017284-2",
        fatherPhone: "0300-2209865",
        dob: "2018-09-01",
        admissionDate: "2026-01-16",
        gender: "Female",
        classSection: { name: "Play Group", section: "A" },
        status: "Active",
      },
      {
        id: 5,
        admissionNo: "SMS-005",
        grNumber: "GR-1005",
        name: "Shahzaib Syed",
        fullName: "Shahzaib Syed",
        urduName: "شاہ زیب سید",
        fatherName: "Ali Syed",
        fatherCnic: "35201-2021605-1",
        fatherPhone: "0300-2259245",
        dob: "2018-04-18",
        admissionDate: "2026-01-18",
        gender: "Male",
        classSection: { name: "Play Group", section: "A" },
        status: "Active",
      },
      {
        id: 6,
        admissionNo: "SMS-006",
        grNumber: "GR-1006",
        name: "Sara Mirza",
        fullName: "Sara Mirza",
        urduName: "سارہ مرزا",
        fatherName: "Ahmed Mirza",
        fatherCnic: "35201-2025926-2",
        fatherPhone: "0300-2308625",
        dob: "2018-11-25",
        admissionDate: "2026-01-20",
        gender: "Female",
        classSection: { name: "Play Group", section: "A" },
        status: "Active",
      },
      {
        id: 7,
        admissionNo: "SMS-007",
        grNumber: "GR-1007",
        name: "Ali Gondal",
        fullName: "Ali Gondal",
        urduName: "علی گوندل",
        fatherName: "Hussein Gondal",
        fatherCnic: "35201-2030247-1",
        fatherPhone: "0300-2358005",
        dob: "2018-06-10",
        admissionDate: "2026-01-22",
        gender: "Male",
        classSection: { name: "Play Group", section: "A" },
        status: "Active",
      },
      {
        id: 8,
        admissionNo: "SMS-008",
        grNumber: "GR-1008",
        name: "Iqra Raja",
        fullName: "Iqra Raja",
        urduName: "اقراء راجہ",
        fatherName: "Mustafa Raja",
        fatherCnic: "35201-2034568-2",
        fatherPhone: "0300-2407385",
        dob: "2018-10-05",
        admissionDate: "2026-01-25",
        gender: "Female",
        classSection: { name: "Play Group", section: "A" },
        status: "Active",
      },
    ];
  }

  // Attendance
  if (cleanEndpoint.includes("attendance")) {
    return [
      { id: 1, studentId: 1, status: "Present", remarks: null, student: { id: 1, admissionNo: "SMS-001", fullName: "Bilal Bhatti", classSection: { name: "Play Group (A)" } } },
      { id: 2, studentId: 2, status: "Present", remarks: null, student: { id: 2, admissionNo: "SMS-002", fullName: "Anaya Ansari", classSection: { name: "Play Group (A)" } } },
      { id: 3, studentId: 3, status: "Present", remarks: null, student: { id: 3, admissionNo: "SMS-003", fullName: "Hussein Jutt", classSection: { name: "Play Group (A)" } } },
      { id: 4, studentId: 4, status: "Present", remarks: null, student: { id: 4, admissionNo: "SMS-004", fullName: "Khadija Chaudhry", classSection: { name: "Play Group (A)" } } },
      { id: 5, studentId: 5, status: "Late", remarks: "10 mins late", student: { id: 5, admissionNo: "SMS-005", fullName: "Shahzaib Syed", classSection: { name: "Play Group (A)" } } },
      { id: 6, studentId: 6, status: "Present", remarks: null, student: { id: 6, admissionNo: "SMS-006", fullName: "Sara Mirza", classSection: { name: "Play Group (A)" } } },
      { id: 7, studentId: 7, status: "Present", remarks: null, student: { id: 7, admissionNo: "SMS-007", fullName: "Ali Gondal", classSection: { name: "Play Group (A)" } } },
      { id: 8, studentId: 8, status: "Present", remarks: null, student: { id: 8, admissionNo: "SMS-008", fullName: "Iqra Raja", classSection: { name: "Play Group (A)" } } },
    ];
  }

  // Fee Challans
  if (cleanEndpoint.includes("fee")) {
    return [
      {
        id: 1,
        challanNumber: "CH-2026-0001",
        month: "February 2026",
        dueDate: "2026-02-10",
        tuitionFee: 4500,
        admissionFee: 0,
        annualFund: 500,
        examFee: 0,
        discount: 900,
        discountReason: "Sibling Concession (20%)",
        arrears: 0,
        totalAmount: 4100,
        lateFine: 200,
        status: "Paid",
        paidDate: "2026-02-08",
        paymentMethod: "Cash",
        student: { id: 1, admissionNo: "SMS-001", fullName: "Bilal Bhatti", fatherName: "Farhan Bhatti", classSection: { name: "Play Group (A)" } },
      },
      {
        id: 2,
        challanNumber: "CH-2026-0002",
        month: "February 2026",
        dueDate: "2026-02-10",
        tuitionFee: 4500,
        admissionFee: 0,
        annualFund: 500,
        examFee: 0,
        discount: 0,
        arrears: 0,
        totalAmount: 5000,
        lateFine: 200,
        status: "Unpaid",
        student: { id: 2, admissionNo: "SMS-002", fullName: "Anaya Ansari", fatherName: "Ali Ansari", classSection: { name: "Play Group (A)" } },
      },
      {
        id: 3,
        challanNumber: "CH-2026-0003",
        month: "February 2026",
        dueDate: "2026-02-10",
        tuitionFee: 4500,
        admissionFee: 0,
        annualFund: 500,
        examFee: 0,
        discount: 0,
        arrears: 1500,
        totalAmount: 6500,
        lateFine: 200,
        status: "Unpaid",
        student: { id: 3, admissionNo: "SMS-003", fullName: "Hussein Jutt", fatherName: "Ahmed Jutt", classSection: { name: "Play Group (A)" } },
      },
    ];
  }

  // Staff & Teachers
  if (cleanEndpoint.includes("teacher") || cleanEndpoint.includes("staff")) {
    return [
      { id: 1, name: "Sir Ahmed Farooq", email: "ahmed.farooq@alilm.edu.pk", phone: "0300-1234567", role: "Teacher", designation: "Senior Mathematics Teacher", salary: 55000, joinedDate: "2021-08-15", status: "Active" },
      { id: 2, name: "Miss Fatima Zahra", email: "fatima.zahra@alilm.edu.pk", phone: "0312-9876543", role: "Teacher", designation: "Physics Lecturer", salary: 50000, joinedDate: "2022-01-10", status: "Active" },
      { id: 3, name: "Sir Tariq Mehmood", email: "tariq.mehmood@alilm.edu.pk", phone: "0321-4567890", role: "Teacher", designation: "Chemistry Teacher", salary: 48000, joinedDate: "2020-03-01", status: "Active" },
      { id: 4, name: "Bilal Siddiqui", email: "accountant@alilm.edu.pk", phone: "0300-5551234", role: "Accountant", designation: "Head Accountant", salary: 60000, joinedDate: "2019-05-01", status: "Active" },
    ];
  }

  // Payroll
  if (cleanEndpoint.includes("payroll")) {
    return [
      {
        id: 1,
        month: "January 2026",
        basicSalary: 55000,
        workingDays: 26,
        presentDays: 25,
        leavesTaken: 1,
        lateDays: 3,
        lateDeduction: 2115,
        absenceDeduction: 0,
        netSalary: 52885,
        status: "Paid",
        paidDate: "2026-02-01",
        staff: { id: 1, name: "Sir Ahmed Farooq", role: "Teacher", designation: "Senior Mathematics Teacher" },
      },
      {
        id: 2,
        month: "January 2026",
        basicSalary: 50000,
        workingDays: 26,
        presentDays: 26,
        leavesTaken: 0,
        lateDays: 0,
        lateDeduction: 0,
        absenceDeduction: 0,
        netSalary: 50000,
        status: "Paid",
        paidDate: "2026-02-01",
        staff: { id: 2, name: "Miss Fatima Zahra", role: "Teacher", designation: "Physics Lecturer" },
      },
    ];
  }

  // Exams
  if (cleanEndpoint.includes("exam")) {
    return [
      { id: 1, title: "Mid-Term Examination 2026", session: "2025-2026", startDate: "2026-03-10", endDate: "2026-03-22", isLocked: true },
      { id: 2, title: "Final Term Examination 2026", session: "2025-2026", startDate: "2026-06-15", endDate: "2026-06-30", isLocked: false },
    ];
  }

  // Leaves
  if (cleanEndpoint.includes("leave")) {
    return [
      {
        id: 1,
        leaveType: "Medical",
        startDate: "2026-02-12",
        endDate: "2026-02-14",
        totalDays: 3,
        reason: "Severe viral fever and flu",
        status: "Approved",
        staff: { name: "Sir Ahmed Farooq", role: "Teacher" },
      },
    ];
  }

  // Expenses
  if (cleanEndpoint.includes("expense")) {
    return [
      { id: 1, category: "Utilities", title: "Electricity Bill (IESCO)", amount: 48500, date: "2026-02-05", paymentMethod: "Bank Transfer", status: "Paid" },
      { id: 2, category: "Stationery", title: "Exam Papers and Printing", amount: 18200, date: "2026-02-08", paymentMethod: "Cash", status: "Paid" },
      { id: 3, category: "Maintenance", title: "Generator Fuel & Service", amount: 12000, date: "2026-02-10", paymentMethod: "Cash", status: "Paid" },
    ];
  }

  // Diary
  if (cleanEndpoint.includes("diary") || cleanEndpoint.includes("notice")) {
    return [
      { id: 1, date: "2026-02-15", title: "Mid-Term Syllabus Notice", content: "All parents are notified that syllabus for Class 10 Mid-Terms has been shared.", target: "Whole School" },
    ];
  }

  // Generic array or object default
  return { message: "Success", data: [] };
}

export interface SchoolSetting {
  id: number;
  schoolName: string;
  schoolUrduName: string;
  regNo: string;
  logoUrl: string;
  address: string;
  phone: string;
  mobile: string;
  email: string;
  principalName: string;
  sessionYear: string;
  schoolStartTime: string;
  lateGraceMinutes: number;
  lateFinePerDay: number;
  lateRuleDays: number;
  casualLeaveQuota: number;
  medicalLeaveQuota: number;
  annualLeaveQuota: number;
  workingDaysPerMonth: number;
}

export interface User {
  id: number;
  username: string;
  name: string;
  email: string;
  role: "Admin" | "Principal" | "Accountant" | "Teacher";
  designation?: string;
  phone?: string;
  staffId?: number;
}

export interface ClassItem {
  id: number;
  name: string;
  section: string;
  gradeLevel: number;
  room: string;
  capacity: number;
  tuitionFee: number;
  admissionFee: number;
  annualFund: number;
  examFee: number;
  classTeacher?: string;
  studentCount?: number;
}

export interface Student {
  id: number;
  admissionNo: string; // Permanent lifetime GR Number
  rollNo: string;
  roll?: string;
  name: string;
  nameUrdu?: string;
  bFormNo: string;
  dob: string;
  gender: string;
  religion: string;
  bloodGroup?: string;
  previousSchool?: string;
  classSectionId: number;
  classSection?: ClassItem;
  class?: string;
  status: "Active" | "Left" | "StruckOff";
  admissionDate: string;
  leavingDate?: string;
  leavingReason?: string;
  photoUrl?: string;

  fatherName: string;
  fatherCnic: string;
  fatherOccupation?: string;
  fatherPhone: string;
  motherName?: string;
  motherPhone?: string;
  guardianName?: string;
  guardianRelation?: string;
  guardianPhone?: string;
  address: string;
  emergencyContact?: string;
  medicalNotes?: string;

  discountType: "None" | "Sibling" | "StaffChild" | "Concession";
  discountAmount: number;
  discountReason?: string;

  documentsJson?: string;
  history?: {
    id: number;
    sessionYear: string;
    className: string;
    section: string;
    finalResult?: string;
    attendancePercentage: number;
    remarks?: string;
  }[];
  siblings?: Student[];
}

export interface Staff {
  id: number;
  employeeNo: string;
  name: string;
  cnic: string;
  phone: string;
  email?: string;
  designation: string;
  role: "Teacher" | "Staff";
  qualification: string;
  joinedDate: string;
  status: "Active" | "Left";
  basicSalary: number;
  allowance: number;
  loanBalance: number;
  photoUrl?: string;
}

export interface StudentAttendance {
  id: number;
  studentId: number;
  classSectionId: number;
  date: string;
  status: "Present" | "Absent" | "Late" | "Leave";
  remarks?: string;
  student?: Student;
}

export interface StaffAttendance {
  staffId: number;
  employeeNo: string;
  name: string;
  designation: string;
  checkInTime?: string;
  checkOutTime?: string;
  isLate: boolean;
  status: "Present" | "Absent" | "Leave" | "HalfDay";
  remarks?: string;
}

export interface FeeChallan {
  id: number;
  challanNo: string;
  studentId: number;
  classSectionId: number;
  month: string;
  issueDate: string;
  dueDate: string;
  tuitionFee: number;
  admissionFee: number;
  annualFund: number;
  examFee: number;
  otherCharges: number;
  otherChargesTitle?: string;
  arrears: number;
  discount: number;
  fine: number;
  totalPayable: number;
  paidAmount: number;
  balance: number;
  status: "Unpaid" | "Partial" | "Paid";
  paymentDate?: string;
  paymentMethod?: string;
  bankName?: string;
  receivedBy?: string;
  remarks?: string;
  student?: Student;
  classSection?: ClassItem;
}

export interface Payroll {
  id: number;
  month: string;
  staffId: number;
  basicSalary: number;
  allowance: number;
  workingDays: number;
  daysPresent: number;
  approvedLeaves: number;
  unpaidLeaves: number;
  latesCount: number;
  lateDeductionDays: number;
  absentDeduction: number;
  lateDeduction: number;
  loanDeduction: number;
  otherDeductions?: number;
  bonus: number;
  netSalary: number;
  status: "Generated" | "Paid";
  paymentDate?: string;
  paymentMethod?: string;
  remarks?: string;
  staff?: Staff;
}

export interface LeaveApplication {
  id: number;
  applicantType: "Staff" | "Student";
  staffId?: number;
  studentId?: number;
  leaveType: "Casual" | "Medical" | "Annual" | "Unpaid";
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: "Pending" | "Approved" | "Rejected";
  approvedBy?: string;
  remarks?: string;
  createdAt: string;
  staff?: Staff;
  student?: Student;
}

export interface ExamTerm {
  id: number;
  title: string;
  sessionYear: string;
  startDate: string;
  endDate: string;
  isLocked: boolean;
}

export interface ExamResult {
  id: number;
  examTermId: number;
  studentId: number;
  classSectionId: number;
  subjectId: number;
  totalMarks: number;
  obtainedMarks: number;
  grade: string;
  remarks?: string;
  student?: Student;
  subject?: { id: number; name: string; totalMarks: number; code?: string };
}

export interface Expense {
  id: number;
  title: string;
  category: "Utility" | "Maintenance" | "Supplies" | "Salary" | "Event" | "Other";
  amount: number;
  date: string;
  paidTo: string;
  paymentMethod: string;
  description?: string;
  recordedBy?: string;
}

export interface DiaryNotice {
  id: number;
  type: "Notice" | "Diary";
  title: string;
  content: string;
  targetType: "All" | "Class";
  classSectionId?: number;
  date: string;
  createdBy: string;
}

export interface AuditLog {
  id: number;
  module: string;
  action: string;
  recordId?: string;
  details: string;
  performedBy: string;
  createdAt: string;
}

export interface DashboardStats {
  role: string;
  overview: {
    totalStudents: number;
    totalTeachers: number;
    totalClasses: number;
    studentAttendancePct: number;
    staffPresent: number;
    staffLate: number;
    feeCollected: number;
    feeOutstanding: number;
    defaultersCount: number;
    totalExpenses: number;
    pendingLeaves: number;
  };
  attendanceToday: {
    date: string;
    present: number;
    absent: number;
    late: number;
    totalMarked: number;
  };
  recentStudents: Student[];
  classDistribution: {
    name: string;
    count: number;
    capacity: number;
    tuitionFee: number;
  }[];
  setting?: SchoolSetting;
}

export interface ApiResponse<T> {
  statuscode: number;
  data: T;
  message: string;
  success: boolean;
}

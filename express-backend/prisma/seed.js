import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding comprehensive School Management System database...");

  // 1. Clean existing records in reverse dependency order
  await prisma.auditLog.deleteMany();
  await prisma.diaryNotice.deleteMany();
  await prisma.expense.deleteMany();
  await prisma.examResult.deleteMany();
  await prisma.examTerm.deleteMany();
  await prisma.payroll.deleteMany();
  await prisma.feeChallan.deleteMany();
  await prisma.leaveApplication.deleteMany();
  await prisma.staffAttendance.deleteMany();
  await prisma.staff.deleteMany();
  await prisma.studentAttendance.deleteMany();
  await prisma.studentAcademicHistory.deleteMany();
  await prisma.student.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.classSection.deleteMany();
  await prisma.user.deleteMany();
  await prisma.setting.deleteMany();

  // 2. Settings
  const setting = await prisma.setting.create({
    data: {
      id: 1,
      schoolName: "Al-Ilm Public High School",
      schoolUrduName: "العلم پبلک ہائی اسکول",
      regNo: "REG-LHR-2014-8842",
      logoUrl: "",
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
    },
  });

  // 3. Users with bcrypt hashed passwords
  const salt = await bcrypt.genSalt(10);
  const adminPass = await bcrypt.hash("admin123", salt);
  const principalPass = await bcrypt.hash("principal123", salt);
  const accountantPass = await bcrypt.hash("accountant123", salt);
  const teacherPass = await bcrypt.hash("teacher123", salt);

  await prisma.user.createMany({
    data: [
      {
        username: "admin",
        email: "admin@school.edu.pk",
        password: adminPass,
        name: "Muhammad Usman (Admin)",
        role: "Admin",
        phone: "0300-9876541",
        designation: "System Administrator",
      },
      {
        username: "principal",
        email: "principal@school.edu.pk",
        password: principalPass,
        name: "Prof. Tariq Mehmood",
        role: "Principal",
        phone: "0300-9876542",
        designation: "Principal & Academic Head",
      },
      {
        username: "accountant",
        email: "accountant@school.edu.pk",
        password: accountantPass,
        name: "Shafiq Ahmad",
        role: "Accountant",
        phone: "0300-9876543",
        designation: "Chief Accounts Officer",
      },
      {
        username: "teacher",
        email: "teacher@school.edu.pk",
        password: teacherPass,
        name: "Sir Ahmed Farooq",
        role: "Teacher",
        phone: "0300-9876544",
        designation: "Senior Mathematics Teacher",
        staffId: 1,
      },
    ],
  });

  // 4. Staff (15 Teachers + 4 Non-teaching Staff)
  const staffData = [
    { employeeNo: "EMP-01", name: "Sir Ahmed Farooq", cnic: "35201-1122334-1", phone: "0301-4455661", email: "ahmed.farooq@alilm.edu.pk", designation: "Senior Mathematics Teacher", role: "Teacher", qualification: "M.Sc. Mathematics", joinedDate: "2020-02-01", basicSalary: 55000, allowance: 5000 },
    { employeeNo: "EMP-02", name: "Miss Fatima Zahra", cnic: "35201-2233445-2", phone: "0302-4455662", email: "fatima.zahra@alilm.edu.pk", designation: "Physics Lecturer", role: "Teacher", qualification: "M.Phil Physics", joinedDate: "2021-08-15", basicSalary: 50000, allowance: 4000 },
    { employeeNo: "EMP-03", name: "Sir Tariq Mehmood", cnic: "35201-3344556-3", phone: "0303-4455663", email: "tariq.chem@alilm.edu.pk", designation: "Chemistry Lecturer", role: "Teacher", qualification: "M.Sc. Chemistry", joinedDate: "2019-01-10", basicSalary: 58000, allowance: 5000 },
    { employeeNo: "EMP-04", name: "Miss Ayesha Malik", cnic: "35201-4455667-4", phone: "0304-4455664", email: "ayesha.malik@alilm.edu.pk", designation: "English Teacher", role: "Teacher", qualification: "M.A. English", joinedDate: "2022-03-01", basicSalary: 45000, allowance: 3000 },
    { employeeNo: "EMP-05", name: "Sir Bilal Qureshi", cnic: "35201-5566778-5", phone: "0305-4455665", email: "bilal.cs@alilm.edu.pk", designation: "Computer Science Teacher", role: "Teacher", qualification: "BSCS", joinedDate: "2021-09-01", basicSalary: 48000, allowance: 3000 },
    { employeeNo: "EMP-06", name: "Miss Saima Noor", cnic: "35201-6677889-6", phone: "0306-4455666", email: "saima.noor@alilm.edu.pk", designation: "Biology Teacher", role: "Teacher", qualification: "M.Sc. Zoology", joinedDate: "2022-01-15", basicSalary: 46000, allowance: 3000 },
    { employeeNo: "EMP-07", name: "Sir Imran Khan", cnic: "35201-7788990-7", phone: "0307-4455667", email: "imran.urdu@alilm.edu.pk", designation: "Urdu Teacher", role: "Teacher", qualification: "M.A. Urdu", joinedDate: "2018-04-01", basicSalary: 52000, allowance: 4000 },
    { employeeNo: "EMP-08", name: "Sir Rashid Minhas", cnic: "35201-8899001-8", phone: "0308-4455668", email: "rashid.pst@alilm.edu.pk", designation: "Pak Studies & Islamiyat", role: "Teacher", qualification: "M.A. History", joinedDate: "2019-09-01", basicSalary: 47000, allowance: 3000 },
    { employeeNo: "EMP-09", name: "Miss Maryam Nawaz", cnic: "35201-9900112-9", phone: "0309-4455669", email: "maryam.junior@alilm.edu.pk", designation: "Primary Incharge", role: "Teacher", qualification: "B.Ed Honours", joinedDate: "2020-06-01", basicSalary: 44000, allowance: 3000 },
    { employeeNo: "EMP-10", name: "Sir Kamran Akmal", cnic: "35201-1011121-1", phone: "0310-4455670", email: "kamran.pet@alilm.edu.pk", designation: "Physical Education Teacher", role: "Teacher", qualification: "M.P.Ed", joinedDate: "2021-11-01", basicSalary: 42000, allowance: 2500 },
    { employeeNo: "EMP-11", name: "Miss Sadia Bibi", cnic: "35201-1213141-2", phone: "0311-4455671", email: "sadia.math@alilm.edu.pk", designation: "Junior Math Teacher", role: "Teacher", qualification: "B.Sc. Math Stats", joinedDate: "2023-01-10", basicSalary: 38000, allowance: 2000 },
    { employeeNo: "EMP-12", name: "Sir Noman Ali", cnic: "35201-1314151-3", phone: "0312-4455672", email: "noman.sci@alilm.edu.pk", designation: "General Science Teacher", role: "Teacher", qualification: "B.Sc.", joinedDate: "2023-04-01", basicSalary: 38000, allowance: 2000 },
    { employeeNo: "EMP-13", name: "Miss Hira Aslam", cnic: "35201-1415161-4", phone: "0313-4455673", email: "hira.pre@alilm.edu.pk", designation: "Montessori Teacher", role: "Teacher", qualification: "Diploma in Montessori", joinedDate: "2022-08-01", basicSalary: 36000, allowance: 2000 },
    { employeeNo: "EMP-14", name: "Miss Rabia Basri", cnic: "35201-1516171-5", phone: "0314-4455674", email: "rabia.pre@alilm.edu.pk", designation: "Playgroup Teacher", role: "Teacher", qualification: "ECCE Certified", joinedDate: "2023-02-01", basicSalary: 35000, allowance: 2000 },
    { employeeNo: "EMP-15", name: "Sir Zahid Hussain", cnic: "35201-1617181-6", phone: "0315-4455675", email: "zahid.art@alilm.edu.pk", designation: "Art & Drawing Teacher", role: "Teacher", qualification: "BFA", joinedDate: "2022-09-01", basicSalary: 37000, allowance: 2000 },
    // Non-Teaching Staff (4)
    { employeeNo: "EMP-16", name: "Shafiq Ahmad", cnic: "35201-1718191-7", phone: "0316-4455676", email: "shafiq.acc@alilm.edu.pk", designation: "Senior Accountant", role: "Staff", qualification: "B.Com / CMA", joinedDate: "2018-01-01", basicSalary: 55000, allowance: 5000 },
    { employeeNo: "EMP-17", name: "Muhammad Asif", cnic: "35201-1819201-8", phone: "0317-4455677", email: "asif.clerk@alilm.edu.pk", designation: "Admission Clerk", role: "Staff", qualification: "I.Com", joinedDate: "2020-03-01", basicSalary: 32000, allowance: 2000 },
    { employeeNo: "EMP-18", name: "Baba Ghulam Rasool", cnic: "35201-1920211-9", phone: "0318-4455678", email: "", designation: "Lab Attendant", role: "Staff", qualification: "Matric", joinedDate: "2016-04-01", basicSalary: 28000, allowance: 2000 },
    { employeeNo: "EMP-19", name: "Muhammad Ramzan", cnic: "35201-2021221-0", phone: "0319-4455679", email: "", designation: "Head Security Guard", role: "Staff", qualification: "Ex-Army", joinedDate: "2017-08-01", basicSalary: 30000, allowance: 2000 },
  ];

  for (const s of staffData) {
    await prisma.staff.create({ data: s });
  }

  // 5. Classes (Play Group, Nursery, Prep, Class 1 to 10)
  const classConfigs = [
    { name: "Play Group", section: "A", gradeLevel: 0, room: "PG-Room", tuitionFee: 3000, admissionFee: 4000, annualFund: 1500, examFee: 500, classTeacher: "Miss Rabia Basri" },
    { name: "Nursery", section: "A", gradeLevel: 0, room: "Nur-Room", tuitionFee: 3200, admissionFee: 4000, annualFund: 1500, examFee: 500, classTeacher: "Miss Hira Aslam" },
    { name: "Prep", section: "A", gradeLevel: 0, room: "Prep-Room", tuitionFee: 3500, admissionFee: 4500, annualFund: 2000, examFee: 800, classTeacher: "Miss Maryam Nawaz" },
    { name: "Class 1", section: "A", gradeLevel: 1, room: "Room 101", tuitionFee: 3800, admissionFee: 5000, annualFund: 2000, examFee: 1000, classTeacher: "Miss Sadia Bibi" },
    { name: "Class 2", section: "A", gradeLevel: 2, room: "Room 102", tuitionFee: 3800, admissionFee: 5000, annualFund: 2000, examFee: 1000, classTeacher: "Sir Noman Ali" },
    { name: "Class 3", section: "A", gradeLevel: 3, room: "Room 103", tuitionFee: 4000, admissionFee: 5000, annualFund: 2000, examFee: 1000, classTeacher: "Sir Zahid Hussain" },
    { name: "Class 4", section: "A", gradeLevel: 4, room: "Room 104", tuitionFee: 4000, admissionFee: 5000, annualFund: 2000, examFee: 1000, classTeacher: "Sir Kamran Akmal" },
    { name: "Class 5", section: "A", gradeLevel: 5, room: "Room 105", tuitionFee: 4200, admissionFee: 5000, annualFund: 2500, examFee: 1200, classTeacher: "Sir Rashid Minhas" },
    { name: "Class 6", section: "A", gradeLevel: 6, room: "Room 201", tuitionFee: 4500, admissionFee: 6000, annualFund: 2500, examFee: 1500, classTeacher: "Sir Imran Khan" },
    { name: "Class 7", section: "A", gradeLevel: 7, room: "Room 202", tuitionFee: 4800, admissionFee: 6000, annualFund: 2500, examFee: 1500, classTeacher: "Miss Saima Noor" },
    { name: "Class 8", section: "A", gradeLevel: 8, room: "Room 203", tuitionFee: 5000, admissionFee: 6000, annualFund: 3000, examFee: 1500, classTeacher: "Sir Bilal Qureshi" },
    { name: "Class 9", section: "A", gradeLevel: 9, room: "Room 301", tuitionFee: 5500, admissionFee: 7000, annualFund: 3000, examFee: 2000, classTeacher: "Miss Ayesha Malik" },
    { name: "Class 9", section: "B", gradeLevel: 9, room: "Room 302", tuitionFee: 5500, admissionFee: 7000, annualFund: 3000, examFee: 2000, classTeacher: "Sir Tariq Mehmood" },
    { name: "Class 10", section: "A", gradeLevel: 10, room: "Room 303", tuitionFee: 6000, admissionFee: 7000, annualFund: 3500, examFee: 2000, classTeacher: "Sir Ahmed Farooq" },
    { name: "Class 10", section: "B", gradeLevel: 10, room: "Room 304", tuitionFee: 6000, admissionFee: 7000, annualFund: 3500, examFee: 2000, classTeacher: "Miss Fatima Zahra" },
  ];

  const createdClasses = [];
  for (const c of classConfigs) {
    const cls = await prisma.classSection.create({ data: c });
    createdClasses.push(cls);
  }

  // 6. Subjects for Classes (e.g. Class 10 subjects)
  const class10A = createdClasses.find(c => c.name === "Class 10" && c.section === "A");
  const class10B = createdClasses.find(c => c.name === "Class 10" && c.section === "B");
  const class9A = createdClasses.find(c => c.name === "Class 9" && c.section === "A");

  const coreSubjects = [
    { name: "Mathematics", code: "MTH-10", totalMarks: 100, passingMarks: 33, teacherName: "Sir Ahmed Farooq" },
    { name: "Physics", code: "PHY-10", totalMarks: 100, passingMarks: 33, teacherName: "Miss Fatima Zahra" },
    { name: "Chemistry", code: "CHM-10", totalMarks: 100, passingMarks: 33, teacherName: "Sir Tariq Mehmood" },
    { name: "English Compulsory", code: "ENG-10", totalMarks: 100, passingMarks: 33, teacherName: "Miss Ayesha Malik" },
    { name: "Urdu Compulsory", code: "URD-10", totalMarks: 100, passingMarks: 33, teacherName: "Sir Imran Khan" },
    { name: "Islamiyat / Pak Studies", code: "ISL-10", totalMarks: 50, passingMarks: 17, teacherName: "Sir Rashid Minhas" },
    { name: "Computer Science", code: "CS-10", totalMarks: 100, passingMarks: 33, teacherName: "Sir Bilal Qureshi" },
  ];

  for (const s of coreSubjects) {
    if (class10A) await prisma.subject.create({ data: { ...s, classSectionId: class10A.id } });
    if (class10B) await prisma.subject.create({ data: { ...s, classSectionId: class10B.id } });
    if (class9A) await prisma.subject.create({ data: { ...s, classSectionId: class9A.id } });
  }

  // Also add basic subjects for other classes
  for (const c of createdClasses) {
    if (c.id !== class10A?.id && c.id !== class10B?.id && c.id !== class9A?.id) {
      await prisma.subject.create({
        data: { name: "General Subjects", code: `GEN-${c.gradeLevel}`, totalMarks: 100, passingMarks: 33, classSectionId: c.id, teacherName: c.classTeacher }
      });
    }
  }

  // 7. Seed ~120 Students with Pakistani Formats and Sibling Groups
  console.log("Generating 120 student profiles across Play Group to Class 10...");

  const firstNamesM = ["Muhammad", "Ali", "Hamza", "Bilal", "Usman", "Ahmed", "Omer", "Zain", "Hassan", "Hussein", "Daniyal", "Saad", "Talha", "Mustafa", "Abdullah", "Shahzaib", "Waleed", "Farhan", "Kashif", "Sohail"];
  const firstNamesF = ["Fatima", "Ayesha", "Sara", "Zainab", "Hania", "Maryam", "Aiman", "Noor", "Khadija", "Hafsa", "Sadia", "Laiba", "Manahil", "Eshal", "Anaya", "Bisma", "Iqra", "Kinza", "Rameen", "Sana"];
  const fatherCastes = ["Malik", "Khan", "Chaudhry", "Raja", "Sheikh", "Bhatti", "Syed", "Butt", "Qureshi", "Ansari", "Mirza", "Mughal", "Niazi", "Jutt", "Gondal"];

  // Create 45 father entities so multiple students share fatherCnic (Siblings!)
  const fathers = [];
  for (let i = 1; i <= 50; i++) {
    const cnicMiddle = String(1000000 + i * 17311).slice(0, 7);
    const cnic = `35201-${cnicMiddle}-1`;
    const fName = `${firstNamesM[i % firstNamesM.length]} ${fatherCastes[i % fatherCastes.length]}`;
    const phone = `0300-${String(2000000 + i * 12345).slice(0, 7)}`;
    fathers.push({ name: fName, cnic, phone, occupation: i % 3 === 0 ? "Govt Officer" : i % 2 === 0 ? "Businessman" : "Bank Manager" });
  }

  const bloodGroups = ["A+", "B+", "O+", "AB+", "A-", "B-", "O-"];
  const createdStudents = [];

  let studentIdx = 1;
  for (let cIdx = 0; cIdx < createdClasses.length; cIdx++) {
    const cls = createdClasses[cIdx];
    // Allocate 8 students per class section on average = ~120 students total
    const countForThisClass = cIdx < 5 ? 8 : (cIdx < 11 ? 8 : 9);

    for (let s = 1; s <= countForThisClass; s++) {
      const isMale = studentIdx % 2 === 1;
      const firstName = isMale ? firstNamesM[(studentIdx * 3) % firstNamesM.length] : firstNamesF[(studentIdx * 7) % firstNamesF.length];
      const fatherObj = fathers[(studentIdx * 4) % fathers.length];
      const fullName = `${firstName} ${fatherObj.name.split(" ")[1] || "Ahmad"}`;
      const admissionNo = `GR-${1000 + studentIdx}`;
      const rollNo = `SMS-${String(studentIdx).padStart(3, "0")}`;

      const bFormMid = String(2000000 + studentIdx * 4321).slice(0, 7);
      const bFormNo = `35201-${bFormMid}-${isMale ? "1" : "2"}`;

      // Sibling discount check: if this father already has an earlier enrolled student
      const previousChild = createdStudents.find(st => st.fatherCnic === fatherObj.cnic);
      const isSibling = !!previousChild;
      const discountType = isSibling ? "Sibling" : (studentIdx % 25 === 0 ? "Concession" : "None");
      const discountAmount = isSibling ? Math.round(cls.tuitionFee * 0.2) : (discountType === "Concession" ? 1000 : 0);
      const discountReason = isSibling ? `Sibling concession (Brother of ${previousChild.name} - ${previousChild.admissionNo})` : (discountType === "Concession" ? "Need based financial aid approved by Principal" : null);

      const status = studentIdx === 45 || studentIdx === 88 ? "Left" : "Active";
      const leavingDate = status === "Left" ? "2026-01-15" : null;
      const leavingReason = status === "Left" ? "Parents relocated to Rawalpindi" : null;

      const birthYear = 2026 - (cls.gradeLevel + 5);
      const dob = `${birthYear}-04-${String(10 + (studentIdx % 18)).padStart(2, "0")}`;

      const stu = await prisma.student.create({
        data: {
          admissionNo,
          rollNo,
          name: fullName,
          nameUrdu: isMale ? "محمد " + firstName : firstName + " بی بی",
          bFormNo,
          dob,
          gender: isMale ? "Male" : "Female",
          religion: "Islam",
          bloodGroup: bloodGroups[studentIdx % bloodGroups.length],
          previousSchool: cls.gradeLevel > 0 ? "Beaconhouse School System" : "Home Prep",
          classSectionId: cls.id,
          status,
          admissionDate: "2024-04-01",
          leavingDate,
          leavingReason,
          photoUrl: "",
          fatherName: fatherObj.name,
          fatherCnic: fatherObj.cnic,
          fatherOccupation: fatherObj.occupation,
          fatherPhone: fatherObj.phone,
          motherName: "Mrs. " + fatherObj.name.split(" ")[0],
          motherPhone: fatherObj.phone.replace("0300", "0321"),
          guardianName: fatherObj.name,
          guardianRelation: "Father",
          guardianPhone: fatherObj.phone,
          address: `House #${studentIdx * 2}, Street 5, Johar Town, Lahore`,
          emergencyContact: fatherObj.phone,
          medicalNotes: studentIdx % 15 === 0 ? "Mild pollen allergy" : "None",
          discountType,
          discountAmount,
          discountReason,
          documentsJson: JSON.stringify([
            { name: "B-Form Copy", status: "Verified" },
            { name: "Father CNIC", status: "Verified" },
            { name: "Birth Certificate", status: "Verified" }
          ]),
        }
      });

      // Also create Academic History for older classes
      if (cls.gradeLevel >= 8) {
        await prisma.studentAcademicHistory.create({
          data: {
            studentId: stu.id,
            sessionYear: "2024-2025",
            className: `Class ${cls.gradeLevel - 1}`,
            section: "A",
            finalResult: "Promoted",
            attendancePercentage: 91.5,
            remarks: "Excellence in academics and sports",
          }
        });
      }

      createdStudents.push(stu);
      studentIdx++;
    }
  }

  console.log(`Created ${createdStudents.length} students.`);

  // 8. Three Months of Attendance (Nov 2025, Dec 2025, Jan/Feb 2026, and Recent Days)
  console.log("Seeding attendance records for students and staff...");

  const today = new Date();
  const sampleDates = [];
  for (let d = 0; d < 10; d++) {
    const dt = new Date(today);
    dt.setDate(today.getDate() - d);
    if (dt.getDay() !== 0) { // Skip Sunday
      sampleDates.push(dt.toISOString().split("T")[0]);
    }
  }

  // Student Attendance (for Class 10A, 10B, 9A)
  const targetClasses = createdClasses.filter(c => c.name === "Class 10" || c.name === "Class 9");
  for (const dateStr of sampleDates) {
    for (const cls of targetClasses) {
      const classStus = createdStudents.filter(s => s.classSectionId === cls.id && s.status === "Active");
      for (let i = 0; i < classStus.length; i++) {
        const s = classStus[i];
        let status = "Present";
        if ((i + sampleDates.indexOf(dateStr)) % 9 === 0) status = "Absent";
        else if ((i + sampleDates.indexOf(dateStr)) % 7 === 0) status = "Late";

        await prisma.studentAttendance.upsert({
          where: { studentId_date: { studentId: s.id, date: dateStr } },
          update: { status },
          create: {
            studentId: s.id,
            classSectionId: cls.id,
            date: dateStr,
            status,
          }
        });
      }
    }
  }

  // Staff Attendance (for 15 staff members with check-in times)
  const allStaff = await prisma.staff.findMany();
  for (const dateStr of sampleDates) {
    for (let i = 0; i < allStaff.length; i++) {
      const st = allStaff[i];
      // Late if check in > 08:00
      const isLateCheck = (i + sampleDates.indexOf(dateStr)) % 4 === 0;
      const checkIn = isLateCheck ? "08:18" : "07:50";
      const checkOut = "14:05";
      const isAbsent = (i === 4 && sampleDates.indexOf(dateStr) === 2);
      const isLeave = (i === 6 && sampleDates.indexOf(dateStr) === 1);

      const status = isAbsent ? "Absent" : (isLeave ? "Leave" : "Present");

      await prisma.staffAttendance.upsert({
        where: { staffId_date: { staffId: st.id, date: dateStr } },
        update: { checkInTime: checkIn, checkOutTime: checkOut, isLate: isLateCheck, status },
        create: {
          staffId: st.id,
          date: dateStr,
          checkInTime: checkIn,
          checkOutTime: checkOut,
          isLate: isLateCheck,
          status,
        }
      });
    }
  }

  // 9. Fee Challans (Paid, Partial, Unpaid Mix for Class 10 and 9)
  console.log("Generating fee challans...");
  let challanSeq = 1;
  const activeStudentsForFees = createdStudents.filter(s => s.status === "Active").slice(0, 60);

  for (const stu of activeStudentsForFees) {
    const cls = createdClasses.find(c => c.id === stu.classSectionId);
    const tuition = cls ? cls.tuitionFee : 4000;
    const discount = stu.discountAmount || 0;
    const examFee = 1000;
    const annualFund = (challanSeq % 4 === 0) ? 1500 : 0;
    const fine = (challanSeq % 5 === 0) ? 200 : 0;
    const totalPayable = tuition + examFee + annualFund + fine - discount;

    let status = "Paid";
    let paidAmount = totalPayable;
    let balance = 0;
    let paymentDate = "2026-03-05";
    let paymentMethod = "Cash";

    if (challanSeq % 3 === 0) {
      status = "Unpaid";
      paidAmount = 0;
      balance = totalPayable;
      paymentDate = null;
      paymentMethod = null;
    } else if (challanSeq % 5 === 0) {
      status = "Partial";
      paidAmount = Math.round(totalPayable / 2);
      balance = totalPayable - paidAmount;
      paymentDate = "2026-03-08";
      paymentMethod = "Bank";
    }

    await prisma.feeChallan.create({
      data: {
        challanNo: `CH-2026-${String(challanSeq).padStart(4, "0")}`,
        studentId: stu.id,
        classSectionId: stu.classSectionId,
        month: "2026-03",
        issueDate: "2026-03-01",
        dueDate: "2026-03-10",
        tuitionFee: tuition,
        admissionFee: 0,
        annualFund,
        examFee,
        discount,
        fine,
        totalPayable,
        paidAmount,
        balance,
        status,
        paymentDate,
        paymentMethod,
        bankName: paymentMethod === "Bank" ? "Meezan Bank Ltd (Johar Town Branch)" : null,
        receivedBy: status !== "Unpaid" ? "Shafiq Ahmad (Accountant)" : null,
      }
    });

    challanSeq++;
  }

  // 10. Completed Exam Term + Results for Class 10-A
  console.log("Generating Exam Term and Results...");
  const examTerm = await prisma.examTerm.create({
    data: {
      title: "Mid Term Examination 2026",
      sessionYear: "2025-2026",
      startDate: "2026-01-15",
      endDate: "2026-01-25",
      isLocked: true, // Approved by Principal
    }
  });

  if (class10A) {
    const class10Subjects = await prisma.subject.findMany({ where: { classSectionId: class10A.id } });
    const class10Students = createdStudents.filter(s => s.classSectionId === class10A.id && s.status === "Active");

    for (const stu of class10Students) {
      for (const sub of class10Subjects) {
        const baseMark = 65 + ((stu.id * 7 + sub.id * 11) % 30);
        const marks = sub.totalMarks === 50 ? Math.round(baseMark / 2) : baseMark;
        const pct = (marks / sub.totalMarks) * 100;
        let grade = "A";
        if (pct >= 80) grade = "A+";
        else if (pct >= 70) grade = "A";
        else if (pct >= 60) grade = "B";
        else if (pct >= 50) grade = "C";
        else grade = "D";

        await prisma.examResult.create({
          data: {
            examTermId: examTerm.id,
            studentId: stu.id,
            classSectionId: class10A.id,
            subjectId: sub.id,
            totalMarks: sub.totalMarks,
            obtainedMarks: marks,
            grade,
            remarks: pct >= 80 ? "Outstanding performance" : "Satisfactory progress",
          }
        });
      }
    }
  }

  // 11. Last Month's Payroll with Late & Absent Deductions
  console.log("Generating staff payroll records...");
  for (const st of allStaff) {
    const workingDays = 26;
    const lates = st.employeeNo === "EMP-01" ? 4 : (st.employeeNo === "EMP-02" ? 3 : 1);
    const lateDeductionDays = Math.floor(lates / 3); // 3 lates = 1 day
    const unpaidLeaves = st.employeeNo === "EMP-03" ? 2 : 0;
    const absentDays = st.employeeNo === "EMP-07" ? 1 : 0;

    const perDaySalary = Math.round(st.basicSalary / workingDays);
    const lateDeduction = lateDeductionDays * perDaySalary;
    const absentDeduction = (unpaidLeaves + absentDays) * perDaySalary;
    const loanDeduction = st.employeeNo === "EMP-05" ? 3000 : 0;
    const bonus = st.employeeNo === "EMP-01" ? 2000 : 0;

    const netSalary = (st.basicSalary + st.allowance + bonus) - (lateDeduction + absentDeduction + loanDeduction);

    await prisma.payroll.create({
      data: {
        month: "2026-02",
        staffId: st.id,
        basicSalary: st.basicSalary,
        allowance: st.allowance,
        workingDays,
        daysPresent: workingDays - unpaidLeaves - absentDays,
        approvedLeaves: 1,
        unpaidLeaves,
        latesCount: lates,
        lateDeductionDays,
        absentDeduction,
        lateDeduction,
        loanDeduction,
        bonus,
        netSalary,
        status: "Paid",
        paymentDate: "2026-03-01",
        paymentMethod: "Bank Transfer",
        remarks: `Auto calculated for Feb 2026. Lates: ${lates}, Deductions: Rs. ${lateDeduction + absentDeduction}`,
      }
    });
  }

  // 12. Pending Leaves
  await prisma.leaveApplication.createMany({
    data: [
      {
        applicantType: "Staff",
        staffId: 1, // Sir Ahmed Farooq
        leaveType: "Casual",
        startDate: "2026-03-16",
        endDate: "2026-03-17",
        days: 2,
        reason: "Family wedding in Islamabad",
        status: "Pending",
      },
      {
        applicantType: "Staff",
        staffId: 2, // Miss Fatima Zahra
        leaveType: "Medical",
        startDate: "2026-03-18",
        endDate: "2026-03-18",
        days: 1,
        reason: "Dental appointment",
        status: "Pending",
      },
      {
        applicantType: "Student",
        studentId: 1, // Ali
        leaveType: "Casual",
        startDate: "2026-03-19",
        endDate: "2026-03-20",
        days: 2,
        reason: "Attending sister's wedding",
        status: "Pending",
      }
    ]
  });

  // 13. Expenses
  await prisma.expense.createMany({
    data: [
      { title: "Electricity Bill (LESCO)", category: "Utility", amount: 48500, date: "2026-03-02", paidTo: "LESCO Lahore", paymentMethod: "Online", description: "Main campus meter 1 & 2" },
      { title: "Gas Bill (SNGPL)", category: "Utility", amount: 8200, date: "2026-03-03", paidTo: "SNGPL", paymentMethod: "Online", description: "Heaters and canteen meter" },
      { title: "Office Printing & Examination Paper", category: "Supplies", amount: 24000, date: "2026-03-04", paidTo: "Urdu Bazaar Stationers", paymentMethod: "Cash", description: "50 A4 paper reams + cartridge ink" },
      { title: "Generator Diesel & Servicing", category: "Maintenance", amount: 18500, date: "2026-03-06", paidTo: "Shell Johar Town", paymentMethod: "Cash", description: "100L Diesel + Mobil oil change" },
      { title: "Science Lab Chemical Refill", category: "Supplies", amount: 15200, date: "2026-03-07", paidTo: "Al-Hadeed Scientific", paymentMethod: "Cheque", description: "Chemistry lab salts and acid refill" },
    ]
  });

  // 14. Notices and Diary
  await prisma.diaryNotice.createMany({
    data: [
      {
        type: "Notice",
        title: "Annual Sports Week Schedule",
        content: "Annual Sports Week will commence from 24th March. All students must wear white PT kits.",
        targetType: "All",
        date: "2026-03-10",
        createdBy: "Prof. Tariq Mehmood (Principal)",
      },
      {
        type: "Notice",
        title: "Parent Teacher Meeting (PTM)",
        content: "PTM for distribution of Mid-Term report cards will be held on Saturday from 9:00 AM to 1:00 PM.",
        targetType: "All",
        date: "2026-03-12",
        createdBy: "Administration Office",
      },
      {
        type: "Diary",
        title: "Math Homework - Exercise 4.2",
        content: "Solve Questions 1 to 8 of Exercise 4.2 on neat homework registers.",
        targetType: "Class",
        classSectionId: class10A?.id,
        date: "2026-03-15",
        createdBy: "Sir Ahmed Farooq",
      }
    ]
  });

  // 15. Audit Logs
  await prisma.auditLog.createMany({
    data: [
      { module: "Fee", action: "Update", recordId: "CH-2026-0001", details: "Fee payment received: Rs. 4,500 Cash", performedBy: "Shafiq Ahmad (Accountant)" },
      { module: "Marks", action: "Approve", recordId: "Mid Term 2026", details: "Mid Term Class 10 Result Gazetted and locked", performedBy: "Prof. Tariq Mehmood (Principal)" },
      { module: "Salary", action: "Create", recordId: "PAY-2026-02", details: "February payroll calculated for 19 staff members", performedBy: "Shafiq Ahmad (Accountant)" },
    ]
  });

  console.log("Database seeded successfully with all Pakistani formats, lifetime records, and demo modules!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

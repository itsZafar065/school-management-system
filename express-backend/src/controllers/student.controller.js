import prisma from "../db.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

const getAllStudents = async (req, res, next) => {
  try {
    const { search, classSectionId, class: classNameParam, className, status, fatherCnic } = req.query;

    const where = {};

    if (status && status !== "all") {
      where.status = status;
    }

    if (classSectionId && classSectionId !== "all" && !isNaN(parseInt(classSectionId))) {
      where.classSectionId = parseInt(classSectionId);
    }

    const cls = classNameParam || className;
    if (cls && cls !== "all" && !where.classSectionId) {
      where.classSection = {
        name: { contains: cls },
      };
    }

    if (fatherCnic) {
      where.fatherCnic = fatherCnic.trim();
    }

    if (search) {
      const q = search.trim();
      where.OR = [
        { name: { contains: q } },
        { admissionNo: { contains: q } },
        { rollNo: { contains: q } },
        { fatherName: { contains: q } },
        { fatherCnic: { contains: q } },
        { bFormNo: { contains: q } },
      ];
    }

    const students = await prisma.student.findMany({
      where,
      include: {
        classSection: true,
      },
      orderBy: [
        { classSectionId: "asc" },
        { rollNo: "asc" },
      ],
    });

    return res.status(200).json(new ApiResponse(200, students, "Students fetched successfully"));
  } catch (error) {
    next(error);
  }
};

const getStudentById = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const student = await prisma.student.findUnique({
      where: { id },
      include: {
        classSection: true,
        history: true,
        challans: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        results: {
          include: {
            examTerm: true,
            subject: true,
          },
        },
      },
    });

    if (!student) {
      throw new ApiError(404, "Student record not found");
    }

    // Also look up siblings by matching father CNIC
    const siblings = await prisma.student.findMany({
      where: {
        fatherCnic: student.fatherCnic,
        id: { not: student.id },
      },
      include: { classSection: true },
    });

    return res.status(200).json(
      new ApiResponse(200, { ...student, siblings }, "Student profile fetched")
    );
  } catch (error) {
    next(error);
  }
};

const createStudent = async (req, res, next) => {
  try {
    const {
      name,
      nameUrdu,
      admissionNo,
      rollNo,
      bFormNo,
      dob,
      gender,
      religion,
      bloodGroup,
      previousSchool,
      classSectionId,
      fatherName,
      fatherCnic,
      fatherOccupation,
      fatherPhone,
      motherName,
      motherPhone,
      guardianName,
      guardianRelation,
      guardianPhone,
      address,
      emergencyContact,
      medicalNotes,
      discountType,
      discountAmount,
      discountReason,
      documentsJson,
    } = req.body;

    if (!name || !fatherName || !fatherPhone || !classSectionId) {
      throw new ApiError(400, "Student Name, Father Name, Father Phone, and Class are required");
    }

    // Auto-generate Admission No if not provided
    let finalAdmissionNo = admissionNo;
    if (!finalAdmissionNo) {
      const lastStudent = await prisma.student.findFirst({
        orderBy: { id: "desc" },
      });
      const nextNum = lastStudent ? lastStudent.id + 1001 : 1001;
      finalAdmissionNo = `GR-${nextNum}`;
    }

    // Check if GR number exists
    const existing = await prisma.student.findUnique({
      where: { admissionNo: finalAdmissionNo },
    });
    if (existing) {
      throw new ApiError(409, `Admission/GR No ${finalAdmissionNo} already exists in permanent register`);
    }

    // Auto-detect sibling if father CNIC exists
    let finalDiscountType = discountType || "None";
    let finalDiscountAmount = parseInt(discountAmount) || 0;
    let finalDiscountReason = discountReason || null;

    if (fatherCnic) {
      const sibling = await prisma.student.findFirst({
        where: { fatherCnic: fatherCnic.trim(), status: "Active" },
        include: { classSection: true },
      });
      if (sibling && finalDiscountType === "None") {
        finalDiscountType = "Sibling";
        finalDiscountAmount = Math.round((parseInt(req.body.tuitionFee) || 3500) * 0.2);
        finalDiscountReason = `Sibling discount: Brother/Sister of ${sibling.name} (${sibling.admissionNo})`;
      }
    }

    const newStudent = await prisma.student.create({
      data: {
        admissionNo: finalAdmissionNo,
        rollNo: rollNo || finalAdmissionNo.replace("GR-", "SMS-"),
        name,
        nameUrdu: nameUrdu || null,
        bFormNo: bFormNo || "35201-0000000-1",
        dob: dob || "2015-01-01",
        gender: gender || "Male",
        religion: religion || "Islam",
        bloodGroup: bloodGroup || null,
        previousSchool: previousSchool || null,
        classSectionId: parseInt(classSectionId),
        status: "Active",
        admissionDate: new Date().toISOString().split("T")[0],
        fatherName,
        fatherCnic: fatherCnic || "35201-0000000-1",
        fatherOccupation: fatherOccupation || null,
        fatherPhone,
        motherName: motherName || null,
        motherPhone: motherPhone || null,
        guardianName: guardianName || fatherName,
        guardianRelation: guardianRelation || "Father",
        guardianPhone: guardianPhone || fatherPhone,
        address: address || "Lahore",
        emergencyContact: emergencyContact || fatherPhone,
        medicalNotes: medicalNotes || null,
        discountType: finalDiscountType,
        discountAmount: finalDiscountAmount,
        discountReason: finalDiscountReason,
        documentsJson: documentsJson || JSON.stringify([]),
      },
      include: {
        classSection: true,
      },
    });

    // Log to audit trail
    await prisma.auditLog.create({
      data: {
        module: "Student",
        action: "Create",
        recordId: newStudent.admissionNo,
        details: `Student admitted: ${newStudent.name} (${newStudent.admissionNo}) in Class ${newStudent.classSection.name}`,
        performedBy: req.user ? req.user.name : "Clerk",
      },
    });

    return res.status(201).json(new ApiResponse(201, newStudent, "Student admitted successfully"));
  } catch (error) {
    next(error);
  }
};

const updateStudent = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);

    const updated = await prisma.student.update({
      where: { id },
      data: {
        ...req.body,
        id: undefined, // ensure id doesn't get overwritten
        classSectionId: req.body.classSectionId ? parseInt(req.body.classSectionId) : undefined,
        discountAmount: req.body.discountAmount !== undefined ? parseInt(req.body.discountAmount) : undefined,
      },
      include: { classSection: true },
    });

    return res.status(200).json(new ApiResponse(200, updated, "Student details updated"));
  } catch (error) {
    next(error);
  }
};

const updateStudentStatus = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const { status, leavingDate, leavingReason } = req.body;

    const updated = await prisma.student.update({
      where: { id },
      data: {
        status, // "Active" | "Left" | "StruckOff"
        leavingDate: status === "Left" ? (leavingDate || new Date().toISOString().split("T")[0]) : null,
        leavingReason: status === "Left" ? leavingReason : null,
      },
    });

    await prisma.auditLog.create({
      data: {
        module: "Student",
        action: "Update",
        recordId: updated.admissionNo,
        details: `Status changed to ${status}. Reason: ${leavingReason || "N/A"}`,
        performedBy: req.user ? req.user.name : "Admin",
      },
    });

    return res.status(200).json(new ApiResponse(200, updated, `Student status updated to ${status}`));
  } catch (error) {
    next(error);
  }
};

const promoteStudent = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const { targetClassSectionId, sessionYear, finalResult } = req.body;

    const student = await prisma.student.findUnique({
      where: { id },
      include: { classSection: true },
    });

    if (!student) throw new ApiError(404, "Student not found");

    // Record previous session academic history
    await prisma.studentAcademicHistory.create({
      data: {
        studentId: student.id,
        sessionYear: sessionYear || "2025-2026",
        className: student.classSection.name,
        section: student.classSection.section,
        finalResult: finalResult || "Promoted",
        attendancePercentage: 92,
        remarks: `Promoted from ${student.classSection.name} to target class`,
      },
    });

    // Update to new class
    const updated = await prisma.student.update({
      where: { id },
      data: {
        classSectionId: parseInt(targetClassSectionId),
      },
      include: { classSection: true },
    });

    return res.status(200).json(new ApiResponse(200, updated, "Student promoted successfully"));
  } catch (error) {
    next(error);
  }
};

const findSiblingsByCnic = async (req, res, next) => {
  try {
    const { cnic } = req.query;
    if (!cnic) throw new ApiError(400, "Father CNIC is required");

    const siblings = await prisma.student.findMany({
      where: { fatherCnic: cnic.trim() },
      include: { classSection: true },
    });

    return res.status(200).json(new ApiResponse(200, siblings, "Siblings matched by Father CNIC"));
  } catch (error) {
    next(error);
  }
};

export {
  getAllStudents,
  getStudentById,
  createStudent,
  updateStudent,
  updateStudentStatus,
  promoteStudent,
  findSiblingsByCnic,
};

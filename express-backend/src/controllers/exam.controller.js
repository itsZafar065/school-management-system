import prisma from "../db.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

const getExamTerms = async (req, res, next) => {
  try {
    const terms = await prisma.examTerm.findMany({
      orderBy: { id: "desc" },
    });
    return res.status(200).json(new ApiResponse(200, terms, "Exam terms fetched"));
  } catch (error) {
    next(error);
  }
};

const createExamTerm = async (req, res, next) => {
  try {
    const { title, sessionYear, startDate, endDate } = req.body;
    if (!title || !startDate || !endDate) {
      throw new ApiError(400, "Title, start date, and end date are required");
    }

    const term = await prisma.examTerm.create({
      data: {
        title,
        sessionYear: sessionYear || "2025-2026",
        startDate,
        endDate,
        isLocked: false,
      },
    });

    return res.status(201).json(new ApiResponse(201, term, "Exam term created successfully"));
  } catch (error) {
    next(error);
  }
};

const lockExamTerm = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const { isLocked } = req.body;

    const updated = await prisma.examTerm.update({
      where: { id },
      data: { isLocked: isLocked !== undefined ? isLocked : true },
    });

    await prisma.auditLog.create({
      data: {
        module: "Marks",
        action: "Approve",
        recordId: String(id),
        details: `Exam term ${updated.title} results ${updated.isLocked ? "LOCKED and approved by Principal" : "UNLOCKED"}`,
        performedBy: req.user ? req.user.name : "Principal",
      },
    });

    return res.status(200).json(
      new ApiResponse(200, updated, `Exam term results ${updated.isLocked ? "locked" : "unlocked"}`)
    );
  } catch (error) {
    next(error);
  }
};

const getExamResults = async (req, res, next) => {
  try {
    const { examTermId, classSectionId, subjectId } = req.query;

    const where = {};
    if (examTermId) where.examTermId = parseInt(examTermId);
    if (classSectionId) where.classSectionId = parseInt(classSectionId);
    if (subjectId) where.subjectId = parseInt(subjectId);

    const results = await prisma.examResult.findMany({
      where,
      include: {
        student: true,
        subject: true,
        examTerm: true,
      },
      orderBy: { student: { rollNo: "asc" } },
    });

    return res.status(200).json(new ApiResponse(200, results, "Exam marks fetched"));
  } catch (error) {
    next(error);
  }
};

const saveExamResults = async (req, res, next) => {
  try {
    const { examTermId, classSectionId, subjectId, marksList } = req.body;

    if (!examTermId || !classSectionId || !subjectId || !Array.isArray(marksList)) {
      throw new ApiError(400, "Exam Term, Class, Subject, and marks array are required");
    }

    const term = await prisma.examTerm.findUnique({ where: { id: parseInt(examTermId) } });
    if (term && term.isLocked) {
      throw new ApiError(403, "This exam term has been locked and approved by the Principal. Marks cannot be modified.");
    }

    const subject = await prisma.subject.findUnique({ where: { id: parseInt(subjectId) } });
    const maxMarks = subject ? subject.totalMarks : 100;

    const promises = marksList.map((item) => {
      const obtained = Math.min(maxMarks, Math.max(0, parseFloat(item.obtainedMarks) || 0));
      const pct = (obtained / maxMarks) * 100;
      let grade = "F";
      if (pct >= 80) grade = "A+";
      else if (pct >= 70) grade = "A";
      else if (pct >= 60) grade = "B";
      else if (pct >= 50) grade = "C";
      else if (pct >= 40) grade = "D";

      return prisma.examResult.upsert({
        where: {
          examTermId_studentId_subjectId: {
            examTermId: parseInt(examTermId),
            studentId: item.studentId,
            subjectId: parseInt(subjectId),
          },
        },
        update: {
          obtainedMarks: obtained,
          totalMarks: maxMarks,
          grade,
          remarks: item.remarks || null,
        },
        create: {
          examTermId: parseInt(examTermId),
          studentId: item.studentId,
          classSectionId: parseInt(classSectionId),
          subjectId: parseInt(subjectId),
          obtainedMarks: obtained,
          totalMarks: maxMarks,
          grade,
          remarks: item.remarks || null,
        },
      });
    });

    await Promise.all(promises);

    return res.status(200).json(
      new ApiResponse(200, { count: marksList.length }, "Marks saved successfully")
    );
  } catch (error) {
    next(error);
  }
};

const getReportCard = async (req, res, next) => {
  try {
    const studentId = parseInt(req.params.studentId);
    const { examTermId } = req.query;

    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: { classSection: true },
    });
    if (!student) throw new ApiError(404, "Student record not found");

    const termWhere = examTermId ? { id: parseInt(examTermId) } : { isLocked: true };
    const term = await prisma.examTerm.findFirst({
      where: termWhere,
      orderBy: { id: "desc" },
    });

    if (!term) throw new ApiError(404, "No exam term found for report card");

    const results = await prisma.examResult.findMany({
      where: {
        studentId,
        examTermId: term.id,
      },
      include: { subject: true },
    });

    const setting = await prisma.setting.findFirst();

    // Calculate totals
    const totalMax = results.reduce((sum, r) => sum + r.totalMarks, 0);
    const totalObtained = results.reduce((sum, r) => sum + r.obtainedMarks, 0);
    const percentage = totalMax > 0 ? ((totalObtained / totalMax) * 100).toFixed(1) : 0;

    let overallGrade = "F";
    const numPct = parseFloat(percentage);
    if (numPct >= 80) overallGrade = "A+";
    else if (numPct >= 70) overallGrade = "A";
    else if (numPct >= 60) overallGrade = "B";
    else if (numPct >= 50) overallGrade = "C";
    else if (numPct >= 40) overallGrade = "D";

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          student,
          examTerm: term,
          results,
          summary: {
            totalMax,
            totalObtained,
            percentage,
            grade: overallGrade,
            status: numPct >= 33 ? "PASSED" : "FAILED",
            attendancePercentage: 94.2,
          },
          school: setting,
        },
        "Report card compiled"
      )
    );
  } catch (error) {
    next(error);
  }
};

export {
  getExamTerms,
  createExamTerm,
  lockExamTerm,
  getExamResults,
  saveExamResults,
  getReportCard,
};

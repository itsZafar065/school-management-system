import prisma from "../db.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

const getAllClasses = async (req, res, next) => {
  try {
    const classes = await prisma.classSection.findMany({
      include: {
        _count: {
          select: { students: true },
        },
        subjects: true,
      },
      orderBy: [
        { gradeLevel: "asc" },
        { section: "asc" },
      ],
    });

    const list = classes.map((c) => ({
      ...c,
      studentCount: c._count.students,
    }));

    return res.status(200).json(new ApiResponse(200, list, "Classes fetched successfully"));
  } catch (error) {
    next(error);
  }
};

const getClassById = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const cls = await prisma.classSection.findUnique({
      where: { id },
      include: {
        students: {
          where: { status: "Active" },
          orderBy: { rollNo: "asc" },
        },
        subjects: true,
      },
    });

    if (!cls) throw new ApiError(404, "Class section not found");

    return res.status(200).json(
      new ApiResponse(200, { ...cls, studentCount: cls.students.length }, "Class details fetched")
    );
  } catch (error) {
    next(error);
  }
};

const createClass = async (req, res, next) => {
  try {
    const { name, section, gradeLevel, room, capacity, tuitionFee, admissionFee, annualFund, examFee, classTeacher } = req.body;

    if (!name) throw new ApiError(400, "Class name is required");

    const newClass = await prisma.classSection.create({
      data: {
        name,
        section: section || "A",
        gradeLevel: parseInt(gradeLevel) || 1,
        room: room || "Room 101",
        capacity: parseInt(capacity) || 40,
        tuitionFee: parseInt(tuitionFee) || 3500,
        admissionFee: parseInt(admissionFee) || 5000,
        annualFund: parseInt(annualFund) || 2000,
        examFee: parseInt(examFee) || 1000,
        classTeacher: classTeacher || "Unassigned",
      },
    });

    return res.status(201).json(new ApiResponse(201, newClass, "Class created successfully"));
  } catch (error) {
    next(error);
  }
};

const updateClass = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const updated = await prisma.classSection.update({
      where: { id },
      data: {
        ...req.body,
        id: undefined,
        gradeLevel: req.body.gradeLevel ? parseInt(req.body.gradeLevel) : undefined,
        capacity: req.body.capacity ? parseInt(req.body.capacity) : undefined,
        tuitionFee: req.body.tuitionFee ? parseInt(req.body.tuitionFee) : undefined,
        admissionFee: req.body.admissionFee ? parseInt(req.body.admissionFee) : undefined,
        annualFund: req.body.annualFund ? parseInt(req.body.annualFund) : undefined,
        examFee: req.body.examFee ? parseInt(req.body.examFee) : undefined,
      },
    });

    return res.status(200).json(new ApiResponse(200, updated, "Class updated successfully"));
  } catch (error) {
    next(error);
  }
};

const deleteClass = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const studentCount = await prisma.student.count({ where: { classSectionId: id } });
    if (studentCount > 0) {
      throw new ApiError(400, `Cannot delete class with ${studentCount} enrolled students. Reassign students first.`);
    }

    await prisma.classSection.delete({ where: { id } });
    return res.status(200).json(new ApiResponse(200, null, "Class removed"));
  } catch (error) {
    next(error);
  }
};

export { getAllClasses, getClassById, createClass, updateClass, deleteClass };

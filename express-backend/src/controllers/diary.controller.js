import prisma from "../db.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

const getDiaryNotices = async (req, res, next) => {
  try {
    const { type, classSectionId } = req.query;

    const where = {};
    if (type && type !== "all") where.type = type;
    if (classSectionId && classSectionId !== "all") {
      where.OR = [
        { targetType: "All" },
        { classSectionId: parseInt(classSectionId) },
      ];
    }

    const entries = await prisma.diaryNotice.findMany({
      where,
      orderBy: { id: "desc" },
    });

    return res.status(200).json(new ApiResponse(200, entries, "Diary and notices fetched"));
  } catch (error) {
    next(error);
  }
};

const createDiaryNotice = async (req, res, next) => {
  try {
    const { type, title, content, targetType, classSectionId, date } = req.body;

    if (!title || !content) {
      throw new ApiError(400, "Title and content are required");
    }

    const entry = await prisma.diaryNotice.create({
      data: {
        type: type || "Notice",
        title,
        content,
        targetType: targetType || "All",
        classSectionId: classSectionId ? parseInt(classSectionId) : null,
        date: date || new Date().toISOString().split("T")[0],
        createdBy: req.user ? req.user.name : "Admin",
      },
    });

    return res.status(201).json(new ApiResponse(201, entry, "Notice/Diary entry posted successfully"));
  } catch (error) {
    next(error);
  }
};

const deleteDiaryNotice = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    await prisma.diaryNotice.delete({ where: { id } });
    return res.status(200).json(new ApiResponse(200, null, "Entry removed"));
  } catch (error) {
    next(error);
  }
};

export { getDiaryNotices, createDiaryNotice, deleteDiaryNotice };

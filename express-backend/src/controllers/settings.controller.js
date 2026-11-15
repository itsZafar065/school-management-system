import prisma from "../db.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

const getSettings = async (req, res, next) => {
  try {
    let setting = await prisma.setting.findFirst();
    if (!setting) {
      setting = await prisma.setting.create({ data: { id: 1 } });
    }
    return res.status(200).json(new ApiResponse(200, setting, "School settings fetched"));
  } catch (error) {
    next(error);
  }
};

const updateSettings = async (req, res, next) => {
  try {
    const existing = await prisma.setting.findFirst();
    const id = existing ? existing.id : 1;

    const updated = await prisma.setting.upsert({
      where: { id },
      update: req.body,
      create: { ...req.body, id: 1 },
    });

    return res.status(200).json(new ApiResponse(200, updated, "Settings updated successfully"));
  } catch (error) {
    next(error);
  }
};

export { getSettings, updateSettings };

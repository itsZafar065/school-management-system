import prisma from "../db.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

const getAllStaff = async (req, res, next) => {
  try {
    const { role, status, search } = req.query;

    const where = {};
    if (role && role !== "all") where.role = role;
    if (status && status !== "all") where.status = status;
    if (search) {
      const q = search.trim();
      where.OR = [
        { name: { contains: q } },
        { employeeNo: { contains: q } },
        { cnic: { contains: q } },
        { designation: { contains: q } },
      ];
    }

    const staff = await prisma.staff.findMany({
      where,
      orderBy: { employeeNo: "asc" },
    });

    return res.status(200).json(new ApiResponse(200, staff, "Staff records fetched successfully"));
  } catch (error) {
    next(error);
  }
};

const getStaffById = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const staff = await prisma.staff.findUnique({
      where: { id },
      include: {
        payrolls: {
          orderBy: { month: "desc" },
          take: 6,
        },
        leaves: {
          orderBy: { createdAt: "desc" },
          take: 6,
        },
      },
    });

    if (!staff) throw new ApiError(404, "Staff member not found");

    return res.status(200).json(new ApiResponse(200, staff, "Staff profile fetched"));
  } catch (error) {
    next(error);
  }
};

const createStaff = async (req, res, next) => {
  try {
    const { name, cnic, phone, email, designation, role, qualification, basicSalary, allowance } = req.body;

    if (!name || !cnic || !phone || !designation) {
      throw new ApiError(400, "Name, CNIC, Phone, and Designation are required");
    }

    const last = await prisma.staff.findFirst({ orderBy: { id: "desc" } });
    const nextNo = `EMP-${String((last ? last.id : 0) + 1).padStart(2, "0")}`;

    const newStaff = await prisma.staff.create({
      data: {
        employeeNo: req.body.employeeNo || nextNo,
        name,
        cnic,
        phone,
        email: email || null,
        designation,
        role: role || "Teacher",
        qualification: qualification || "B.Ed",
        joinedDate: new Date().toISOString().split("T")[0],
        basicSalary: parseInt(basicSalary) || 35000,
        allowance: parseInt(allowance) || 0,
      },
    });

    return res.status(201).json(new ApiResponse(201, newStaff, "Staff registered successfully"));
  } catch (error) {
    next(error);
  }
};

const updateStaff = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const updated = await prisma.staff.update({
      where: { id },
      data: {
        ...req.body,
        id: undefined,
        basicSalary: req.body.basicSalary ? parseInt(req.body.basicSalary) : undefined,
        allowance: req.body.allowance ? parseInt(req.body.allowance) : undefined,
      },
    });

    return res.status(200).json(new ApiResponse(200, updated, "Staff details updated"));
  } catch (error) {
    next(error);
  }
};

const deleteStaff = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    await prisma.staff.update({
      where: { id },
      data: { status: "Left" },
    });
    return res.status(200).json(new ApiResponse(200, null, "Staff marked as Left"));
  } catch (error) {
    next(error);
  }
};

export { getAllStaff, getStaffById, createStaff, updateStaff, deleteStaff };

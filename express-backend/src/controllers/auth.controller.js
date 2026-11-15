import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import prisma from "../db.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

const JWT_SECRET = process.env.JWT_SECRET || "school_management_jwt_secret_key_2026_secure";

const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      throw new ApiError(400, "Username/Email and password are required");
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { username: username.trim() },
          { email: username.trim().toLowerCase() },
        ],
      },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials. Please verify username and password.",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials. Incorrect password.",
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name,
        role: user.role,
        designation: user.designation,
        staffId: user.staffId,
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    const safeUser = {
      id: user.id,
      username: user.username,
      email: user.email,
      name: user.name,
      role: user.role,
      designation: user.designation,
      staffId: user.staffId,
    };

    return res.status(200).json(
      new ApiResponse(200, { user: safeUser, token }, "Login successful")
    );
  } catch (error) {
    next(error);
  }
};

const logout = (req, res) => {
  return res.status(200).json(new ApiResponse(200, null, "Logout successful"));
};

const getMe = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    });

    if (!user) {
      throw new ApiError(404, "User record not found");
    }

    const safeUser = {
      id: user.id,
      username: user.username,
      email: user.email,
      name: user.name,
      role: user.role,
      designation: user.designation,
      staffId: user.staffId,
    };

    return res.status(200).json(new ApiResponse(200, safeUser, "User session valid"));
  } catch (error) {
    next(error);
  }
};

export { login, logout, getMe };

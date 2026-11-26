import { Router } from "express";
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} from "../controllers/user.controllers.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { adminMiddleware } from "../middlewares/admin.middleware.js";
import { validator } from "../middlewares/validator.js";
import {
  createUserValidations,
  updateUserValidations,
  userIdValidations,
} from "../middlewares/validations/user.validations.js";

export const userRoutes = Router();

userRoutes.use(authMiddleware, adminMiddleware);

userRoutes.get("/", getAllUsers);
userRoutes.get("/:id", userIdValidations, validator, getUserById);
userRoutes.post("/", createUserValidations, validator, createUser);
userRoutes.put("/:id", updateUserValidations, validator, updateUser);
userRoutes.delete("/:id", userIdValidations, validator, deleteUser);
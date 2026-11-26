import { Router } from "express";
import { register, login, getProfile, updateProfile, logout } from "../controllers/auth.controllers.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { validator } from "../middlewares/validator.js";
import {
  registerValidations,
  loginValidations,
  updateProfileValidations,
} from "../middlewares/validations/user.validations.js";

export const authRoutes = Router();

authRoutes.post("/register", registerValidations, validator, register);
authRoutes.post("/login", loginValidations, validator, login);

authRoutes.get("/profile", authMiddleware, getProfile);
authRoutes.put("/profile", authMiddleware, updateProfileValidations, validator, updateProfile);
authRoutes.post("/logout", authMiddleware, logout);
import { Router } from "express";
import {
  createTag,
  getAllTags,
  getTagById,
  updateTag,
  deleteTag,
} from "../controllers/tag.controllers.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { adminMiddleware } from "../middlewares/admin.middleware.js";
import { validator } from "../middlewares/validator.js";
import {
  createTagValidations,
  updateTagValidations,
  tagIdValidations,
} from "../middlewares/validations/tag.validations.js";

export const tagRoutes = Router();

tagRoutes.use(authMiddleware);

tagRoutes.get("/", getAllTags); // cualquier usuario logueado
tagRoutes.post("/", adminMiddleware, createTagValidations, validator, createTag);
tagRoutes.get("/:id", adminMiddleware, tagIdValidations, validator, getTagById);
tagRoutes.put("/:id", adminMiddleware, updateTagValidations, validator, updateTag);
tagRoutes.delete("/:id", adminMiddleware, tagIdValidations, validator, deleteTag);
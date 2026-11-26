import { Router } from "express";
import {
  createArticle,
  getAllArticles,
  getArticleById,
  getMyArticles,
  getMyArticleById,
  updateArticle,
  deleteArticle,
} from "../controllers/article.controllers.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { ownerMiddleware } from "../middlewares/owner.middleware.js";
import { validator } from "../middlewares/validator.js";
import {
  createArticleValidations,
  updateArticleValidations,
  articleIdValidations,
} from "../middlewares/validations/article.validations.js";

export const articleRoutes = Router();

articleRoutes.use(authMiddleware);

articleRoutes.post("/", createArticleValidations, validator, createArticle);
articleRoutes.get("/", getAllArticles);

articleRoutes.get("/user", getMyArticles);
articleRoutes.get("/user/:id", articleIdValidations, validator, getMyArticleById);

articleRoutes.get("/:id", articleIdValidations, validator, getArticleById);
articleRoutes.put("/:id", updateArticleValidations, validator, ownerMiddleware, updateArticle);
articleRoutes.delete("/:id", articleIdValidations, validator, ownerMiddleware, deleteArticle);
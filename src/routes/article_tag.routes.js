import { Router } from "express";
import { addTagToArticle, removeTagFromArticle } from "../controllers/article_tag.controllers.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import {
  articleAuthorMiddleware,
  articleTagAuthorMiddleware,
} from "../middlewares/owner.middleware.js";
import { validator } from "../middlewares/validator.js";
import {
  addTagToArticleValidations,
  removeTagFromArticleValidations,
} from "../middlewares/validations/article_tag.validations.js";

export const articleTagRoutes = Router();

articleTagRoutes.use(authMiddleware);

articleTagRoutes.post(
  "/",
  addTagToArticleValidations,
  validator,
  articleAuthorMiddleware,
  addTagToArticle
);

articleTagRoutes.delete(
  "/:articleTagId",
  removeTagFromArticleValidations,
  validator,
  articleTagAuthorMiddleware,
  removeTagFromArticle
);
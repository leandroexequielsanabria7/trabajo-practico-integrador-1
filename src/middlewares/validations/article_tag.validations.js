import { body } from "express-validator";
import { ArticleModel } from "../../models/article.model.js";
import { TagModel } from "../../models/tag.model.js";
import { ArticleTagModel } from "../../models/article_tag.model.js";
import { idParam } from "./common.validations.js";

export const addTagToArticleValidations = [
  body("article_id")
    .notEmpty()
    .withMessage("article_id es obligatorio")
    .isInt({ min: 1 })
    .withMessage("article_id debe ser un número entero positivo")
    .bail()
    .toInt()
    .custom(async (articleId) => {
      const article = await ArticleModel.findByPk(articleId);
      if (!article) throw new Error("El artículo no existe");
      return true;
    }),
  body("tag_id")
    .notEmpty()
    .withMessage("tag_id es obligatorio")
    .isInt({ min: 1 })
    .withMessage("tag_id debe ser un número entero positivo")
    .bail()
    .toInt()
    .custom(async (tagId, { req }) => {
      const tag = await TagModel.findByPk(tagId);
      if (!tag) throw new Error("La etiqueta no existe");

      const exists = await ArticleTagModel.findOne({
        where: { article_id: req.body.article_id, tag_id: tagId },
      });
      if (exists) throw new Error("El artículo ya tiene asignada esa etiqueta");
      return true;
    }),
];

export const removeTagFromArticleValidations = [idParam("articleTagId")];
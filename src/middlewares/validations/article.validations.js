import { body } from "express-validator";
import { UserModel } from "../../models/user.model.js";
import { idParam } from "./common.validations.js";

const titleRule = (optional = false) => {
  const base = optional ? body("title").optional() : body("title");
  return base
    .trim()
    .notEmpty()
    .withMessage("El título es obligatorio")
    .isLength({ min: 3, max: 200 })
    .withMessage("El título debe tener entre 3 y 200 caracteres");
};

const contentRule = (optional = false) => {
  const base = optional ? body("content").optional() : body("content");
  return base
    .trim()
    .notEmpty()
    .withMessage("El contenido es obligatorio")
    .isLength({ min: 50 })
    .withMessage("El contenido debe tener al menos 50 caracteres");
};

const excerptRule = () =>
  body("excerpt")
    .optional({ values: "null" })
    .trim()
    .isLength({ max: 500 })
    .withMessage("El resumen no puede superar los 500 caracteres");

const statusRule = () =>
  body("status")
    .optional()
    .isIn(["published", "archived"])
    .withMessage("El estado solo puede ser 'published' o 'archived'");

const userIdRule = () =>
  body("user_id")
    .optional()
    .isInt({ min: 1 })
    .withMessage("user_id debe ser un número entero positivo")
    .toInt()
    .custom(async (userId, { req }) => {
      if (req.user.role !== "admin" && userId !== req.user.id) {
        throw new Error("No podés crear artículos a nombre de otro usuario");
      }
      const user = await UserModel.findByPk(userId);
      if (!user) throw new Error("El usuario indicado no existe");
      return true;
    });

export const createArticleValidations = [
  titleRule(),
  contentRule(),
  excerptRule(),
  statusRule(),
  userIdRule(),
];

export const updateArticleValidations = [
  idParam(),
  titleRule(true),
  contentRule(true),
  excerptRule(),
  statusRule(),
];

export const articleIdValidations = [idParam()];
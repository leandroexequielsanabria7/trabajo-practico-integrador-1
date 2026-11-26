import { body } from "express-validator";
import { Op } from "sequelize";
import { TagModel } from "../../models/tag.model.js";
import { idParam } from "./common.validations.js";

const nameRule = () =>
  body("name")
    .trim()
    .notEmpty()
    .withMessage("El nombre de la etiqueta es obligatorio")
    .isLength({ min: 2, max: 30 })
    .withMessage("El nombre debe tener entre 2 y 30 caracteres")
    .matches(/^\S+$/)
    .withMessage("El nombre de la etiqueta no puede contener espacios")
    .bail()
    .custom(async (name, { req }) => {
      const where = { name };
      if (req.params.id) where.id = { [Op.ne]: req.params.id };
      const tag = await TagModel.findOne({ where });
      if (tag) throw new Error("Ya existe una etiqueta con ese nombre");
      return true;
    });

export const createTagValidations = [nameRule()];
export const updateTagValidations = [idParam(), nameRule()];
export const tagIdValidations = [idParam()];
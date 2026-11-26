import { body } from "express-validator";
import { Op } from "sequelize";
import { UserModel } from "../../models/user.model.js";
import { idParam, profileRules } from "./common.validations.js";

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

const isTaken = async (field, value, req) => {
  const where = { [field]: value };
  if (req.params.id) where.id = { [Op.ne]: req.params.id };
  const user = await UserModel.findOne({ where, paranoid: false });
  return user !== null;
};

const usernameRule = (optional = false) => {
  const base = optional ? body("username").optional() : body("username");
  return base
    .trim()
    .notEmpty()
    .withMessage("El username es obligatorio")
    .isLength({ min: 3, max: 20 })
    .withMessage("El username debe tener entre 3 y 20 caracteres")
    .isAlphanumeric()
    .withMessage("El username solo puede contener letras y números")
    .bail()
    .custom(async (value, { req }) => {
      if (await isTaken("username", value, req)) {
        throw new Error("El username ya está en uso");
      }
      return true;
    });
};

const emailRule = (optional = false) => {
  const base = optional ? body("email").optional() : body("email");
  return base
    .trim()
    .notEmpty()
    .withMessage("El email es obligatorio")
    .isEmail()
    .withMessage("El email no tiene un formato válido")
    .isLength({ max: 100 })
    .withMessage("El email no puede superar los 100 caracteres")
    .toLowerCase()
    .bail()
    .custom(async (value, { req }) => {
      if (await isTaken("email", value, req)) {
        throw new Error("El email ya está registrado");
      }
      return true;
    });
};

const passwordRule = (optional = false) => {
  const base = optional ? body("password").optional() : body("password");
  return base
    .notEmpty()
    .withMessage("La contraseña es obligatoria")
    .matches(PASSWORD_REGEX)
    .withMessage(
      "La contraseña debe tener mínimo 8 caracteres, una mayúscula, una minúscula y un número"
    );
};

const roleRule = () =>
  body("role")
    .optional()
    .isIn(["user", "admin"])
    .withMessage("El rol solo puede ser 'user' o 'admin'");

export const registerValidations = [usernameRule(), emailRule(), passwordRule(), ...profileRules()];

export const loginValidations = [
  body("username").trim().notEmpty().withMessage("El username es obligatorio"),
  body("password").notEmpty().withMessage("La contraseña es obligatoria"),
];

export const updateProfileValidations = [...profileRules(true)];

export const createUserValidations = [
  usernameRule(),
  emailRule(),
  passwordRule(),
  roleRule(),
  ...profileRules(),
];

export const updateUserValidations = [
  idParam(),
  usernameRule(true),
  emailRule(true),
  passwordRule(true),
  roleRule(),
];

export const userIdValidations = [idParam()];
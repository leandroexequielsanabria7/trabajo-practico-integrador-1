import { body, param } from "express-validator";

export const idParam = (name = "id") =>
  param(name)
    .isInt({ min: 1 })
    .withMessage(`El parámetro "${name}" debe ser un número entero positivo`)
    .toInt();

const nameRule = (field, label, optional) => {
  const base = optional ? body(field).optional() : body(field);
  return base
    .trim()
    .notEmpty()
    .withMessage(`${label} es obligatorio`)
    .isLength({ min: 2, max: 50 })
    .withMessage(`${label} debe tener entre 2 y 50 caracteres`)
    .isAlpha("es-ES", { ignore: " " })
    .withMessage(`${label} solo puede contener letras`);
};

export const profileRules = (optional = false) => [
  nameRule("first_name", "El nombre", optional),
  nameRule("last_name", "El apellido", optional),
  body("biography")
    .optional({ values: "null" })
    .trim()
    .isLength({ max: 500 })
    .withMessage("La biografía no puede superar los 500 caracteres"),
  body("avatar_url")
    .optional({ values: "falsy" })
    .trim()
    .isURL()
    .withMessage("avatar_url debe ser una URL válida"),
  body("birth_date")
    .optional({ values: "falsy" })
    .isISO8601()
    .withMessage("birth_date debe tener el formato YYYY-MM-DD"),
];
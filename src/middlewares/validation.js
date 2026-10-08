import { body, param, validationResult } from 'express-validator';
import { Article, ArticleTag, Tag, User } from '../models/index.js';

const rejectInvalid = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Error de validación',
      errors: errors.array().map(({ path, msg }) => ({ field: path, message: msg })),
    });
  }

  return next();
};

const ensureUserExists = (id) => User.findByPk(id).then((user) => {
  if (!user) throw new Error('El usuario no existe');
});
const ensureArticleExists = (id) => Article.findByPk(id).then((article) => {
  if (!article) throw new Error('El artículo no existe');
});
const ensureTagExists = (id) => Tag.findByPk(id).then((tag) => {
  if (!tag) throw new Error('La etiqueta no existe');
});
const ensureArticleTagExists = (id) => ArticleTag.findByPk(id).then((association) => {
  if (!association) throw new Error('La asociación de etiqueta no existe');
});

export const validateId = (name = 'id', exists) => [
  param(name)
    .isInt({ min: 1 }).withMessage('Debe ser un ID entero positivo')
    .toInt()
    .bail()
    .custom(async (id) => {
      if (exists) await exists(id);
    }),
  rejectInvalid,
];

const registrationRules = [
  body('username')
    .trim().isLength({ min: 3, max: 20 }).withMessage('Debe tener entre 3 y 20 caracteres')
    .matches(/^[a-zA-Z0-9]+$/).withMessage('Solo se permiten letras y números')
    .bail()
    .custom(async (username) => {
      if (await User.findOne({ where: { username } })) throw new Error('El nombre de usuario ya está registrado');
    }),
  body('email')
    .trim().isEmail().withMessage('Debe ser un email válido')
    .normalizeEmail()
    .bail()
    .custom(async (email) => {
      if (await User.findOne({ where: { email } })) throw new Error('El email ya está registrado');
    }),
  body('password')
    .isLength({ min: 8 }).withMessage('Debe tener al menos 8 caracteres')
    .matches(/[a-z]/).withMessage('Debe contener una minúscula')
    .matches(/[A-Z]/).withMessage('Debe contener una mayúscula')
    .matches(/[0-9]/).withMessage('Debe contener un número'),
  body('first_name')
    .trim().isLength({ min: 2, max: 50 }).withMessage('Debe tener entre 2 y 50 caracteres')
    .matches(/^[\p{L}\s'-]+$/u).withMessage('Solo se permiten letras'),
  body('last_name')
    .trim().isLength({ min: 2, max: 50 }).withMessage('Debe tener entre 2 y 50 caracteres')
    .matches(/^[\p{L}\s'-]+$/u).withMessage('Solo se permiten letras'),
];

export const validateRegistration = [
  ...registrationRules,
  rejectInvalid,
];

export const validateLogin = [
  body('email').trim().isEmail().withMessage('Debe ser un email válido').normalizeEmail(),
  body('password').notEmpty().withMessage('La contraseña es obligatoria'),
  rejectInvalid,
];

export const validateProfile = [
  body('first_name').optional().trim().isLength({ min: 2, max: 50 }).withMessage('Debe tener entre 2 y 50 caracteres')
    .matches(/^[\p{L}\s'-]+$/u).withMessage('Solo se permiten letras'),
  body('last_name').optional().trim().isLength({ min: 2, max: 50 }).withMessage('Debe tener entre 2 y 50 caracteres')
    .matches(/^[\p{L}\s'-]+$/u).withMessage('Solo se permiten letras'),
  body('biography').optional({ values: 'null' }).isLength({ max: 500 }).withMessage('Máximo 500 caracteres'),
  body('avatar_url').optional({ values: 'null' }).isURL().withMessage('Debe ser una URL válida'),
  body('birth_date').optional({ values: 'null' }).isISO8601().withMessage('Debe ser una fecha válida'),
  rejectInvalid,
];

export const validateAdminUser = [
  ...registrationRules,
  body('role').optional().isIn(['user', 'admin']).withMessage('Rol no permitido'),
  rejectInvalid,
];

export const validateUserUpdate = [
  body('username').optional().trim().isLength({ min: 3, max: 20 }).withMessage('Debe tener entre 3 y 20 caracteres')
    .matches(/^[a-zA-Z0-9]+$/).withMessage('Solo se permiten letras y números')
    .bail().custom(async (username, { req }) => {
      const found = await User.findOne({ where: { username } });
      if (found && found.id !== Number(req.params.id)) throw new Error('El nombre de usuario ya está registrado');
    }),
  body('email').optional().trim().isEmail().withMessage('Debe ser un email válido').normalizeEmail()
    .bail().custom(async (email, { req }) => {
      const found = await User.findOne({ where: { email } });
      if (found && found.id !== Number(req.params.id)) throw new Error('El email ya está registrado');
    }),
  body('password').optional().isLength({ min: 8 }).withMessage('Debe tener al menos 8 caracteres')
    .matches(/[a-z]/).withMessage('Debe contener una minúscula')
    .matches(/[A-Z]/).withMessage('Debe contener una mayúscula')
    .matches(/[0-9]/).withMessage('Debe contener un número'),
  body('role').optional().isIn(['user', 'admin']).withMessage('Rol no permitido'),
  body('first_name').optional().trim().isLength({ min: 2, max: 50 }).withMessage('Debe tener entre 2 y 50 caracteres')
    .matches(/^[\p{L}\s'-]+$/u).withMessage('Solo se permiten letras'),
  body('last_name').optional().trim().isLength({ min: 2, max: 50 }).withMessage('Debe tener entre 2 y 50 caracteres')
    .matches(/^[\p{L}\s'-]+$/u).withMessage('Solo se permiten letras'),
  body('biography').optional({ values: 'null' }).isLength({ max: 500 }).withMessage('Máximo 500 caracteres'),
  body('avatar_url').optional({ values: 'null' }).isURL().withMessage('Debe ser una URL válida'),
  body('birth_date').optional({ values: 'null' }).isISO8601().withMessage('Debe ser una fecha válida'),
  body().custom((value) => Object.keys(value).length > 0).withMessage('Debe enviar al menos un campo'),
  rejectInvalid,
];

export const validateTag = [
  body('name').trim().isLength({ min: 2, max: 30 }).withMessage('Debe tener entre 2 y 30 caracteres')
    .matches(/^\S+$/).withMessage('No se permiten espacios')
    .bail().custom(async (name) => {
      if (await Tag.findOne({ where: { name } })) throw new Error('La etiqueta ya existe');
    }),
  rejectInvalid,
];

export const validateTagUpdate = [
  body('name').trim().isLength({ min: 2, max: 30 }).withMessage('Debe tener entre 2 y 30 caracteres')
    .matches(/^\S+$/).withMessage('No se permiten espacios')
    .bail().custom(async (name, { req }) => {
      const found = await Tag.findOne({ where: { name } });
      if (found && found.id !== Number(req.params.id)) throw new Error('La etiqueta ya existe');
    }),
  rejectInvalid,
];

export const validateArticle = [
  body('title').trim().isLength({ min: 3, max: 200 }).withMessage('Debe tener entre 3 y 200 caracteres'),
  body('content').isString().trim().isLength({ min: 50 }).withMessage('Debe tener al menos 50 caracteres'),
  body('excerpt').optional({ values: 'null' }).isLength({ max: 500 }).withMessage('Máximo 500 caracteres'),
  body('status').optional().isIn(['published', 'archived']).withMessage('Estado no permitido'),
  body('user_id').optional().isInt({ min: 1 }).withMessage('Debe ser un ID entero positivo')
    .toInt().bail().custom(ensureUserExists),
  rejectInvalid,
];

export const validateArticleUpdate = [
  body('title').optional().trim().isLength({ min: 3, max: 200 }).withMessage('Debe tener entre 3 y 200 caracteres'),
  body('content').optional().isString().trim().isLength({ min: 50 }).withMessage('Debe tener al menos 50 caracteres'),
  body('excerpt').optional({ values: 'null' }).isLength({ max: 500 }).withMessage('Máximo 500 caracteres'),
  body('status').optional().isIn(['published', 'archived']).withMessage('Estado no permitido'),
  body('user_id').not().exists().withMessage('No se puede cambiar el autor'),
  body().custom((value) => Object.keys(value).length > 0).withMessage('Debe enviar al menos un campo'),
  rejectInvalid,
];

export const validateArticleTag = [
  body('article_id').isInt({ min: 1 }).withMessage('Debe ser un ID entero positivo').toInt().bail().custom(ensureArticleExists),
  body('tag_id').isInt({ min: 1 }).withMessage('Debe ser un ID entero positivo').toInt().bail().custom(ensureTagExists),
  rejectInvalid,
];

export const validateArticleTagId = validateId('articleTagId', ensureArticleTagExists);

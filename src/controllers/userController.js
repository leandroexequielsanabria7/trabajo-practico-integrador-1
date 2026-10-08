import { sequelize, Article, Profile, User } from '../models/index.js';
import { hashPassword } from '../helpers/auth.js';
import { serializeUser } from '../helpers/serializers.js';

const userIncludes = [
  { model: Profile, as: 'profile' },
  {
    model: Article,
    as: 'articles',
    attributes: ['id', 'title', 'excerpt', 'status', 'createdAt', 'updatedAt'],
  },
];

const profileFields = ['first_name', 'last_name', 'biography', 'avatar_url', 'birth_date'];
const userFields = ['username', 'email', 'role'];

export const listUsers = async (req, res) => {
  const users = await User.findAll({
    attributes: { exclude: ['password'] },
    include: userIncludes,
    order: [['id', 'ASC']],
  });

  return res.status(200).json({ users });
};

export const getUser = async (req, res) => {
  const user = await User.findByPk(req.params.id, {
    attributes: { exclude: ['password'] },
    include: userIncludes,
  });

  if (!user) {
    return res.status(404).json({ message: 'Usuario no encontrado' });
  }

  return res.status(200).json({ user });
};

export const createUser = async (req, res) => {
  const password = await hashPassword(req.body.password);

  const user = await sequelize.transaction(async (transaction) => {
    const createdUser = await User.create({
      username: req.body.username,
      email: req.body.email,
      password,
      role: req.body.role ?? 'user',
    }, { transaction });

    await Profile.create({
      user_id: createdUser.id,
      ...Object.fromEntries(profileFields
        .filter((field) => Object.hasOwn(req.body, field))
        .map((field) => [field, req.body[field]])),
    }, { transaction });

    return createdUser;
  });

  return res.status(201).json({
    message: 'Usuario creado correctamente',
    user: serializeUser(user),
  });
};

export const updateUser = async (req, res) => {
  const user = await User.findByPk(req.params.id);

  if (!user) {
    return res.status(404).json({ message: 'Usuario no encontrado' });
  }

  const userUpdates = Object.fromEntries(
    userFields.filter((field) => Object.hasOwn(req.body, field))
      .map((field) => [field, req.body[field]])
  );
  const profileUpdates = Object.fromEntries(
    profileFields.filter((field) => Object.hasOwn(req.body, field))
      .map((field) => [field, req.body[field]])
  );

  if (Object.hasOwn(req.body, 'password')) {
    userUpdates.password = await hashPassword(req.body.password);
  }

  const profile = Object.keys(profileUpdates).length
    ? await Profile.findOne({ where: { user_id: user.id } })
    : null;

  if (Object.keys(profileUpdates).length && !profile) {
    return res.status(409).json({ message: 'El usuario no tiene un perfil para actualizar' });
  }

  await sequelize.transaction(async (transaction) => {
    if (Object.keys(userUpdates).length) {
      await user.update(userUpdates, { transaction });
    }
    if (profile) {
      await profile.update(profileUpdates, { transaction });
    }
  });

  const updatedUser = await User.findByPk(user.id, { include: userIncludes });
  return res.status(200).json({
    message: 'Usuario actualizado correctamente',
    user: updatedUser,
  });
};

export const deleteUser = async (req, res) => {
  const user = await User.findByPk(req.params.id);

  if (!user) {
    return res.status(404).json({ message: 'Usuario no encontrado' });
  }

  await user.destroy();
  return res.status(200).json({ message: 'Usuario eliminado correctamente' });
};

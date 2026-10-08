import { sequelize, Profile, User } from '../models/index.js';
import {
  clearAuthCookie,
  comparePassword,
  createToken,
  hashPassword,
  setAuthCookie,
} from '../helpers/auth.js';
import { serializeUser } from '../helpers/serializers.js';

export const register = async (req, res) => {
  const { username, email, password, first_name, last_name } = req.body;
  const passwordHash = await hashPassword(password);

  const user = await sequelize.transaction(async (transaction) => {
    const createdUser = await User.create({
      username,
      email,
      password: passwordHash,
      role: 'user',
    }, { transaction });

    await Profile.create({
      user_id: createdUser.id,
      first_name,
      last_name,
      biography: req.body.biography ?? null,
      avatar_url: req.body.avatar_url ?? null,
      birth_date: req.body.birth_date ?? null,
    }, { transaction });

    return createdUser;
  });

  setAuthCookie(res, createToken(user));
  return res.status(201).json({
    message: 'Usuario registrado correctamente',
    user: serializeUser(user),
  });
};

export const login = async (req, res) => {
  const user = await User.unscoped().findOne({
    where: { email: req.body.email },
    attributes: ['id', 'username', 'email', 'password', 'role'],
  });

  if (!user || !(await comparePassword(req.body.password, user.password))) {
    return res.status(401).json({ message: 'Email o contraseña incorrectos' });
  }

  setAuthCookie(res, createToken(user));
  return res.status(200).json({
    message: 'Inicio de sesión exitoso',
    user: serializeUser(user),
  });
};

export const getProfile = async (req, res) => {
  const profile = await Profile.findOne({ where: { user_id: req.user.id } });

  if (!profile) {
    return res.status(404).json({ message: 'Perfil no encontrado' });
  }

  return res.status(200).json({
    user: serializeUser(req.user),
    profile,
  });
};

export const updateProfile = async (req, res) => {
  const profile = await Profile.findOne({ where: { user_id: req.user.id } });

  if (!profile) {
    return res.status(404).json({ message: 'Perfil no encontrado' });
  }

  const fields = ['first_name', 'last_name', 'biography', 'avatar_url', 'birth_date'];
  const updates = Object.fromEntries(
    fields.filter((field) => Object.hasOwn(req.body, field)).map((field) => [field, req.body[field]])
  );

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ message: 'Debe enviar al menos un campo para actualizar' });
  }

  await profile.update(updates);
  return res.status(200).json({ message: 'Perfil actualizado correctamente', profile });
};

export const logout = (req, res) => {
  clearAuthCookie(res);
  return res.status(200).json({ message: 'Sesión cerrada correctamente' });
};

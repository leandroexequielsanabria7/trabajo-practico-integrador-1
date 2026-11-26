import { matchedData } from "express-validator";
import { sequelize } from "../config/database.js";
import { UserModel } from "../models/user.model.js";
import { ProfileModel } from "../models/profile.model.js";
import { hashPassword, comparePassword } from "../helpers/bcrypt.helper.js";
import { generateToken } from "../helpers/jwt.helper.js";

const cookieOptions = {
  httpOnly: true, // JS del navegador no puede leerla (XSS)
  secure: process.env.NODE_ENV === "production", // solo HTTPS en producción
  sameSite: "strict", // no se envía desde otros sitios (CSRF)
};

// POST /api/auth/register → público
export const register = async (req, res) => {
  try {
    const { username, email, password, first_name, last_name, biography, avatar_url, birth_date } =
      matchedData(req);

    const hashedPassword = await hashPassword(password);

    // Transacción: se crean User y Profile juntos, o ninguno
    const user = await sequelize.transaction(async (t) => {
      const newUser = await UserModel.create(
        { username, email, password: hashedPassword },
        { transaction: t }
      );
      await ProfileModel.create(
        { user_id: newUser.id, first_name, last_name, biography, avatar_url, birth_date },
        { transaction: t }
      );
      return newUser;
    });

    return res.status(201).json({
      message: "Usuario registrado correctamente",
      data: { id: user.id, username: user.username, email: user.email, role: user.role },
    });
  } catch (error) {
    return res.status(500).json({ message: "Error al registrar el usuario", error: error.message });
  }
};

// POST /api/auth/login → público
export const login = async (req, res) => {
  try {
    const { username, password } = matchedData(req);

    const user = await UserModel.findOne({ where: { username } });
    if (!user) {
      return res.status(401).json({ message: "Credenciales inválidas" });
    }

    const validPassword = await comparePassword(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ message: "Credenciales inválidas" });
    }

    const token = generateToken({ id: user.id, username: user.username, role: user.role });

    res.cookie("token", token, { ...cookieOptions, maxAge: 1000 * 60 * 60 }); // 1 hora

    return res.status(200).json({
      message: "Login exitoso",
      data: { id: user.id, username: user.username, role: user.role },
    });
  } catch (error) {
    return res.status(500).json({ message: "Error al iniciar sesión", error: error.message });
  }
};

// GET /api/auth/profile → autenticado
export const getProfile = async (req, res) => {
  try {
    const user = await UserModel.findByPk(req.user.id, {
      attributes: { exclude: ["password"] },
      include: { model: ProfileModel, as: "profile" },
    });

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    return res.status(200).json({ message: "Perfil obtenido", data: user });
  } catch (error) {
    return res.status(500).json({ message: "Error al obtener el perfil", error: error.message });
  }
};

// PUT /api/auth/profile → autenticado
export const updateProfile = async (req, res) => {
  try {
    const data = matchedData(req, { locations: ["body"] });

    const profile = await ProfileModel.findOne({ where: { user_id: req.user.id } });
    if (!profile) {
      return res.status(404).json({ message: "Perfil no encontrado" });
    }

    await profile.update(data);

    return res.status(200).json({ message: "Perfil actualizado correctamente", data: profile });
  } catch (error) {
    return res.status(500).json({ message: "Error al actualizar el perfil", error: error.message });
  }
};

// POST /api/auth/logout → autenticado
export const logout = (req, res) => {
  try {
    res.clearCookie("token", cookieOptions);
    return res.status(200).json({ message: "Logout exitoso" });
  } catch (error) {
    return res.status(500).json({ message: "Error al cerrar sesión", error: error.message });
  }
};
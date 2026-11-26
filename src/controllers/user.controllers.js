import { matchedData } from "express-validator";
import { sequelize } from "../config/database.js";
import { UserModel } from "../models/user.model.js";
import { ProfileModel } from "../models/profile.model.js";
import { ArticleModel } from "../models/article.model.js";
import { hashPassword } from "../helpers/bcrypt.helper.js";

export const getAllUsers = async (req, res) => {
  try {
    const users = await UserModel.findAll({
      attributes: { exclude: ["password"] },
      include: { model: ProfileModel, as: "profile" },
    });
    return res.status(200).json({ message: "Usuarios obtenidos", data: users });
  } catch (error) {
    return res.status(500).json({ message: "Error al obtener usuarios", error: error.message });
  }
};

export const getUserById = async (req, res) => {
  try {
    const user = await UserModel.findByPk(req.params.id, {
      attributes: { exclude: ["password"] },
      include: [
        { model: ProfileModel, as: "profile" },
        { model: ArticleModel, as: "articles" },
      ],
    });

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    return res.status(200).json({ message: "Usuario obtenido", data: user });
  } catch (error) {
    return res.status(500).json({ message: "Error al obtener el usuario", error: error.message });
  }
};

export const createUser = async (req, res) => {
  try {
    const { username, email, password, role, first_name, last_name, biography, avatar_url, birth_date } =
      matchedData(req);

    const hashedPassword = await hashPassword(password);

    const user = await sequelize.transaction(async (t) => {
      const newUser = await UserModel.create(
        { username, email, password: hashedPassword, role },
        { transaction: t }
      );
      await ProfileModel.create(
        { user_id: newUser.id, first_name, last_name, biography, avatar_url, birth_date },
        { transaction: t }
      );
      return newUser;
    });

    return res.status(201).json({
      message: "Usuario creado correctamente",
      data: { id: user.id, username: user.username, email: user.email, role: user.role },
    });
  } catch (error) {
    return res.status(500).json({ message: "Error al crear el usuario", error: error.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    const user = await UserModel.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const data = matchedData(req, { locations: ["body"] });
    if (data.password) {
      data.password = await hashPassword(data.password);
    }

    await user.update(data);

    const { password, ...userWithoutPassword } = user.toJSON();
    return res
      .status(200)
      .json({ message: "Usuario actualizado correctamente", data: userWithoutPassword });
  } catch (error) {
    return res.status(500).json({ message: "Error al actualizar el usuario", error: error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const user = await UserModel.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    await user.destroy();

    return res.status(200).json({ message: "Usuario eliminado correctamente (eliminación lógica)" });
  } catch (error) {
    return res.status(500).json({ message: "Error al eliminar el usuario", error: error.message });
  }
};
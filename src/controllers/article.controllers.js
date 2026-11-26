import { matchedData } from "express-validator";
import { ArticleModel } from "../models/article.model.js";
import { UserModel } from "../models/user.model.js";
import { TagModel } from "../models/tag.model.js";

const articleIncludes = [
  { model: UserModel, as: "author", attributes: ["id", "username"] },
  { model: TagModel, as: "tags", attributes: ["id", "name"], through: { attributes: [] } },
];

export const createArticle = async (req, res) => {
  try {
    const data = matchedData(req);
    const user_id = req.user.role === "admin" && data.user_id ? data.user_id : req.user.id;

    const article = await ArticleModel.create({ ...data, user_id });

    return res.status(201).json({ message: "Artículo creado correctamente", data: article });
  } catch (error) {
    return res.status(500).json({ message: "Error al crear el artículo", error: error.message });
  }
};

export const getAllArticles = async (req, res) => {
  try {
    const articles = await ArticleModel.findAll({
      where: { status: "published" },
      include: articleIncludes,
    });
    return res.status(200).json({ message: "Artículos obtenidos", data: articles });
  } catch (error) {
    return res.status(500).json({ message: "Error al obtener artículos", error: error.message });
  }
};

export const getArticleById = async (req, res) => {
  try {
    const article = await ArticleModel.findByPk(req.params.id, { include: articleIncludes });

    if (!article) {
      return res.status(404).json({ message: "Artículo no encontrado" });
    }

    return res.status(200).json({ message: "Artículo obtenido", data: article });
  } catch (error) {
    return res.status(500).json({ message: "Error al obtener el artículo", error: error.message });
  }
};

export const getMyArticles = async (req, res) => {
  try {
    const articles = await ArticleModel.findAll({
      where: { user_id: req.user.id, status: "published" },
      include: articleIncludes,
    });
    return res.status(200).json({ message: "Tus artículos", data: articles });
  } catch (error) {
    return res.status(500).json({ message: "Error al obtener tus artículos", error: error.message });
  }
};

export const getMyArticleById = async (req, res) => {
  try {
    const article = await ArticleModel.findOne({
      where: { id: req.params.id, user_id: req.user.id },
      include: articleIncludes,
    });

    if (!article) {
      return res.status(404).json({ message: "No tenés un artículo con ese id" });
    }

    return res.status(200).json({ message: "Artículo obtenido", data: article });
  } catch (error) {
    return res.status(500).json({ message: "Error al obtener el artículo", error: error.message });
  }
};

export const updateArticle = async (req, res) => {
  try {
    const data = matchedData(req, { locations: ["body"] });
    await req.article.update(data);

    return res.status(200).json({ message: "Artículo actualizado correctamente", data: req.article });
  } catch (error) {
    return res.status(500).json({ message: "Error al actualizar el artículo", error: error.message });
  }
};

export const deleteArticle = async (req, res) => {
  try {
    await req.article.destroy();

    return res.status(200).json({ message: "Artículo eliminado correctamente" });
  } catch (error) {
    return res.status(500).json({ message: "Error al eliminar el artículo", error: error.message });
  }
};
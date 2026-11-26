import { matchedData } from "express-validator";
import { TagModel } from "../models/tag.model.js";
import { ArticleModel } from "../models/article.model.js";

export const createTag = async (req, res) => {
  try {
    const { name } = matchedData(req);
    const tag = await TagModel.create({ name });
    return res.status(201).json({ message: "Etiqueta creada correctamente", data: tag });
  } catch (error) {
    return res.status(500).json({ message: "Error al crear la etiqueta", error: error.message });
  }
};

export const getAllTags = async (req, res) => {
  try {
    const tags = await TagModel.findAll();
    return res.status(200).json({ message: "Etiquetas obtenidas", data: tags });
  } catch (error) {
    return res.status(500).json({ message: "Error al obtener etiquetas", error: error.message });
  }
};

export const getTagById = async (req, res) => {
  try {
    const tag = await TagModel.findByPk(req.params.id, {
      include: {
        model: ArticleModel,
        as: "articles",
        attributes: ["id", "title", "status", "user_id"],
        through: { attributes: [] },
      },
    });

    if (!tag) {
      return res.status(404).json({ message: "Etiqueta no encontrada" });
    }

    return res.status(200).json({ message: "Etiqueta obtenida", data: tag });
  } catch (error) {
    return res.status(500).json({ message: "Error al obtener la etiqueta", error: error.message });
  }
};

export const updateTag = async (req, res) => {
  try {
    const tag = await TagModel.findByPk(req.params.id);
    if (!tag) {
      return res.status(404).json({ message: "Etiqueta no encontrada" });
    }

    const { name } = matchedData(req, { locations: ["body"] });
    await tag.update({ name });

    return res.status(200).json({ message: "Etiqueta actualizada correctamente", data: tag });
  } catch (error) {
    return res.status(500).json({ message: "Error al actualizar la etiqueta", error: error.message });
  }
};

export const deleteTag = async (req, res) => {
  try {
    const tag = await TagModel.findByPk(req.params.id);
    if (!tag) {
      return res.status(404).json({ message: "Etiqueta no encontrada" });
    }

    await tag.destroy();

    return res.status(200).json({ message: "Etiqueta eliminada correctamente" });
  } catch (error) {
    return res.status(500).json({ message: "Error al eliminar la etiqueta", error: error.message });
  }
};
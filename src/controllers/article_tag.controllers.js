import { matchedData } from "express-validator";
import { ArticleTagModel } from "../models/article_tag.model.js";

export const addTagToArticle = async (req, res) => {
  try {
    const { article_id, tag_id } = matchedData(req);
    const articleTag = await ArticleTagModel.create({ article_id, tag_id });

    return res
      .status(201)
      .json({ message: "Etiqueta agregada al artículo correctamente", data: articleTag });
  } catch (error) {
    return res.status(500).json({ message: "Error al agregar la etiqueta", error: error.message });
  }
};

export const removeTagFromArticle = async (req, res) => {
  try {
    await req.articleTag.destroy();

    return res.status(200).json({ message: "Etiqueta removida del artículo correctamente" });
  } catch (error) {
    return res.status(500).json({ message: "Error al remover la etiqueta", error: error.message });
  }
};
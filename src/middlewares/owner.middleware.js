import { ArticleModel } from "../models/article.model.js";
import { ArticleTagModel } from "../models/article_tag.model.js";

export const ownerMiddleware = async (req, res, next) => {
  try {
    const article = await ArticleModel.findByPk(req.params.id);

    if (!article) {
      return res.status(404).json({ message: "Artículo no encontrado" });
    }

    const isOwner = article.user_id === req.user.id;
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res
        .status(403)
        .json({ message: "Solo el autor o un admin pueden modificar este artículo" });
    }

    req.article = article;
    next();
  } catch (error) {
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

export const articleAuthorMiddleware = async (req, res, next) => {
  try {
    const article = await ArticleModel.findByPk(req.body.article_id);

    if (!article) {
      return res.status(404).json({ message: "Artículo no encontrado" });
    }

    if (article.user_id !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Solo el autor del artículo puede gestionar sus etiquetas" });
    }

    next();
  } catch (error) {
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

export const articleTagAuthorMiddleware = async (req, res, next) => {
  try {
    const articleTag = await ArticleTagModel.findByPk(req.params.articleTagId, {
      include: { model: ArticleModel, as: "article" },
    });

    if (!articleTag) {
      return res.status(404).json({ message: "Asociación artículo-etiqueta no encontrada" });
    }

    if (articleTag.article.user_id !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Solo el autor del artículo puede quitar sus etiquetas" });
    }

    req.articleTag = articleTag;
    next();
  } catch (error) {
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};
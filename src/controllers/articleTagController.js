import { Article, ArticleTag } from '../models/index.js';

export const addTagToArticle = async (req, res) => {
  const existingAssociation = await ArticleTag.findOne({
    where: {
      article_id: req.body.article_id,
      tag_id: req.body.tag_id,
    },
  });

  if (existingAssociation) {
    return res.status(409).json({ message: 'La etiqueta ya está asociada al artículo' });
  }

  const association = await ArticleTag.create({
    article_id: req.article.id,
    tag_id: req.body.tag_id,
  });

  return res.status(201).json({
    message: 'Etiqueta asociada correctamente',
    association,
  });
};

export const removeTagFromArticle = async (req, res) => {
  const association = await ArticleTag.findByPk(req.params.articleTagId);

  if (!association) {
    return res.status(404).json({ message: 'Asociación no encontrada' });
  }

  const article = await Article.findByPk(association.article_id);

  if (!article) {
    return res.status(404).json({ message: 'Artículo no encontrado' });
  }

  if (article.user_id !== req.user.id) {
    return res.status(403).json({ message: 'Solo el autor puede quitar etiquetas del artículo' });
  }

  await association.destroy();
  return res.status(200).json({ message: 'Etiqueta removida correctamente' });
};

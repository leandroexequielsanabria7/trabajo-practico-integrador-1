import { sequelize, Article, ArticleTag, Profile, Tag, User } from '../models/index.js';

const articleIncludes = [
  {
    model: User,
    as: 'author',
    attributes: ['id', 'username'],
    include: [{
      model: Profile,
      as: 'profile',
      attributes: ['first_name', 'last_name', 'avatar_url'],
    }],
  },
  {
    model: Tag,
    as: 'tags',
    through: { attributes: [] },
  },
];

export const listPublishedArticles = async (req, res) => {
  const articles = await Article.findAll({
    where: { status: 'published' },
    include: articleIncludes,
    order: [['createdAt', 'DESC']],
  });

  return res.status(200).json({ articles });
};

export const listMyPublishedArticles = async (req, res) => {
  const articles = await Article.findAll({
    where: { user_id: req.user.id, status: 'published' },
    include: articleIncludes,
    order: [['createdAt', 'DESC']],
  });

  return res.status(200).json({ articles });
};

export const getArticle = async (req, res) => {
  const article = await Article.findByPk(req.params.id, { include: articleIncludes });

  if (!article || (
    article.status !== 'published'
    && req.user.role !== 'admin'
    && article.user_id !== req.user.id
  )) {
    return res.status(404).json({ message: 'Artículo no encontrado' });
  }

  return res.status(200).json({ article });
};

export const getMyArticle = async (req, res) => {
  const article = await Article.findOne({
    where: { id: req.params.id, user_id: req.user.id },
    include: articleIncludes,
  });

  if (!article) {
    return res.status(404).json({ message: 'Artículo no encontrado' });
  }

  return res.status(200).json({ article });
};

export const createArticle = async (req, res) => {
  const requestedUserId = req.body.user_id ?? req.user.id;

  if (req.user.role !== 'admin' && requestedUserId !== req.user.id) {
    return res.status(403).json({ message: 'Solo puedes crear artículos para tu usuario' });
  }

  const article = await Article.create({
    title: req.body.title,
    content: req.body.content,
    excerpt: req.body.excerpt ?? null,
    status: req.body.status ?? 'published',
    user_id: requestedUserId,
  });

  const createdArticle = await Article.findByPk(article.id, { include: articleIncludes });
  return res.status(201).json({
    message: 'Artículo creado correctamente',
    article: createdArticle,
  });
};

export const updateArticle = async (req, res) => {
  const fields = ['title', 'content', 'excerpt', 'status'];
  const updates = Object.fromEntries(
    fields.filter((field) => Object.hasOwn(req.body, field))
      .map((field) => [field, req.body[field]])
  );

  await req.article.update(updates);
  const article = await Article.findByPk(req.article.id, { include: articleIncludes });

  return res.status(200).json({
    message: 'Artículo actualizado correctamente',
    article,
  });
};

export const deleteArticle = async (req, res) => {
  await sequelize.transaction(async (transaction) => {
    await ArticleTag.destroy({
      where: { article_id: req.article.id },
      transaction,
    });
    await req.article.destroy({ transaction });
  });

  return res.status(200).json({ message: 'Artículo eliminado correctamente' });
};

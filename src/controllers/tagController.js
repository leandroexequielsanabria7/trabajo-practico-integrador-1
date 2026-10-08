import { sequelize, Article, ArticleTag, Tag, User } from '../models/index.js';
import { controllerHandler } from '../helpers/controllerHandler.js';

const articleIncludes = [
  { model: User, as: 'author', attributes: ['id', 'username'] },
];

export const listTags = controllerHandler(async (req, res) => {
  const tags = await Tag.findAll({ order: [['name', 'ASC']] });
  return res.status(200).json({ tags });
});

export const getTag = controllerHandler(async (req, res) => {
  const tag = await Tag.findByPk(req.params.id, {
    include: [{
      model: Article,
      as: 'articles',
      through: { attributes: [] },
      include: articleIncludes,
    }],
  });

  if (!tag) {
    return res.status(404).json({ message: 'Etiqueta no encontrada' });
  }

  return res.status(200).json({ tag });
});

export const createTag = controllerHandler(async (req, res) => {
  const tag = await Tag.create({ name: req.body.name });
  return res.status(201).json({ message: 'Etiqueta creada correctamente', tag });
});

export const updateTag = controllerHandler(async (req, res) => {
  const tag = await Tag.findByPk(req.params.id);

  if (!tag) {
    return res.status(404).json({ message: 'Etiqueta no encontrada' });
  }

  await tag.update({ name: req.body.name });
  return res.status(200).json({ message: 'Etiqueta actualizada correctamente', tag });
});

export const deleteTag = controllerHandler(async (req, res) => {
  const tag = await Tag.findByPk(req.params.id);

  if (!tag) {
    return res.status(404).json({ message: 'Etiqueta no encontrada' });
  }

  await sequelize.transaction(async (transaction) => {
    await ArticleTag.destroy({
      where: { tag_id: tag.id },
      transaction,
    });
    await tag.destroy({ transaction });
  });

  return res.status(200).json({ message: 'Etiqueta eliminada correctamente' });
});

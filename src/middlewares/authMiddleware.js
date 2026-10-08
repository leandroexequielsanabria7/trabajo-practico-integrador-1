import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import { Article, User } from '../models/index.js';
import { verifyToken } from '../helpers/auth.js';

export const authenticate = async (req, res, next) => {
  const token = req.cookies?.access_token;

  if (!token) {
    return res.status(401).json({ message: 'Autenticación requerida' });
  }

  let payload;

  try {
    payload = verifyToken(token);
  } catch (error) {
    if (error instanceof JsonWebTokenError || error instanceof TokenExpiredError) {
      return res.status(401).json({ message: 'Token inválido o vencido' });
    }

    return next(error);
  }

  if (!payload || typeof payload !== 'object' || !Number.isInteger(payload.id)) {
    return res.status(401).json({ message: 'Token inválido' });
  }

  const user = await User.findByPk(payload.id);

  if (!user) {
    return res.status(401).json({ message: 'La sesión ya no es válida' });
  }

  req.user = user;
  return next();
};

export const requireAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Se requieren permisos de administrador' });
  }

  return next();
};

const loadArticle = async (req, res, next) => {
  const article = await Article.findByPk(req.params.id);

  if (!article) {
    return res.status(404).json({ message: 'Artículo no encontrado' });
  }

  req.article = article;
  return next();
};

export const requireArticleOwner = [loadArticle, (req, res, next) => {
  if (req.article.user_id !== req.user.id) {
    return res.status(403).json({ message: 'Solo el autor puede modificar este artículo' });
  }

  return next();
}];

export const requireArticleOwnerOrAdmin = [loadArticle, (req, res, next) => {
  if (req.user.role !== 'admin' && req.article.user_id !== req.user.id) {
    return res.status(403).json({ message: 'No tienes permiso para modificar este artículo' });
  }

  return next();
}];

export const requireArticleBodyOwner = async (req, res, next) => {
  const article = await Article.findByPk(req.body.article_id);

  if (!article) {
    return res.status(404).json({ message: 'Artículo no encontrado' });
  }

  if (article.user_id !== req.user.id) {
    return res.status(403).json({ message: 'Solo el autor puede modificar las etiquetas del artículo' });
  }

  req.article = article;
  return next();
};

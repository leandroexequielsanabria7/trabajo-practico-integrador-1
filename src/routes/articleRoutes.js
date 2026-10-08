import { Router } from 'express';
import {
  createArticle,
  deleteArticle,
  getArticle,
  getMyArticle,
  listMyPublishedArticles,
  listPublishedArticles,
  updateArticle,
} from '../controllers/articleController.js';
import {
  authenticate,
  requireArticleOwnerOrAdmin,
} from '../middlewares/authMiddleware.js';
import {
  validateArticle,
  validateArticleUpdate,
  validateId,
} from '../middlewares/validation.js';

const router = Router();

router.get('/', authenticate, listPublishedArticles);
router.get('/user', authenticate, listMyPublishedArticles);
router.get('/user/:id', authenticate, validateId('id'), getMyArticle);
router.get('/:id', authenticate, validateId('id'), getArticle);
router.post('/', authenticate, validateArticle, createArticle);
router.put(
  '/:id',
  authenticate,
  validateId('id'),
  requireArticleOwnerOrAdmin,
  validateArticleUpdate,
  updateArticle
);
router.delete('/:id', authenticate, validateId('id'), requireArticleOwnerOrAdmin, deleteArticle);

export default router;

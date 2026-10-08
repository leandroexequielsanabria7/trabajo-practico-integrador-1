import { Router } from 'express';
import {
  addTagToArticle,
  removeTagFromArticle,
} from '../controllers/articleTagController.js';
import {
  authenticate,
  requireArticleBodyOwner,
} from '../middlewares/authMiddleware.js';
import {
  validateArticleTag,
  validateArticleTagId,
} from '../middlewares/validation.js';

const router = Router();

router.post('/', authenticate, validateArticleTag, requireArticleBodyOwner, addTagToArticle);
router.delete('/:articleTagId', authenticate, validateArticleTagId, removeTagFromArticle);

export default router;

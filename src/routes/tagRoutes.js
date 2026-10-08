import { Router } from 'express';
import {
  createTag,
  deleteTag,
  getTag,
  listTags,
  updateTag,
} from '../controllers/tagController.js';
import { authenticate, requireAdmin } from '../middlewares/authMiddleware.js';
import {
  validateId,
  validateTag,
  validateTagUpdate,
} from '../middlewares/validation.js';

const router = Router();

router.get('/', authenticate, listTags);
router.get('/:id', authenticate, requireAdmin, validateId('id'), getTag);
router.post('/', authenticate, requireAdmin, validateTag, createTag);
router.put('/:id', authenticate, requireAdmin, validateId('id'), validateTagUpdate, updateTag);
router.delete('/:id', authenticate, requireAdmin, validateId('id'), deleteTag);

export default router;

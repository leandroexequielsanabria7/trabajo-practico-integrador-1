import { Router } from 'express';
import {
  createUser,
  deleteUser,
  getUser,
  listUsers,
  updateUser,
} from '../controllers/userController.js';
import { authenticate, requireAdmin } from '../middlewares/authMiddleware.js';
import {
  validateAdminUser,
  validateId,
  validateUserUpdate,
} from '../middlewares/validation.js';

const router = Router();
const adminOnly = [authenticate, requireAdmin];

router.get('/', ...adminOnly, listUsers);
router.get('/:id', ...adminOnly, validateId('id'), getUser);
router.post('/', ...adminOnly, validateAdminUser, createUser);
router.put('/:id', ...adminOnly, validateId('id'), validateUserUpdate, updateUser);
router.delete('/:id', ...adminOnly, validateId('id'), deleteUser);

export default router;

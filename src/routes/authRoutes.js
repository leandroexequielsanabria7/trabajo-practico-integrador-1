import { Router } from 'express';
import {
  getProfile,
  login,
  logout,
  register,
  updateProfile,
} from '../controllers/authController.js';
import { authenticate } from '../middlewares/authMiddleware.js';
import {
  validateLogin,
  validateProfile,
  validateRegistration,
} from '../middlewares/validation.js';

const router = Router();

router.post('/register', validateRegistration, register);
router.post('/login', validateLogin, login);
router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, validateProfile, updateProfile);
router.post('/logout', authenticate, logout);

export default router;

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const TOKEN_EXPIRATION = '7d';
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000;

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error('La variable JWT_SECRET no está configurada');
  }

  return secret;
};

export const hashPassword = (password) => bcrypt.hash(password, 12);

export const comparePassword = (password, hash) =>
  bcrypt.compare(password, hash);

export const createToken = (user) =>
  jwt.sign(
    { id: user.id, role: user.role },
    getJwtSecret(),
    { expiresIn: TOKEN_EXPIRATION }
  );

export const verifyToken = (token) => jwt.verify(token, getJwtSecret());

export const setAuthCookie = (res, token) => {
  res.cookie('access_token', token, {
    httpOnly: true,
    secure: process.env.COOKIE_SECURE === 'true',
    sameSite: 'lax',
    maxAge: COOKIE_MAX_AGE,
    path: '/',
  });
};

export const clearAuthCookie = (res) => {
  res.clearCookie('access_token', {
    httpOnly: true,
    secure: process.env.COOKIE_SECURE === 'true',
    sameSite: 'lax',
    path: '/',
  });
};

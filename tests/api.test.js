import assert from 'node:assert/strict';
import { once } from 'node:events';
import express from 'express';
import test from 'node:test';
import {
  comparePassword,
  createToken,
  hashPassword,
  setAuthCookie,
  verifyToken,
} from '../src/helpers/auth.js';
import { controllerHandler } from '../src/helpers/controllerHandler.js';
import { serializeUser } from '../src/helpers/serializers.js';
import {
  validateArticleUpdate,
  validateLogin,
  validateProfile,
} from '../src/middlewares/validation.js';

const requestThrough = async (path, method, body, ...middleware) => {
  const app = express();
  app.use(express.json());
  app[method](path, ...middleware, (req, res) => res.status(204).end());

  const server = app.listen(0, '127.0.0.1');
  await once(server, 'listening');

  try {
    const { port } = server.address();
    const response = await fetch(`http://127.0.0.1:${port}${path.replace(':id', '1')}`, {
      method: method.toUpperCase(),
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    });
    return response;
  } finally {
    server.close();
    await once(server, 'close');
  }
};

test('passwords are hashed and compared without exposing their plain value', async () => {
  const password = 'StrongPass123';
  const hash = await hashPassword(password);

  assert.notEqual(hash, password);
  assert.equal(await comparePassword(password, hash), true);
  assert.equal(await comparePassword('WrongPass123', hash), false);
});

test('JWT cookies are HTTP-only and tokens can be verified', () => {
  process.env.JWT_SECRET = 'test-secret-long-enough-for-signing';
  process.env.COOKIE_SECURE = 'false';

  const user = { id: 42, role: 'user' };
  const token = createToken(user);
  assert.equal(verifyToken(token).id, user.id);

  let cookie;
  const response = {
    cookie(name, value, options) {
      cookie = { name, value, options };
    },
  };

  setAuthCookie(response, token);
  assert.equal(cookie.name, 'access_token');
  assert.equal(cookie.options.httpOnly, true);
  assert.equal(cookie.options.secure, false);
  assert.equal(cookie.options.sameSite, 'lax');
});

test('user serialization omits password hashes', () => {
  const user = { get: () => ({ id: 7, username: 'reader', password: 'hash' }) };
  assert.deepEqual(serializeUser(user), { id: 7, username: 'reader' });
});

test('controller errors are forwarded to Express error handling', async () => {
  const failure = new Error('database unavailable');
  let forwarded;
  await controllerHandler(async () => {
    throw failure;
  })({}, {}, (error) => {
    forwarded = error;
  });

  assert.equal(forwarded, failure);
});

test('invalid login input returns 400 without calling a controller', async () => {
  const response = await requestThrough('/login', 'post', {
    email: 'not-an-email',
    password: '',
  }, ...validateLogin);

  assert.equal(response.status, 400);
  assert.equal((await response.json()).message, 'Error de validación');
});

test('missing JSON bodies are rejected as validation errors', async () => {
  const response = await requestThrough('/login', 'post', undefined, ...validateLogin);
  assert.equal(response.status, 400);
});

test('profile input accepts accented names and rejects unknown fields', async () => {
  const valid = await requestThrough('/profile', 'put', { first_name: 'María' }, ...validateProfile);
  const invalid = await requestThrough(
    '/profile',
    'put',
    { first_name: 'María', role: 'admin' },
    ...validateProfile
  );

  assert.equal(valid.status, 204);
  assert.equal(invalid.status, 400);
});

test('article updates reject attempts to change the author', async () => {
  const response = await requestThrough(
    '/articles/:id',
    'put',
    { user_id: 99 },
    ...validateArticleUpdate
  );

  assert.equal(response.status, 400);
});

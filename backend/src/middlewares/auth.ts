import Elysia from 'elysia';
import { verifyToken } from '../utils/jwt';

export const authMiddleware = new Elysia({ name: 'authMiddleware' })
  .derive({ as: 'scoped' }, ({ headers }) => {
    const payload = verifyToken(String(headers.authorization));

    if (!payload) {
      throw new Error('Unauthorized');
    }

    return { user: payload };
  });
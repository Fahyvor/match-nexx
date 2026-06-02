import Elysia from 'elysia';
import { verifyBearerToken } from '../utils/auth';

export const authMiddleware = new Elysia({ name: 'authMiddleware' })
  .derive({ as: 'scoped' }, ({ headers }) => {
    const payload = verifyBearerToken(headers.authorization);

    if (!payload) {
      throw new Error('Unauthorized');
    }

    return { user: payload };
  });
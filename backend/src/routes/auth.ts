import { Elysia, t } from 'elysia';
import { authMiddleware } from '../middlewares/auth';
import { authController } from '../controllers/authController';

const app = new Elysia({ prefix: '/auth' })

  // =========================
  // PUBLIC ROUTES
  // =========================
  // .use(authMiddleware)
  .get('/all-users', async () => authController.allUsers())
  .post(
    '/register',
    (ctx) => authController.register(ctx),
    {
      body: t.Object({
        firstName: t.String(),
        lastName: t.String(),
        phone: t.String(),
        address: t.String(),
        state: t.String(),
        country: t.String(),
        years_of_experience: t.Number(),
        email: t.String({ format: 'email' }),
        password: t.String({ minLength: 8 }),
        userType: t.Union([
          t.Literal('applicant'),
          t.Literal('recruiter'),
        ]),
      }),
    },
  )

  .post(
    '/login',
    (ctx) => authController.login(ctx.body.email, ctx.body.password),
    {
      body: t.Object({
        email: t.String({ format: 'email' }),
        password: t.String(),
      }),
    },
  )

  .post(
    '/forgot-password',
    async () => ({ success: true, message: 'Password reset link sent to email' }),
    {
      body: t.Object({
        email: t.String({ format: 'email' }),
      }),
    },
  )

  .post(
    '/reset-password',
    async () => ({ success: true, message: 'Password reset successful' }),
    {
      body: t.Object({
        token: t.String(),
        newPassword: t.String({ minLength: 8 }),
      }),
    },
  )

  // =========================
  // PROTECTED ROUTES
  // =========================
  .group('/user', (group) =>
    group
      .use(authMiddleware)

      .put('/profile', async ({ user, body }) => ({
        success: true,
        message: 'Profile updated successfully',
        data: { user, updates: body },
      }))

      .post('/logout', async () => authController.logout()),
  )

  // =========================
  // REFRESH TOKEN
  // =========================
  .post(
    '/refresh-token',
    async ({ headers }) => authController.refreshToken(headers.authorization),
  )


export default app;
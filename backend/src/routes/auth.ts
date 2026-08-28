import { Elysia, t } from "elysia";
import { authMiddleware } from "../middlewares/auth";
import { requireActiveSubscription } from "../middlewares/requireActiveSubscription";
import { authController } from "../controllers/authController";

const app = new Elysia({ prefix: "/auth" })

  .get("/all-users", async () => authController.allUsers())
  .get("/single-user/:id", async ({ params }) => authController.getSingleUser(params))

  .post(
    "/register",
    ({ body }) => authController.register(body),
    {
      body: t.Object({
        firstName: t.String(),
        lastName: t.String(),
        phone: t.String(),
        address: t.String(),
        state: t.String(),
        country: t.String(),
        years_of_experience: t.Number(),
        email: t.String({ format: "email" }),
        password: t.String({ minLength: 8 }),
        userType: t.Union([
          t.Literal("applicant"),
          t.Literal("recruiter"),
          t.Literal("admin"),
        ]),
      }),
    }
  )

  .post(
    "/login",
    ({ body }) => authController.login(body.email, body.password),
    {
      body: t.Object({
        email: t.String({ format: "email" }),
        password: t.String(),
      }),
    }
  )

  .post(
    "/contact",
    ({ body }) =>
      authController.contact({
        body,
      } as any),
    {
      body: t.Object({
        name: t.String({
          minLength: 2,
        }),

        email: t.String({
          format: "email",
        }),

        subject: t.String({
          minLength: 2,
        }),

        message: t.String({
          minLength: 5,
        }),
      }),
    }
  )

  .post(
    "/forgot-password",
    ({ body }) =>
      authController.forgotPassword({
        body,
      } as any),
    {
      body: t.Object({
        email: t.String({
          format: "email",
        }),
      }),
    }
  )

  .post(
    "/reset-password",
    ({ body }) =>
      authController.resetPassword({
        body,
      } as any),
    {
      body: t.Object({
        token: t.String({
          minLength: 1,
        }),

        password: t.String({
          minLength: 8,
        }),
      }),
    }
  )
  .group("/user", (group) =>
    group
      .use(authMiddleware(["applicant", "recruiter", "admin"]))

      .put("/profile", async ({ user, body }) => ({
        success: true,
        message: "Profile updated successfully",
        data: { user, updates: body },
      }))

      .post("/logout", async () => authController.logout())
  )

  // Scoped so this doesn't leak into routes below it
  .use(
    new Elysia()
      .use(authMiddleware(["recruiter", "admin"]))
      .use(requireActiveSubscription)
      .get("/all-applicants", authController.getAllApplicants)
  )


  .use(authMiddleware(["applicant", "recruiter", "admin"]))
  .delete("/delete-account", async ({ user }) => ({
    success: true,
    message: "Account deleted successfully",
    data: { user },
  }))
  .post("/refresh-token", async ({ headers }) =>
    authController.refreshToken(headers.authorization ?? "")
  )

  .get(
    "/get-single-user",
    async ({ user }) => authController.getUserProfile(user)
  )

  

export default app;
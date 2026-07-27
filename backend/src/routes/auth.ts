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
    "/forgot-password",
    async () => ({
      success: true,
      message: "Password reset link sent to email",
    }),
    {
      body: t.Object({ email: t.String({ format: "email" }) }),
    }
  )

  .post(
    "/reset-password",
    async () => ({
      success: true,
      message: "Password reset successful",
    }),
    {
      body: t.Object({
        token: t.String(),
        newPassword: t.String({ minLength: 8 }),
      }),
    }
  )

  // =========================
  // PROTECTED ROUTES
  // =========================

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

  // =========================
  // REFRESH TOKEN
  // =========================

  .post("/refresh-token", async ({ headers }) =>
    authController.refreshToken(headers.authorization ?? "")
  );

export default app;
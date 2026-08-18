import { Elysia, t } from "elysia";
import { authMiddleware } from "../middlewares/auth";
import { paymentController } from "../controllers/paymentController";

const app = new Elysia({ prefix: "/payments" })

  // Recruiter Subscription Endpoints
  .group("/recruiter", (group) =>
    group
      .use(authMiddleware(["recruiter", "admin"]))

      .post(
        "/initialize",
        async ({ user, body }) =>
          paymentController.initializeSubscription(user, body.plan),
        {
          body: t.Object({
            plan: t.Union([t.Literal("monthly"), t.Literal("yearly")]),
          }),
        }
      )

      .post(
        "/activate",
        async ({ user, body }) =>
          paymentController.activateSubscriptionDirect(user?.sub, body?.plan || "monthly"),
        {
          body: t.Optional(
            t.Object({
              plan: t.Optional(t.Union([t.Literal("monthly"), t.Literal("yearly")])),
            })
          ),
        }
      )

      .get("/status", async ({ user }) => paymentController.getStatus(user?.sub))
  )

  // Legacy recruiter initialize endpoint alias
  .use(authMiddleware(["recruiter", "admin"]))
  .post(
    "/initialize",
    async ({ user, body }) =>
      paymentController.initializeSubscription(user, body.plan),
    {
      body: t.Object({
        plan: t.Union([t.Literal("monthly"), t.Literal("yearly")]),
      }),
    }
  )
  .get("/status", async ({ user }) => paymentController.getStatus(user?.sub))

  // Applicant CV Payment Endpoints
  .group("/cv", (group) =>
    group
      .use(authMiddleware(["applicant", "admin", "recruiter"]))

      .post("/initialize", async ({ user }) =>
        paymentController.initializeCvPayment(user?.sub)
      )

      .post("/verify", async ({ user }) =>
        paymentController.verifyCvPayment(user?.sub)
      )

      .get("/status", async ({ user }) =>
        paymentController.getCvStatus(user?.sub)
      )
  )

  .post("/webhook", async ({ request, headers, set }) => {
    const rawBody = await request.text();
    const event = JSON.parse(rawBody);
    await paymentController.handleWebhookEvent(event);
    return "OK";
  });

export default app;
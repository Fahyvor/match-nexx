import { Elysia, t } from "elysia";
import { authMiddleware } from "../middlewares/auth";
import { paymentController } from "../controllers/paymentController";

const app = new Elysia({ prefix: "/payments" })

  // =========================================================
  // RECRUITER PAYMENTS
  // =========================================================
  .group("/recruiter", (group) =>
    group
      .use(authMiddleware(["recruiter", "admin"]))

      // POST /payments/recruiter/initialize
      .post(
        "/initialize",
        async ({ user, body }) => {
          return paymentController.initializeSubscription(
            user,
            body.plan
          );
        },
        {
          body: t.Object({
            plan: t.Union([
              t.Literal("monthly"),
              t.Literal("yearly"),
            ]),
          }),
        }
      )

      // POST /payments/recruiter/activate
      .post(
        "/activate",
        async ({ user, body }) => {
          return paymentController.activateSubscriptionDirect(
            user.sub,
            body?.plan || "monthly"
          );
        },
        {
          body: t.Optional(
            t.Object({
              plan: t.Optional(
                t.Union([
                  t.Literal("monthly"),
                  t.Literal("yearly"),
                ])
              ),
            })
          ),
        }
      )

      // GET /payments/recruiter/status
      .get("/status", async ({ user }) => {
        return paymentController.getStatus(user.sub);
      })
  )

  // =========================================================
  // LEGACY RECRUITER ENDPOINTS
  // =========================================================
  .group("", (group) =>
    group
      .use(authMiddleware(["recruiter", "admin"]))

      // POST /payments/initialize
      .post(
        "/initialize",
        async ({ user, body }) => {
          return paymentController.initializeSubscription(
            user,
            body.plan
          );
        },
        {
          body: t.Object({
            plan: t.Union([
              t.Literal("monthly"),
              t.Literal("yearly"),
            ]),
          }),
        }
      )

      // GET /payments/status
      .get("/status", async ({ user }) => {
        return paymentController.getStatus(user.sub);
      })
  )

  // =========================================================
  // CV PAYMENTS
  // =========================================================
  .group("/cv", (group) =>
    group
      .use(authMiddleware(["applicant", "admin", "recruiter"]))

      // POST /payments/cv/initialize
      .post(
        "/initialize",
        async ({ user }) => {
          console.log("========== CV PAYMENT INITIALIZE ==========");
          console.log("USER ID:", user.sub);
          console.log("EMAIL:", user.email);
          console.log("ROLE:", user.role);
          console.log("===========================================");

          return paymentController.initializeCvPayment(
            user.sub,
            user.email
          );
        }
      )

      // POST /payments/cv/verify
      .post(
        "/verify",
        async ({ user }) => {
          return paymentController.verifyCvPayment(
            user.sub
          );
        }
      )

      // GET /payments/cv/status
      .get(
        "/status",
        async ({ user }) => {
          return paymentController.getCvStatus(
            user.sub
          );
        }
      )
  )

  // =========================================================
  // PAYMENT WEBHOOK
  // =========================================================
  .post(
    "/webhook",
    async ({ request }) => {
      const rawBody = await request.text();

      const event = JSON.parse(rawBody);

      await paymentController.handleWebhookEvent(event);

      return "OK";
    }
  );

export default app;
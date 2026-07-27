import { Elysia, t } from "elysia";
import { authMiddleware } from "../middlewares/auth";
import { paymentController } from "../controllers/paymentController";

const app = new Elysia({ prefix: "/payments" })

  .group("/", (group) =>
    group
      .use(authMiddleware(["recruiter"]))

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

      .get("/verify/:reference", async ({ params }) =>
        paymentController.verifyTransaction(params.reference)
      )

      .get("/status", async ({ user }) => paymentController.getStatus(user.id))
  )
  
  .post("/webhook", async ({ request, headers, set }) => {
    const signature = headers["x-paystack-signature"];
    const rawBody = await request.text();

    if (!signature || !paymentController.verifyWebhookSignature(rawBody, signature)) {
      set.status = 401;
      return "Invalid signature";
    }

    const event = JSON.parse(rawBody);
    await paymentController.handleWebhookEvent(event);

    return "OK";
  });

export default app;
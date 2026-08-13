import { db } from "../db/db";
import { recruiters, subscriptions } from "../db/schema";
import { eq, and, desc } from "drizzle-orm";
import axios from "axios";

const BACHS_API_KEY = process.env.BACHS_API_KEY!;
const BACHS_API_URL =
  process.env.BACHS_API_URL || "https://sandbox-api.bachs.io";

const PLAN_CODES: Record<"monthly" | "yearly", string> = {
  monthly: process.env.BACHS_MONTHLY_PRODUCT_ID!,
  yearly: process.env.BACHS_YEARLY_PRODUCT_ID!,
};

export const paymentController = {
  /**
   * Initialize a subscription using a Bachs product
   */
  initializeSubscription: async (
    user: { sub: string; email: string },
    plan: "monthly" | "yearly"
  ) => {
    try {
      const recruiter = await db.query.recruiters.findFirst({
        where: eq(recruiters.userId, user.sub),
      });

      if (!recruiter) {
        return {
          success: false,
          message: "Recruiter profile not found",
        };
      }

      const productId = PLAN_CODES[plan];

      if (!productId) {
        return {
          success: false,
          message: "Invalid plan selected",
        };
      }

      /**
       * Create Bachs checkout session
       */
      const response = await axios.post(
        `${BACHS_API_URL}/v1/checkout-sessions`,
        {
          product_cart: [
            {
              product_id: productId,
              quantity: 1,
            },
          ],

          customer: {
            email: user.email,
            name: recruiter.companyName,
          },

          success_url: `${process.env.FRONTEND_URL}/recruiter/payment/callback`,
          cancel_url: `${process.env.FRONTEND_URL}/recruiter/payment/callback`,
        },
        {
          headers: {
            Authorization: `Bearer ${BACHS_API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = response.data;

      console.log("Bachs checkout response:", data);

      /**
       * We need the checkout ID from Bachs.
       *
       * Adjust this if the actual Bachs response
       * uses a different property name.
       */
      const checkoutId =
        data?.data?.id ||
        data?.data?.checkout_id ||
        data?.checkout_id;

      const checkoutUrl =
        data?.data?.checkout_url ||
        data?.data?.url ||
        data?.checkout_url;

      if (!checkoutId || !checkoutUrl) {
        console.error("Unexpected Bachs response:", data);

        return {
          success: false,
          message: "Failed to create Bachs checkout session",
        };
      }

      /**
       * Save the pending subscription BEFORE
       * sending the user to Bachs.
       */
      await db.insert(subscriptions).values({
        recruiterId: recruiter.id,
        plan,
        status: "pending",

        // Add this field to your schema
        bachsCheckoutId: checkoutId,
      });

      return {
        success: true,
        data: {
          authorizationUrl: checkoutUrl,
          checkoutId,
          plan,
        },
      };
    } catch (e) {
      console.error("initializeSubscription error:", e);

      if (axios.isAxiosError(e)) {
        console.error(
          "Bachs error response:",
          e.response?.data
        );

        return {
          success: false,
          message:
            e.response?.data?.message ||
            "Failed to initialize Bachs payment",
        };
      }

      return {
        success: false,
        message:
          e instanceof Error
            ? e.message
            : "Internal server error",
      };
    }
  },

  /**
   * Handle Bachs webhook events
   */
  handleWebhookEvent: async (event: any) => {
    try {
      console.log(
        "Bachs webhook received:",
        JSON.stringify(event, null, 2)
      );

      const eventType = event?.type;
      const data = event?.data;

      switch (eventType) {
        /**
         * PAYMENT SUCCESS
         */
        case "collection.succeeded": {
          const checkoutId = data?.checkout_id;
          const chargeId = data?.charge_id;

          if (!checkoutId) {
            console.error(
              "Bachs webhook missing checkout_id"
            );

            return {
              success: false,
              message: "Missing checkout ID",
            };
          }

          /**
           * Find the subscription we created
           * when initializing checkout.
           */
          const pendingSub =
            await db.query.subscriptions.findFirst({
              where: and(
                eq(
                  subscriptions.bachsCheckoutId,
                  checkoutId
                ),
                eq(subscriptions.status, "pending")
              ),
              orderBy: desc(subscriptions.createdAt),
            });

          if (!pendingSub) {
            console.error(
              `No pending subscription found for checkout ${checkoutId}`
            );

            return {
              success: false,
              message: "Subscription not found",
            };
          }

          /**
           * Calculate subscription period
           */
          const currentPeriodEnd = new Date();

          if (pendingSub.plan === "yearly") {
            currentPeriodEnd.setFullYear(
              currentPeriodEnd.getFullYear() + 1
            );
          } else {
            currentPeriodEnd.setMonth(
              currentPeriodEnd.getMonth() + 1
            );
          }

          /**
           * Activate subscription
           */
          await db
            .update(subscriptions)
            .set({
              status: "active",
              currentPeriodEnd,
              bachsChargeId: chargeId,
              updatedAt: new Date(),
            })
            .where(eq(subscriptions.id, pendingSub.id));

          console.log(
            `Subscription ${pendingSub.id} activated successfully`
          );

          break;
        }

        default:
          console.log(
            `Unhandled Bachs event: ${eventType}`
          );
      }

      return {
        success: true,
      };
    } catch (e) {
      console.error(
        "handleWebhookEvent error:",
        e
      );

      return {
        success: false,
      };
    }
  },

  /**
   * Get recruiter subscription status
   */
  getStatus: async (userId: string) => {
    try {
      const recruiter =
        await db.query.recruiters.findFirst({
          where: eq(recruiters.userId, userId),
        });

      if (!recruiter) {
        return {
          success: false,
          message: "Recruiter profile not found",
        };
      }

      const latestSub =
        await db.query.subscriptions.findFirst({
          where: eq(
            subscriptions.recruiterId,
            recruiter.id
          ),
          orderBy: desc(subscriptions.createdAt),
        });

      const isActive = Boolean(
        latestSub &&
          latestSub.status === "active" &&
          latestSub.currentPeriodEnd &&
          new Date(latestSub.currentPeriodEnd) > new Date()
      );

      return {
        success: true,
        data: {
          isActive,
          plan: latestSub?.plan ?? null,
          status:
            latestSub?.status ?? "inactive",
          currentPeriodEnd:
            latestSub?.currentPeriodEnd ?? null,
        },
      };
    } catch (e) {
      console.error("getStatus error:", e);

      return {
        success: false,
        message:
          e instanceof Error
            ? e.message
            : "Internal server error",
      };
    }
  },
};
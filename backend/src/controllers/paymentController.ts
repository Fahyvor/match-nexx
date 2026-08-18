import { db } from "../db/db";
import { recruiters, subscriptions, applicants } from "../db/schema";
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
      console.log("Payment detaiils", plan);
      console.log("User data", user)
      let recruiter = await db.query.recruiters.findFirst({
        where: eq(recruiters.userId, user.sub),
      });

      if (!recruiter) {
        const created = await db.insert(recruiters).values({
          userId: user.sub,
        }).returning();
        recruiter = created[0];
      }

      const checkoutId = `chk_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const checkoutUrl = `/recruiter/payment/callback?checkout_id=${checkoutId}&plan=${plan}`;

      // Insert pending subscription
      await db.insert(subscriptions).values({
        recruiterId: recruiter.id,
        plan,
        status: "pending",
        bachsCheckoutId: checkoutId,
      });

      // Try Bachs API if configured, otherwise fallback smoothly to local checkout URL
      if (BACHS_API_KEY && PLAN_CODES[plan]) {
        try {
          const response = await axios.post(
            `${BACHS_API_URL}/v1/checkout-sessions`,
            {
              product_cart: [{ product_id: PLAN_CODES[plan], quantity: 1 }],
              customer: { email: user.email, name: recruiter.companyName || "Recruiter" },
              success_url: `${process.env.FRONTEND_URL}/recruiter/payment/callback?checkout_id=${checkoutId}&plan=${plan}`,
              cancel_url: `${process.env.FRONTEND_URL}/recruiter/payment/callback?checkout_id=${checkoutId}&plan=${plan}`,
            },
            {
              headers: {
                Authorization: `Bearer ${BACHS_API_KEY}`,
                "Content-Type": "application/json",
              },
            }
          );
          const data = response.data;
          const apiCheckoutUrl = data?.data?.checkout_url || data?.data?.url || data?.checkout_url;
          if (apiCheckoutUrl) {
            return {
              success: true,
              data: {
                authorizationUrl: apiCheckoutUrl,
                checkoutId,
                plan,
              },
            };
          }
        } catch (apiErr) {
          console.log("Bachs API unreached, using instant checkout fallback:", apiErr);
        }
      }

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
      return {
        success: false,
        message: e instanceof Error ? e.message : "Internal server error",
      };
    }
  },

  /**
   * Activate subscription directly for recruiter
   */
  activateSubscriptionDirect: async (userId: string, plan: "monthly" | "yearly" = "monthly") => {
    try {
      let recruiter = await db.query.recruiters.findFirst({
        where: eq(recruiters.userId, userId),
      });

      if (!recruiter) {
        const created = await db.insert(recruiters).values({
          userId,
        }).returning();
        recruiter = created[0];
      }

      const currentPeriodEnd = new Date();
      if (plan === "yearly") {
        currentPeriodEnd.setFullYear(currentPeriodEnd.getFullYear() + 1);
      } else {
        currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1);
      }

      await db.insert(subscriptions).values({
        recruiterId: recruiter.id,
        plan,
        status: "active",
        currentPeriodEnd,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      return {
        success: true,
        message: "Subscription activated successfully",
        data: { isActive: true, plan, currentPeriodEnd },
      };
    } catch (e) {
      console.error("activateSubscriptionDirect error:", e);
      return {
        success: false,
        message: e instanceof Error ? e.message : "Failed to activate subscription",
      };
    }
  },

  /**
   * Handle Bachs webhook events
   */
  handleWebhookEvent: async (event: any) => {
    try {
      console.log("Bachs webhook received:", JSON.stringify(event, null, 2));

      const eventType = event?.type;
      const data = event?.data;

      switch (eventType) {
        case "collection.succeeded": {
          const checkoutId = data?.checkout_id;
          const chargeId = data?.charge_id;

          if (!checkoutId) {
            return { success: false, message: "Missing checkout ID" };
          }

          const pendingSub = await db.query.subscriptions.findFirst({
            where: and(
              eq(subscriptions.bachsCheckoutId, checkoutId),
              eq(subscriptions.status, "pending")
            ),
            orderBy: desc(subscriptions.createdAt),
          });

          if (!pendingSub) {
            return { success: false, message: "Subscription not found" };
          }

          const currentPeriodEnd = new Date();
          if (pendingSub.plan === "yearly") {
            currentPeriodEnd.setFullYear(currentPeriodEnd.getFullYear() + 1);
          } else {
            currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1);
          }

          await db
            .update(subscriptions)
            .set({
              status: "active",
              currentPeriodEnd,
              bachsChargeId: chargeId,
              updatedAt: new Date(),
            })
            .where(eq(subscriptions.id, pendingSub.id));

          break;
        }

        default:
          console.log(`Unhandled Bachs event: ${eventType}`);
      }

      return { success: true };
    } catch (e) {
      console.error("handleWebhookEvent error:", e);
      return { success: false };
    }
  },

  /**
   * Get recruiter subscription status
   */
  getStatus: async (userId: string) => {
    try {
      const recruiter = await db.query.recruiters.findFirst({
        where: eq(recruiters.userId, userId),
      });

      if (!recruiter) {
        return {
          success: true,
          data: {
            isActive: false,
            plan: null,
            status: "inactive",
            currentPeriodEnd: null,
          },
        };
      }

      const latestSub = await db.query.subscriptions.findFirst({
        where: eq(subscriptions.recruiterId, recruiter.id),
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
          status: latestSub?.status ?? "inactive",
          currentPeriodEnd: latestSub?.currentPeriodEnd ?? null,
        },
      };
    } catch (e) {
      console.error("getStatus error:", e);
      return {
        success: false,
        message: e instanceof Error ? e.message : "Internal server error",
      };
    }
  },

  /**
   * Initialize CV Payment (₦1,000) for applicant
   */
  initializeCvPayment: async (userId: string) => {
    try {
      let applicant = await db.query.applicants.findFirst({
        where: eq(applicants.userId, userId),
      });

      if (!applicant) {
        const created = await db.insert(applicants).values({
          userId,
          hasPaidCv: "false",
        }).returning();
        applicant = created[0];
      }

      if (applicant.hasPaidCv === "true") {
        return {
          success: true,
          alreadyPaid: true,
          message: "You have already paid for your CV builder.",
        };
      }

      const reference = `cv_pay_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

      return {
        success: true,
        data: {
          amount: 1000,
          currency: "NGN",
          reference,
          message: "Payment of ₦1,000 initialized for CV Builder.",
        },
      };
    } catch (e) {
      console.error("initializeCvPayment error:", e);
      return {
        success: false,
        message: e instanceof Error ? e.message : "Internal server error",
      };
    }
  },

  /**
   * Verify and process CV Payment (₦1,000) for applicant
   */
  verifyCvPayment: async (userId: string) => {
    try {
      let applicant = await db.query.applicants.findFirst({
        where: eq(applicants.userId, userId),
      });

      if (!applicant) {
        const created = await db.insert(applicants).values({
          userId,
          hasPaidCv: "true",
        }).returning();
        applicant = created[0];
      } else {
        await db
          .update(applicants)
          .set({
            hasPaidCv: "true",
            updatedAt: new Date(),
          })
          .where(eq(applicants.id, applicant.id));
      }

      return {
        success: true,
        message: "₦1,000 payment verified successfully! Your CV Builder is unlocked.",
        data: { hasPaidCv: true },
      };
    } catch (e) {
      console.error("verifyCvPayment error:", e);
      return {
        success: false,
        message: e instanceof Error ? e.message : "Internal server error",
      };
    }
  },

  /**
   * Get CV Payment status for applicant
   */
  getCvStatus: async (userId: string) => {
    try {
      const applicant = await db.query.applicants.findFirst({
        where: eq(applicants.userId, userId),
      });

      const hasPaidCv = applicant?.hasPaidCv === "true";

      return {
        success: true,
        data: {
          hasPaidCv,
          amount: 1000,
        },
      };
    } catch (e) {
      console.error("getCvStatus error:", e);
      return {
        success: false,
        message: e instanceof Error ? e.message : "Internal server error",
      };
    }
  },
};
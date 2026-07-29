import { db } from "../db/db";
import { recruiters, subscriptions } from "../db/schema";
import { eq, and, desc } from "drizzle-orm";
import crypto from "crypto";

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY!;
const PAYSTACK_BASE_URL = "https://api.paystack.co";

const PLAN_CODES: Record<"monthly" | "yearly", string> = {
  monthly: process.env.PAYSTACK_MONTHLY_PLAN_CODE!,
  yearly: process.env.PAYSTACK_YEARLY_PLAN_CODE!,
};

export const paymentController = {
  initializeSubscription: async (
    user: { sub: string; email: string },
    plan: "monthly" | "yearly"
  ) => {
    try {
      const recruiter = await db.query.recruiters.findFirst({
        where: eq(recruiters.userId, user?.sub),
      });

      if (!recruiter) {
        return { success: false, message: "Recruiter profile not found" };
      }

      const planCode = PLAN_CODES[plan];
      if (!planCode) {
        return { success: false, message: "Invalid plan selected" };
      }

      const response = await fetch(`${PAYSTACK_BASE_URL}/transaction/initialize`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: user.email,
          plan: planCode,
          callback_url: `${process.env.FRONTEND_URL}/recruiter/payment/callback`,
          metadata: { recruiterId: recruiter.id, plan },
        }),
      });

      const data = await response.json();

      if (!data.status) {
        return { success: false, message: data.message || "Failed to initialize payment" };
      }

      await db.insert(subscriptions).values({
        recruiterId: recruiter.id,
        plan,
        status: "pending",
      });

      return {
        success: true,
        data: {
          authorizationUrl: data.data.authorization_url,
          reference: data.data.reference,
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

  verifyTransaction: async (reference: string) => {
    try {
      const response = await fetch(`${PAYSTACK_BASE_URL}/transaction/verify/${reference}`, {
        headers: { Authorization: `Bearer ${PAYSTACK_SECRET_KEY}` },
      });
      const data = await response.json();

      if (!data.status || data.data.status !== "success") {
        return { success: false, message: "Payment not successful" };
      }

      const { metadata, customer, subscription_code } = data.data;
      const recruiterId = metadata?.recruiterId;
      const plan = metadata?.plan as "monthly" | "yearly" | undefined;

      if (!recruiterId) {
        return { success: false, message: "Missing recruiter reference in transaction" };
      }

      const currentPeriodEnd = new Date();
      if (plan === "yearly") {
        currentPeriodEnd.setFullYear(currentPeriodEnd.getFullYear() + 1);
      } else {
        currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1);
      }

      const pendingSub = await db.query.subscriptions.findFirst({
        where: and(eq(subscriptions.recruiterId, recruiterId), eq(subscriptions.status, "pending")),
        orderBy: desc(subscriptions.createdAt),
      });

      if (pendingSub) {
        await db
          .update(subscriptions)
          .set({
            status: "active",
            paystackCustomerCode: customer?.customer_code,
            paystackSubscriptionCode: subscription_code,
            currentPeriodEnd,
            updatedAt: new Date(),
          })
          .where(eq(subscriptions.id, pendingSub.id));
      } else {
        await db.insert(subscriptions).values({
          recruiterId,
          plan: plan || "monthly",
          status: "active",
          paystackCustomerCode: customer?.customer_code,
          paystackSubscriptionCode: subscription_code,
          currentPeriodEnd,
        });
      }

      return { success: true, data: { plan, currentPeriodEnd } };
    } catch (e) {
      console.error("verifyTransaction error:", e);
      return {
        success: false,
        message: e instanceof Error ? e.message : "Internal server error",
      };
    }
  },

  handleWebhookEvent: async (event: any) => {
    try {
      const { event: eventType, data } = event;

      switch (eventType) {
        case "charge.success":
          await paymentController.verifyTransaction(data.reference);
          break;

        case "subscription.disable":
        case "subscription.not_renew":
          await db
            .update(subscriptions)
            .set({ status: "cancelled", updatedAt: new Date() })
            .where(eq(subscriptions.paystackSubscriptionCode, data.subscription_code));
          break;

        case "invoice.payment_failed":
          if (data.subscription?.subscription_code) {
            await db
              .update(subscriptions)
              .set({ status: "past_due", updatedAt: new Date() })
              .where(eq(subscriptions.paystackSubscriptionCode, data.subscription.subscription_code));
          }
          break;
      }

      return { success: true };
    } catch (e) {
      console.error("handleWebhookEvent error:", e);
      return { success: false };
    }
  },

  getStatus: async (userId: string) => {
    try {
      const recruiter = await db.query.recruiters.findFirst({
        where: eq(recruiters.userId, userId),
      });

      if (!recruiter) {
        return { success: false, message: "Recruiter profile not found" };
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

  verifyWebhookSignature: (rawBody: string, signature: string) => {
    const hash = crypto.createHmac("sha512", PAYSTACK_SECRET_KEY).update(rawBody).digest("hex");
    return hash === signature;
  },
};
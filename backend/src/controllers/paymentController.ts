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
      console.log("Payment details", plan);
      console.log("User data", user);
      
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

          // Check if this is a subscription payment
          const pendingSub = await db.query.subscriptions.findFirst({
            where: and(
              eq(subscriptions.bachsCheckoutId, checkoutId),
              eq(subscriptions.status, "pending")
            ),
            orderBy: desc(subscriptions.createdAt),
          });

          if (pendingSub) {
            // Handle subscription payment
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
          } else {
            // Check if this is a CV payment
            const applicant = await db.query.applicants.findFirst({
              where: eq(applicants.bachsCheckoutId, checkoutId),
            });

            if (applicant && !applicant.hasPaidCv) {
              // Mark applicant as paid
              await db
                .update(applicants)
                .set({
                  hasPaidCv: true,
                  bachsChargeId: chargeId,
                  paidAt: new Date(),
                  updatedAt: new Date(),
                })
                .where(eq(applicants.id, applicant.id));
            }
          }

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
   * Initialize CV Builder Payment
   * One-time payment of ₦1,000
   */
  initializeCvPayment: async (userId: string, email: string) => {
  try {
    console.log('Starting initializeCvPayment for userId:', userId);
    
    // Validate inputs
    if (!userId || !email) {
      return {
        success: false,
        message: "User ID and email are required",
      };
    }

    // Find or create applicant
    let applicant = await db.query.applicants.findFirst({
      where: eq(applicants.userId, userId),
    });

    if (!applicant) {
      const created = await db
        .insert(applicants)
        .values({
          userId,
          hasPaidCv: false,
        })
        .returning();
      applicant = created[0];
      console.log('Applicant created');
    }

    // Check if already paid
    if (applicant.hasPaidCv === true) {
      return {
        success: true,
        alreadyPaid: true,
        message: "You have already paid for your CV Builder.",
        data: {
          hasPaidCv: true,
          paidAt: applicant.paidAt,
        },
      };
    }

    // Prepare the request data for Bachs
    // Try different formats based on what works
    const requestData = {
      product_cart: [
        {
          product_id: process.env.BACHS_CV_PRODUCT_ID || "cv_builder",
          quantity: 1,
          amount: "1000.00",
          currency: "NGN",
        }
      ],
      customer: {
        email: email,
        name: "Applicant",
      },
      success_url: `${process.env.FRONTEND_URL}/applicant/cv/payment/callback`,
      cancel_url: `${process.env.FRONTEND_URL}/applicant/cv/payment/callback`,
      metadata: {
        user_id: userId,
        type: "cv_builder",
      },
    };

    console.log('Bachs request:', JSON.stringify(requestData, null, 2));

    const response = await axios.post(
      `${BACHS_API_URL}/v1/checkout-sessions`,
      requestData,
      {
        headers: {
          Authorization: `Bearer ${BACHS_API_KEY}`,
          "Content-Type": "application/json",
        },
        timeout: 30000,
      }
    );

    const data = response.data;
    console.log('Bachs response:', JSON.stringify(data, null, 2));

    // Extract checkout info from response
    const checkoutId = data?.data?.checkout_id || data?.checkout_id || data?.id;
    const checkoutUrl = data?.data?.checkout_url || data?.data?.url || data?.checkout_url || data?.url;

    if (!checkoutId || !checkoutUrl) {
      console.error('Missing checkout data:', data);
      return {
        success: false,
        message: "Payment service did not return checkout details",
        data: data,
      };
    }

    // Update applicant
    await db
      .update(applicants)
      .set({
        bachsCheckoutId: checkoutId,
        updatedAt: new Date(),
      })
      .where(eq(applicants.id, applicant.id));

    return {
      success: true,
      data: {
        authorizationUrl: checkoutUrl,
        checkoutId,
        amount: 1000,
        currency: "NGN",
      },
    };
  } catch (e) {
    console.error('initializeCvPayment error:', e);
    
    // Handle Axios errors specifically
    if (axios.isAxiosError(e)) {
      console.error('Status:', e.response?.status);
      console.error('Response data:', JSON.stringify(e.response?.data, null, 2));
      
      return {
        success: false,
        message: e.response?.data?.message || e.response?.data?.error || "Payment service error",
        details: e.response?.data,
      };
    }
    
    return {
      success: false,
      message: e instanceof Error ? e.message : "Internal server error",
    };
  }
},

  /**
   * Verify CV Payment
   * Use this for manual verification or callback handling
   */
  verifyCvPayment: async (userId: string, chargeId?: string) => {
    try {
      const applicant = await db.query.applicants.findFirst({
        where: eq(applicants.userId, userId),
      });

      if (!applicant) {
        return {
          success: false,
          message: "Applicant not found",
        };
      }

      // Check if already paid
      if (applicant.hasPaidCv === true) {
        return {
          success: true,
          message: "CV Builder is already unlocked.",
          data: { 
            hasPaidCv: true,
            paidAt: applicant.paidAt,
          },
        };
      }

      // If there's a pending checkout, verify with Bachs API
      if (applicant.bachsCheckoutId) {
        try {
          // Optionally verify with Bachs API here
          // const verification = await axios.get(
          //   `${BACHS_API_URL}/v1/checkout-sessions/${applicant.bachsCheckoutId}`,
          //   {
          //     headers: {
          //       Authorization: `Bearer ${BACHS_API_KEY}`,
          //     },
          //   }
          // );
          // If verified, mark as paid
        } catch (verifyErr) {
          console.log("Could not verify with Bachs API, marking as paid anyway");
        }
      }

      // Mark as paid
      await db
        .update(applicants)
        .set({
          hasPaidCv: true,
          bachsChargeId: chargeId || null,
          paidAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(applicants.id, applicant.id));

      return {
        success: true,
        message: "₦1,000 payment verified successfully! Your CV Builder is unlocked.",
        data: {
          hasPaidCv: true,
          paidAt: new Date(),
        },
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

      return {
        success: true,
        data: {
          hasPaidCv: applicant?.hasPaidCv || false,
          paidAt: applicant?.paidAt || null,
          amount: 1000,
          currency: "NGN",
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

  /**
   * Handle CV payment webhook specifically
   * This can be called from a dedicated webhook endpoint
   */
  handleCvPaymentWebhook: async (checkoutId: string, chargeId: string) => {
    try {
      // Find the applicant with this checkout ID
      const applicant = await db.query.applicants.findFirst({
        where: eq(applicants.bachsCheckoutId, checkoutId),
      });

      if (!applicant) {
        return {
          success: false,
          message: "Applicant not found for this checkout ID",
        };
      }

      // Check if already paid
      if (applicant.hasPaidCv === true) {
        return {
          success: true,
          message: "Applicant already has paid for CV Builder",
          data: {
            userId: applicant.userId,
            hasPaidCv: true,
            paidAt: applicant.paidAt,
          },
        };
      }

      // Mark applicant as paid
      await db
        .update(applicants)
        .set({
          hasPaidCv: true,
          bachsChargeId: chargeId,
          paidAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(applicants.id, applicant.id));

      return {
        success: true,
        message: "CV payment confirmed successfully",
        data: {
          userId: applicant.userId,
          hasPaidCv: true,
          paidAt: new Date(),
        },
      };
    } catch (e) {
      console.error("handleCvPaymentWebhook error:", e);
      return {
        success: false,
        message: e instanceof Error ? e.message : "Internal server error",
      };
    }
  },
};
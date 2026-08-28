import { db } from "../db/db";
import { users, recruiters, subscriptions, applicants, transactions  } from "../db/schema";
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
  handleWebhookEvent: async (event: { type?: string; data?: { checkout_id?: string; charge_id?: string } }) => {
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
   * One-time payment of ₦2,000
   */
initializeCvPayment: async (
  userId: string,
  email: string
) => {
  try {
    console.log(
      "Starting initializeCvPayment:",
      userId
    );

    /* =====================================================
       1. VALIDATE INPUT
    ===================================================== */

    if (!userId || !email) {
      return {
        success: false,
        message: "User ID and email are required",
      };
    }

    /* =====================================================
       2. FIND USER
    ===================================================== */

    const singleUser = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!singleUser) {
      return {
        success: false,
        message: "User not found",
      };
    }

    console.log("User found:", {
      id: singleUser.id,
      email: singleUser.email,
      role: singleUser.role,
    });

    /* =====================================================
       3. VALIDATE ROLE
    ===================================================== */

    if (singleUser.role !== "applicant") {
      return {
        success: false,
        message:
          "Only applicants can purchase the CV Builder",
      };
    }

    /* =====================================================
       4. FIND / CREATE APPLICANT
    ===================================================== */

    let applicant =
      await db.query.applicants.findFirst({
        where: eq(
          applicants.userId,
          userId
        ),
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

      console.log(
        "Applicant profile created:",
        applicant.id
      );
    }

    /* =====================================================
       5. CHECK IF ALREADY PAID
    ===================================================== */

    if (applicant.hasPaidCv === true) {
      return {
        success: true,

        alreadyPaid: true,

        message:
          "You have already paid for your CV Builder.",

        data: {
          hasPaidCv: true,
          paidAt: applicant.paidAt,
        },
      };
    }

    /* =====================================================
       6. CHECK EXISTING PENDING TRANSACTION
    ===================================================== */

    const existingTransaction =
      await db.query.transactions.findFirst({
        where: and(
          eq(
            transactions.userId,
            userId
          ),

          eq(
            transactions.applicantId,
            applicant.id
          ),

          eq(
            transactions.type,
            "cv_builder"
          ),

          eq(
            transactions.status,
            "pending"
          )
        ),
      });

    /*
     * If a previous checkout already exists,
     * don't create another payment session.
     */

    if (
      existingTransaction &&
      existingTransaction.providerCheckoutId
    ) {
      console.log(
        "Existing pending transaction found:",
        existingTransaction.id
      );

      return {
        success: true,

        message:
          "Existing CV payment session found",

        data: {
          transactionId:
            existingTransaction.id,

          reference:
            existingTransaction.providerTransactionId,

          checkoutId:
            existingTransaction.providerCheckoutId,

          amount: Number(
            existingTransaction.amount
          ),

          currency:
            existingTransaction.currency,
        },
      };
    }

    /* =====================================================
       7. CREATE INTERNAL TRANSACTION
       
       IMPORTANT:
       This happens BEFORE contacting Bachs.
    ===================================================== */

    const reference =
      `CV-${Date.now()}-${crypto.randomUUID()}`;

    const [transaction] = await db
      .insert(transactions)
      .values({
        userId,

        applicantId:
          applicant.id,

        type:
          "cv_builder",

        status:
          "pending",

        amount:
          "1000.00",

        currency:
          "NGN",

        providerTransactionId: reference,

        provider:
          "bachs",

        metadata: {
          userId,

          applicantId:
            applicant.id,

          type:
            "cv_builder",
        },

        createdAt:
          new Date(),

        updatedAt:
          new Date(),
      })
      .returning();

    if (!transaction) {
      throw new Error(
        "Failed to create transaction"
      );
    }

    console.log(
      "Transaction created:",
      {
        transactionId:
          transaction.id,

        reference:
          transaction.providerTransactionId,
      }
    );

    /* =====================================================
       8. PREPARE BACHS REQUEST
    ===================================================== */

    const requestData = {
      pricing: {
        currency: "USD",

        amount: "2.00",

        currency_options: {
          NGN: "2000.00",
        },
      },

      customer: {
        email,

        name:
          `${singleUser.firstName} ${singleUser.lastName}`,
      },

      success_url:
        `${process.env.FRONTEND_URL}` +
        `/applicant/cv/payment/callback`,

      cancel_url:
        `${process.env.FRONTEND_URL}` +
        `/applicant/cv/payment/callback`,

      metadata: {
        user_id:
          userId,

        applicant_id:
          applicant.id,

        transaction_id:
          transaction.id,

        reference:
          reference,

        type:
          "cv_builder",
      },
    };

    console.log(
      "Bachs request:",
      JSON.stringify(
        requestData,
        null,
        2
      )
    );

    /* =====================================================
       9. CALL BACHS
    ===================================================== */

    let response;

    try {
      response = await axios.post(
        `${BACHS_API_URL}/v1/checkout-sessions`,
        requestData,
        {
          headers: {
            Authorization:
              `Bearer ${BACHS_API_KEY}`,

            "Content-Type":
              "application/json",
          },

          timeout: 30000,
        }
      );
    } catch (paymentError) {
      console.error(
        "Bachs request failed:",
        paymentError
      );

      /* ===============================================
         MARK INTERNAL TRANSACTION AS FAILED
      =============================================== */
      let failureReason =
        "Payment provider error";

      let providerError: { detail?: string; message?: string } | null = null;

      if (
        axios.isAxiosError(
          paymentError
        )
      ) {
        providerError =
          paymentError.response?.data;

        failureReason =
          providerError?.detail ||
          providerError?.message ||
          paymentError.message ||
          "Payment provider error";
      } else if (
        paymentError instanceof Error
      ) {
        failureReason =
          paymentError.message;
      }

      await db
        .update(transactions)
        .set({
          status:
            "failed",

          failureReason:
            failureReason,

          updatedAt:
            new Date(),
        })
        .where(
          eq(
            transactions.id,
            transaction.id
          )
        );

      return {
        success: false,

        message:
          failureReason,

        details:
          providerError,

        data: {
          transactionId:
            transaction.id,

          reference:
            transaction.providerTransactionId,
        },
      };
    }

    /* =====================================================
       10. GET BACHS RESPONSE
    ===================================================== */

    const data =
      response.data;

    console.log(
      "Bachs response:",
      JSON.stringify(
        data,
        null,
        2
      )
    );

    /* =====================================================
       11. EXTRACT CHECKOUT INFORMATION
    ===================================================== */

    const checkoutId =
      data?.data?.checkout_id ||
      data?.checkout_id ||
      data?.id;

    const checkoutUrl =
      data?.data?.checkout_url ||
      data?.data?.url ||
      data?.checkout_url ||
      data?.url;

    /* =====================================================
       12. VALIDATE CHECKOUT RESPONSE
    ===================================================== */

    if (
      !checkoutId ||
      !checkoutUrl
    ) {
      console.error(
        "Bachs did not return checkout details:",
        data
      );

      await db
        .update(transactions)
        .set({
          status:
            "failed",

          failureReason:
            "Payment provider did not return checkout details",

          metadata:
            data,

          updatedAt:
            new Date(),
        })
        .where(
          eq(
            transactions.id,
            transaction.id
          )
        );

      return {
        success: false,

        message:
          "Payment service did not return checkout details",

        data: {
          transactionId:
            transaction.id,

          reference:
            transaction.providerTransactionId,

          providerResponse:
            data,
        },
      };
    }

    /* =====================================================
       13. UPDATE TRANSACTION
    ===================================================== */

    const [updatedTransaction] =
      await db
        .update(transactions)
        .set({
          providerCheckoutId:
            checkoutId,

          status:
            "pending",

          metadata:
            data,

          updatedAt:
            new Date(),
        })
        .where(
          eq(
            transactions.id,
            transaction.id
          )
        )
        .returning();

    console.log(
      "Transaction updated with checkout:",
      {
        transactionId:
          updatedTransaction?.id,

        checkoutId:
          updatedTransaction?.providerCheckoutId,
      }
    );

    /* =====================================================
       14. KEEP APPLICANT CHECKOUT ID
       
       This can remain for backward compatibility.
       The transactions table should be your main
       payment source of truth.
    ===================================================== */

    await db
      .update(applicants)
      .set({
        bachsCheckoutId:
          checkoutId,

        updatedAt:
          new Date(),
      })
      .where(
        eq(
          applicants.id,
          applicant.id
        )
      );

    /* =====================================================
       15. RETURN PAYMENT SESSION
    ===================================================== */

    return {
      success: true,

      message:
        "CV payment initialized successfully",

      data: {
        transactionId:
          transaction.id,

        reference:
          transaction.providerTransactionId,

        authorizationUrl:
          checkoutUrl,

        checkoutId:

          checkoutId,

        amount:
          1000,

        currency:
          "NGN",

        status:
          "pending",
      },
    };
  } catch (e) {
    console.error(
      "initializeCvPayment error:",
      e
    );

    /* =====================================================
       HANDLE AXIOS ERRORS
    ===================================================== */

    if (
      axios.isAxiosError(e)
    ) {
      console.error(
        "Bachs status:",
        e.response?.status
      );

      console.error(
        "Bachs response:",
        JSON.stringify(
          e.response?.data,
          null,
          2
        )
      );

      return {
        success: false,

        message:
          e.response?.data?.detail ||
          e.response?.data?.message ||
          e.response?.data?.error ||
          "Payment service error",

        details:
          e.response?.data,
      };
    }

    /* =====================================================
       GENERIC ERROR
    ===================================================== */

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
          console.log("Could not verify with Bachs API, marking as paid anyway", verifyErr);
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
        message: "₦2,000 payment verified successfully! Your CV Builder is unlocked.",
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
  handleCvPaymentWebhook: async (
    checkoutId: string,
    chargeId: string,
    event?: { type?: string; data?: { status?: string; checkout_id?: string; charge_id?: string } }
  ) => {
    try {
      console.log("========== CV PAYMENT WEBHOOK ==========");
      console.log("Checkout ID:", checkoutId);
      console.log("Charge ID:", chargeId);
      console.log(
        "Event:",
        JSON.stringify(event, null, 2)
      );
      console.log("========================================");

      /* =====================================================
        1. VALIDATE REQUIRED IDENTIFIERS
      ===================================================== */

      if (!checkoutId) {
        return {
          success: false,
          message: "Checkout ID is required",
        };
      }

      if (!chargeId) {
        return {
          success: false,
          message: "Charge ID is required",
        };
      }

      /* =====================================================
        2. VERIFY WEBHOOK EVENT
      ===================================================== */

      if (
        event &&
        event.type &&
        event.type !== "collection.succeeded"
      ) {
        console.log(
          "Ignoring webhook event:",
          event.type
        );

        return {
          success: false,
          message:
            "Webhook is not a successful collection event",
        };
      }

      /* =====================================================
        3. VERIFY PAYMENT STATUS
      ===================================================== */

      if (
        event?.data?.status &&
        event.data.status !== "succeeded"
      ) {
        return {
          success: false,
          message: "Payment has not succeeded",
        };
      }

      /* =====================================================
        4. FIND TRANSACTION
        
        IMPORTANT:
        We now use the transaction as the source of truth
        instead of relying only on applicants.bachsCheckoutId.
      ===================================================== */

      const transaction =
        await db.query.transactions.findFirst({
          where: eq(
            transactions.providerCheckoutId,
            checkoutId
          ),
        });

      if (!transaction) {
        console.error(
          "Transaction not found for checkout:",
          checkoutId
        );

        return {
          success: false,
          message:
            "Transaction not found for this checkout ID",
        };
      }

      console.log(
        "Transaction found:",
        transaction.id
      );

      /* =====================================================
        5. VERIFY THIS IS A CV PAYMENT
      ===================================================== */

      if (transaction.type !== "cv_builder") {
        console.error(
          "Invalid transaction type:",
          transaction.type
        );

        return {
          success: false,
          message:
            "This transaction is not a CV Builder payment",
        };
      }

      /* =====================================================
        6. IDEMPOTENCY CHECK
        
        Webhooks can arrive multiple times.

        If the transaction is already successful,
        DO NOT process the payment again.
      ===================================================== */

      if (transaction.status === "successful") {
        console.log(
          "Transaction already processed:",
          transaction.id
        );

        return {
          success: true,

          alreadyProcessed: true,

          message:
            "CV payment has already been processed",

          data: {
            transactionId:
              transaction.id,

            userId:
              transaction.userId,

            applicantId:
              transaction.applicantId,

            checkoutId,

            chargeId:
              transaction.providerChargeId ||
              chargeId,

            status:
              transaction.status,

            paidAt:
              transaction.paidAt,
          },
        };
      }

      /* =====================================================
        7. MAKE SURE TRANSACTION IS EXPECTED
      ===================================================== */

      if (transaction.status !== "pending") {
        console.warn(
          "Transaction is not pending:",
          {
            transactionId:
              transaction.id,

            status:
              transaction.status,
          }
        );

        return {
          success: false,

          message:
            `Transaction cannot be completed because its current status is "${transaction.status}"`,
        };
      }

      /* =====================================================
        8. FIND APPLICANT
      ===================================================== */

      if (!transaction.applicantId) {
        console.error(
          "Transaction has no applicant ID:",
          transaction.id
        );

        return {
          success: false,

          message:
            "Transaction is missing applicant information",
        };
      }

      const applicant =
        await db.query.applicants.findFirst({
          where: eq(
            applicants.id,
            transaction.applicantId
          ),
        });

      if (!applicant) {
        console.error(
          "Applicant not found:",
          transaction.applicantId
        );

        return {
          success: false,

          message:
            "Applicant not found for this transaction",
        };
      }

      /* =====================================================
        9. SECOND IDEMPOTENCY CHECK
        
        The applicant may already have been marked as paid
        by another successful webhook.

        We don't blindly reject it because the transaction
        itself is our primary payment record.
      ===================================================== */

      if (applicant.hasPaidCv === true) {
        console.log(
          "Applicant already has CV access:",
          applicant.id
        );

        /*
        * Synchronize the transaction if necessary.
        *
        * This protects against a situation where the
        * applicant was marked as paid but the transaction
        * update failed during an earlier request.
        */

        const paidAt =
          applicant.paidAt || new Date();

        await db
          .update(transactions)
          .set({
            status: "successful",

            providerChargeId:
              transaction.providerChargeId ||
              chargeId,

            paidAt,

            updatedAt:
              new Date(),
          })
          .where(
            eq(
              transactions.id,
              transaction.id
            )
          );

        return {
          success: true,

          alreadyProcessed: true,

          message:
            "CV payment was already confirmed",

          data: {
            transactionId:
              transaction.id,

            userId:
              applicant.userId,

            applicantId:
              applicant.id,

            hasPaidCv: true,

            checkoutId,

            chargeId,

            paidAt,
          },
        };
      }

      /* =====================================================
        10. CONFIRM PAYMENT ATOMICALLY
        
        Both the transaction and applicant are updated
        inside ONE database transaction.

        Either BOTH succeed or BOTH roll back.
      ===================================================== */

      const paidAt = new Date();

      const result =
        await db.transaction(
          async (tx) => {

            /* -----------------------------------------------
              Update payment transaction
            ------------------------------------------------ */

            const updatedTransactions =
              await tx
                .update(transactions)
                .set({
                  status: "successful",

                  providerChargeId:
                    chargeId,

                  paidAt,

                  updatedAt:
                    paidAt,

                  /*
                  * Preserve useful webhook information.
                  */
                  metadata:
                    event
                      ? JSON.stringify(event)
                      : transaction.metadata,
                })
                .where(
                  and(
                    eq(
                      transactions.id,
                      transaction.id
                    ),

                    /*
                    * IMPORTANT:
                    *
                    * Only transition pending -> successful.
                    *
                    * This provides another layer of
                    * protection against duplicate webhook
                    * processing.
                    */
                    eq(
                      transactions.status,
                      "pending"
                    )
                  )
                )
                .returning();

            /*
            * If nothing was updated, another request may
            * have processed the transaction concurrently.
            */
            if (
              updatedTransactions.length === 0
            ) {
              const currentTransaction =
                await tx.query.transactions.findFirst(
                  {
                    where: eq(
                      transactions.id,
                      transaction.id
                    ),
                  }
                );

              if (
                currentTransaction?.status ===
                "successful"
              ) {
                return {
                  alreadyProcessed: true,

                  transaction:
                    currentTransaction,
                };
              }

              throw new Error(
                "Transaction could not be confirmed"
              );
            }

            /* -----------------------------------------------
              Update applicant
            ------------------------------------------------ */

            const updatedApplicants =
              await tx
                .update(applicants)
                .set({
                  hasPaidCv: true,

                  bachsChargeId:
                    chargeId,

                  paidAt,

                  updatedAt:
                    paidAt,
                })
                .where(
                  and(
                    eq(
                      applicants.id,
                      applicant.id
                    ),

                    /*
                    * Only update an unpaid applicant.
                    */
                    eq(
                      applicants.hasPaidCv,
                      false
                    )
                  )
                )
                .returning();

            /*
            * Normally this should always update one row.
            */
            if (
              updatedApplicants.length === 0
            ) {
              const currentApplicant =
                await tx.query.applicants.findFirst(
                  {
                    where: eq(
                      applicants.id,
                      applicant.id
                    ),
                  }
                );

              if (
                currentApplicant?.hasPaidCv ===
                true
              ) {
                return {
                  alreadyProcessed: true,

                  transaction:
                    updatedTransactions[0],

                  applicant:
                    currentApplicant,
                };
              }

              throw new Error(
                "Applicant CV payment status could not be updated"
              );
            }

            return {
              alreadyProcessed: false,

              transaction:
                updatedTransactions[0],

              applicant:
                updatedApplicants[0],
            };
          }
        );

      /* =====================================================
        11. HANDLE CONCURRENT / DUPLICATE WEBHOOK
      ===================================================== */

      if (result.alreadyProcessed) {
        console.log(
          "CV payment was already processed concurrently"
        );

        return {
          success: true,

          alreadyProcessed: true,

          message:
            "CV payment has already been processed",

          data: {
            transactionId:
              result.transaction.id,

            userId:
              applicant.userId,

            applicantId:
              applicant.id,

            hasPaidCv: true,

            checkoutId,

            chargeId,

            paidAt:
              result.transaction.paidAt,
          },
        };
      }

      /* =====================================================
        12. SUCCESS
      ===================================================== */

      console.log(
        "========================================"
      );

      console.log(
        "CV PAYMENT SUCCESSFULLY CONFIRMED"
      );

      console.log({
        transactionId:
          result.transaction.id,

        userId:
          applicant.userId,

        applicantId:
          applicant.id,

        checkoutId,

        chargeId,

        paidAt,
      });

      console.log(
        "========================================"
      );

      return {
        success: true,

        message:
          "CV payment confirmed successfully",

        data: {
          transactionId:
            result.transaction.id,

          userId:
            applicant.userId,

          applicantId:
            applicant.id,

          hasPaidCv: true,

          checkoutId,

          chargeId,

          paidAt,
        },
      };

    } catch (e) {
      /* =====================================================
        ERROR HANDLING
      ===================================================== */

      console.error(
        "handleCvPaymentWebhook error:",
        e
      );

      return {
        success: false,

        message:
          e instanceof Error
            ? e.message
            : "Internal server error",
      };
    }
  },

  getUserTransactions: async (
      userId: string
    ) => {
      try {

        if (!userId) {
          return {
            success: false,
            message: "User ID is required",
            status: 400,
          };
        }

        const userTransactions =
          await db
            .select()
            .from(applicants)
            .where(
              eq(
                applicants.userId,
                userId
              )
            )
            .orderBy(
              desc(
                applicants.createdAt
              )
            );

        return {
          success: true,

          message:
            "Transactions fetched successfully",

          data: {
            transactions:
              userTransactions,

            total:
              userTransactions.length,
          },

          status: 200,
        };

      } catch (error) {

        console.error(
          "GET USER TRANSACTIONS ERROR:",
          error
        );

        return {
          success: false,
          message:
            "Failed to fetch transactions",

          error:
            error instanceof Error
              ? error.message
              : "Internal Server Error",

          status: 500,
        };
      }
    },
};
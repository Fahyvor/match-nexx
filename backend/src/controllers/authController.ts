import { registerUser, loginUser, updateUser } from "../modules/auth";
import { createToken, verifyToken } from "../utils/jwt";
import type { Context } from "elysia";
import type { User } from "../models/User";
import { users } from "../db/schema";
import { db } from "../db/db";
import { eq } from "drizzle-orm";
import { calculateProfileCompletion } from "../utils/profileCompletion";

type AppError = {
  status?: number;
  error?: string;
};

export const authController = {
  register: async (data: {
    firstName: string;
    lastName: string;
    phone: string;
    address: string;
    state: string;
    country: string;
    years_of_experience: number;
    email: string;
    password: string;
    userType: "applicant" | "recruiter" | "admin";
  }) => {
    try {
      const result = await registerUser({
        firstName: data.firstName,
        lastName: data.lastName,
        state: data.state,
        country: data.country,
        years_of_experience: data.years_of_experience,
        email: data.email,
        password: data.password,
        role: data.userType,
      });

      return {
        success: true,
        message: "User registered successfully",
        data: {
          id: result.user.id,
          email: result.user.email,
          role: result.user.role,
        },
      };
    } catch (err: unknown) {
      console.error("REGISTER ERROR FULL:", err);

      let message = "Unknown error";

      if (err instanceof Error) {
        message = err.message;
      } else if (
        typeof err === "object" &&
        err !== null &&
        "error" in err
      ) {
        const e = err as { error?: string };
        message = e.error || message;
      }

      return {
        success: false,
        message: "Registration failed",
        error: message,
      };
    }
  },

  login: async (email: string, password: string) => {
    try {
      const result = await loginUser(email, password);

      const token = createToken(
        result.user.id,
        result.user.email,
        result.user.role
      );

      let profileCompletion = null;

      if (result.user.role === "applicant") {
        profileCompletion = await calculateProfileCompletion(result.user.id);
      }

      return {
        success: true,
        message: "Login successful",
        data: {
          token,
          user: {
            ...result.user,
            profileCompletion,
          },
        },
      };
    } catch (err: unknown) {
      const error = err as AppError;

      throw new Response(
        JSON.stringify({
          success: false,
          message: error.error || "Invalid credentials",
        }),
        {
          status: error.status || 401,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }
  },

  updateUser: async ({
    body,
    set,
  }: Context & { body: User }) => {
    try {
      const result = await updateUser({
        id: body.id,
        firstName: body.firstName,
        lastName: body.lastName,
        state: body.state,
        country: body.country,
        years_of_experience: body.years_of_experience,
        email: body.email,
        password: body.password,
        role: body.userType,
      });

      set.status = 201;

      return {
        success: true,
        message: "User registered successfully",
        data: {
          id: result.user.id,
          email: result.user.email,
          role: result.user.role,
        },
      };
    } catch (err: unknown) {
      console.error("REGISTER ERROR FULL:", err);
      const error = err as AppError;

      set.status = error.status ?? 500;

      return {
        success: false,
        message: "Registration failed",
        error: error.error || "Unknown error",
      };
    }
  },

deleteUser: async ({
  body,
  user,
}: Context & {
  body: { id: string };
  user: User;
}) => {
  try {
    if (user.userType !== "admin") {
      throw {
        status: 403,
        error: "Forbidden: Admins only",
      };
    }

    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.id, body.id))
      .limit(1);

    if (existingUser.length === 0) {
      throw {
        status: 404,
        error: "User not found",
      };
    }

    await db.delete(users).where(eq(users.id, body.id));

    return {
      success: true,
      message: "User deleted successfully",
    };
  } catch (error: unknown) {
    const err = error as { status?: number; error?: string };

    throw {
      status: err.status || 500,
      error: err.error || "Internal server error",
    };
  }
},

deleteOwnAccount: async ({
  user,
}: Context & {
  user: User;
}) => {
  try {
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.id, user.id))
      .limit(1);

    if (existingUser.length === 0) {
      throw {
        status: 404,
        error: "User not found",
      };
    }

    await db
      .delete(users)
      .where(eq(users.id, user.id));

    return {
      success: true,
      message: "Account deleted successfully",
    };
  } catch (error: unknown) {
    const err = error as { status?: number; error?: string };

    throw {
      status: err.status || 500,
      error: err.error || "Internal server error",
    };
  }
},

  logout: async () => {
    return {
      success: true,
      message: "Logged out successfully",
    };
  },

  refreshToken: async (authHeader?: string) => {
    try {
      if (!authHeader) {
        return {
          success: false,
          message: "No token provided",
          error: "Unauthorized",
        };
      }

      const token = authHeader.replace("Bearer ", "");
      const payload = verifyToken(token);

      if (!payload) {
        return {
          success: false,
          message: "Invalid or expired token",
          error: "Unauthorized",
        };
      }

      const newToken = createToken(
        payload.userId,
        payload.email,
        payload.role
      );

      return {
        success: true,
        message: "Token refreshed successfully",
        data: { token: newToken },
      };
    } catch {
      return {
        success: false,
        message: "Token refresh failed",
        error: "Unauthorized",
      };
    }
  },

  allUsers: async () => {
    try {
      // 1. Fetch users only
      const allUsers = await db.query.users.findMany();

      // 2. Only recruiters need payment information
      const recruiterUsers = allUsers.filter(
        (user) => user.role === "recruiter"
      );

      // 3. Get recruiter profiles for recruiter users
      const recruiterProfiles = await db.query.recruiters.findMany({
        where: (recruiters, { inArray }) =>
          inArray(
            recruiters.userId,
            recruiterUsers.map((user) => user.id)
          ),
      });

      // 4. Get subscriptions for those recruiters
      const recruiterIds = recruiterProfiles.map(
        (recruiter) => recruiter.id
      );

      const subscriptions =
        recruiterIds.length > 0
          ? await db.query.subscriptions.findMany({
              where: (subscriptions, { inArray }) =>
                inArray(
                  subscriptions.recruiterId,
                  recruiterIds
                ),
            })
          : [];

      // 5. Build a recruiterId -> subscription mapping
      const subscriptionsByRecruiter = new Map<
        string,
        typeof subscriptions
      >();

      for (const subscription of subscriptions) {
        const existing =
          subscriptionsByRecruiter.get(
            subscription.recruiterId
          ) ?? [];

        existing.push(subscription);

        subscriptionsByRecruiter.set(
          subscription.recruiterId,
          existing
        );
      }

      // 6. Build user -> recruiter mapping
      const recruiterByUser = new Map(
        recruiterProfiles.map((recruiter) => [
          recruiter.userId,
          recruiter,
        ])
      );

      // 7. Add payment information
      const usersWithPayment = allUsers.map((user) => {
        // Applicants/admins don't have subscription payments
        if (user.role !== "recruiter") {
          return {
            ...user,

            payment: {
              applicable: false,
              hasPaid: false,
              status: null,
              plan: null,
              currentPeriodEnd: null,
            },
          };
        }

        const recruiter =
          recruiterByUser.get(user.id);

        const userSubscriptions = recruiter
          ? subscriptionsByRecruiter.get(
              recruiter.id
            ) ?? []
          : [];

        // Most recent subscription
        const latestSubscription = [
          ...userSubscriptions,
        ].sort((a, b) => {
          const dateA = a.createdAt
            ? new Date(a.createdAt).getTime()
            : 0;

          const dateB = b.createdAt
            ? new Date(b.createdAt).getTime()
            : 0;

          return dateB - dateA;
        })[0];

        const hasPaid = Boolean(
          latestSubscription &&
            latestSubscription.status === "active" &&
            latestSubscription.currentPeriodEnd &&
            new Date(
              latestSubscription.currentPeriodEnd
            ) > new Date()
        );

        return {
          ...user,

          payment: {
            applicable: true,
            hasPaid,

            status:
              latestSubscription?.status ??
              "inactive",

            plan:
              latestSubscription?.plan ??
              null,

            currentPeriodEnd:
              latestSubscription?.currentPeriodEnd ??
              null,
          },
        };
      });

      return {
        success: true,

        message:
          usersWithPayment.length > 0
            ? "Fetched all users"
            : "No users found",

        data: {
          users: usersWithPayment,
        },

        status: 200,
      };
    } catch (error) {
      console.error(
        "FETCH USERS ERROR:",
        error
      );

      return {
        success: false,
        message: "Failed to fetch users",

        error:
          error instanceof Error
            ? error.message
            : "Internal Server Error",

        status: 500,
      };
    }
  },

  getAllApplicants: async () => {
    try {
      const allApplicants = await db.query.users.findMany({
        where: (users, { eq }) => eq(users.role, "applicant"),
        with: {
          applicant: {
            with: {
              experiences: true,
              educations: true,
            },
          },
        },
      });

      return {
        success: true,
        data: allApplicants,
      };

    } catch (e) {
      console.error("getAllApplicants error:", e);

      return {
        success: false,
        message: e instanceof Error ? e.message : "Internal server error",
      };
    }
  },

  getSingleUser: async ({ id }: { id: string }) => {
    try {
      const user = await db.query.users.findFirst({
        where: (users, { eq }) => eq(users.id, id),

        with: {
          applicant: {
            with: {
              experiences: true,
              educations: true,
            },
          },

          recruiter: {
            with: {
              subscriptions: true,
            },
          },
        },
      });

      if (!user) {
        return {
          success: false,
          message: "User not found",
          status: 404,
        };
      }

      /**
       * Find the most recent subscription
       */
      const subscriptions =
        user.recruiter?.subscriptions ?? [];

      const latestSubscription = subscriptions
        .sort((a, b) => {
          const dateA = a.createdAt
            ? new Date(a.createdAt).getTime()
            : 0;

          const dateB = b.createdAt
            ? new Date(b.createdAt).getTime()
            : 0;

          return dateB - dateA;
        })[0];

      /**
       * Determine whether the subscription
       * is currently active.
       */
      const hasPaid = Boolean(
        latestSubscription &&
          latestSubscription.status === "active" &&
          latestSubscription.currentPeriodEnd &&
          new Date(latestSubscription.currentPeriodEnd) > new Date()
      );

      return {
        success: true,

        data: {
          ...user,

          payment: {
            hasPaid,

            status:
              latestSubscription?.status ??
              "inactive",

            plan:
              latestSubscription?.plan ??
              null,

            currentPeriodEnd:
              latestSubscription?.currentPeriodEnd ??
              null,

            checkoutId:
              latestSubscription?.bachsCheckoutId ??
              null,

            chargeId:
              latestSubscription?.bachsChargeId ??
              null,
          },
        },
      };
    } catch (e) {
      console.error("getSingleUser error:", e);

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
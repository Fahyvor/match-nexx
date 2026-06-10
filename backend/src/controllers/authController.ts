import { registerUser, loginUser } from "../modules/auth";
import { createToken, verifyToken } from "../utils/jwt";
import type { Context } from "elysia";
import type { User } from "../models/User";
import { users } from "../db/schema";
import { db } from "../db/db";

type AppError = {
  status?: number;
  error?: string;
};

export const authController = {
  register: async ({
    body,
    set,
  }: Context & { body: User }) => {
    try {
      console.log("REGISTER BODY:", body);
      const result = await registerUser({
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

  login: async (email: string, password: string) => {
    try {
      const result = await loginUser(email, password);

      const token = createToken(
        result.user.id,
        result.user.email,
        result.user.role
      );

      return {
        success: true,
        message: "Login successful",
        data: {
          token,
          user: result.user,
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
      const allUsers = await db
        .select({
          id: users.id,
          email: users.email,
          role: users.role,
          firstName: users.firstName,
          lastName: users.lastName,
          state: users.state,
          country: users.country,
          years_of_experience: users.years_of_experience,
          createdAt: users.createdAt,
        })
        .from(users);

      if (allUsers.length === 0) {
        return {
          success: true,
          message: "No users found",
          data: { users: [] },
          status: 200,
        };
      }

      return {
        success: true,
        message: "Fetched all users",
        data: { users: allUsers },
        status: 200,
      };
    } catch (error) {
      console.error("FETCH USERS ERROR:", error);
      return {
        success: false,
        message: "Failed to fetch users",
        error: "Internal Server Error",
        status: 500,
      };
    }
  },
};
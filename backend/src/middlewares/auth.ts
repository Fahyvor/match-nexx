import Elysia from "elysia";
import { verifyToken } from "../utils/jwt";

export type AuthUser = {
  id: string;
  email: string;
  role: "applicant" | "recruiter" | "admin";
};

/* =========================
   AUTH + ROLE GUARD (COMBINED)
========================= */
export const authMiddleware = (roles?: AuthUser["role"][]) =>
  new Elysia({ name: "auth-guard" }).derive(
    { as: "scoped" },
    ({ headers }) => {
      const authHeader = headers.authorization;

      if (!authHeader || Array.isArray(authHeader)) {
        throw new Response("Unauthorized: No token provided", {
          status: 401,
        });
      }

      const token = authHeader.replace("Bearer ", "").trim();
      const payload = verifyToken(token) as AuthUser | null;

      if (!payload) {
        throw new Response("Unauthorized: Invalid token", {
          status: 401,
        });
      }

      // ROLE CHECK (only if roles are provided)
      if (roles && roles.length > 0) {
        if (!roles.includes(payload.role)) {
          throw new Response("Forbidden: Insufficient permissions", {
            status: 403,
          });
        }
      }

      return {
        user: payload,
      };
    }
  );
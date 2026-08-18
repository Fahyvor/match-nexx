import Elysia from "elysia";
import { verifyToken } from "../utils/jwt";

export type AuthUser = {
  sub: string;
  email: string;
  role: "applicant" | "recruiter" | "admin";
};
export const authMiddleware = (roles?: AuthUser["role"][]) =>
  new Elysia({ name: "auth-guard" }).derive(
    { as: "scoped" },
    ({ headers }) => {
      const authHeader =
        headers.authorization ||
        headers.Authorization ||
        headers["authorization"];

      if (!authHeader || typeof authHeader !== "string") {
        throw new Response("Unauthorized: No token provided", {
          status: 401,
        });
      }

      if (!authHeader.startsWith("Bearer ")) {
        throw new Response("Unauthorized: Invalid token format", {
          status: 401,
        });
      }

      const token = authHeader.slice(7).trim();

      let payload: AuthUser | null = null;

      try {
        payload = verifyToken(token) as AuthUser;

        console.log("========== AUTH DEBUG ==========");
        console.log("PAYLOAD:", payload);
        console.log("USER ID:", payload?.sub);
        console.log("EMAIL:", payload?.email);
        console.log("ROLE:", payload?.role);
        console.log("ALLOWED ROLES:", roles);
        console.log("ROLE ALLOWED:", roles?.includes(payload?.role));
        console.log("================================");
      } catch (error) {
        console.error("JWT VERIFY ERROR:", error);

        throw new Response("Unauthorized: Invalid token", {
          status: 401,
        });
      }

      if (!payload) {
        throw new Response("Unauthorized: Invalid token", {
          status: 401,
        });
      }

      if (roles?.length && !roles.includes(payload.role)) {
        console.log(
          `FORBIDDEN: role "${payload.role}" is not allowed`
        );

        throw new Response("Forbidden: Insufficient permissions", {
          status: 403,
        });
      }

      return {
        user: payload,
      };
    }
  );
  
// export const authMiddleware = (roles?: AuthUser["role"][]) =>
//   new Elysia({ name: "auth-guard" }).derive(
//     { as: "scoped" },
//     ({ headers }) => {
//       const authHeader =
//         headers.authorization ||
//         headers.Authorization ||
//         headers["authorization"];

//       // console.log("Authorization header", authHeader)

//       if (!authHeader || typeof authHeader !== "string") {
//         throw new Response("Unauthorized: No token provided", {
//           status: 401,
//         });
//       }

//       if (!authHeader.startsWith("Bearer ")) {
//         throw new Response("Unauthorized: Invalid token format", {
//           status: 401,
//         });
//       }

//       const token = authHeader.slice(7).trim();

//       let payload: AuthUser | null = null;

//       try {
//         payload = verifyToken(token) as AuthUser;
//       } catch {
//         throw new Response("Unauthorized: Invalid token", {
//           status: 401,
//         });
//       }

//       if (!payload) {
//         throw new Response("Unauthorized: Invalid token", {
//           status: 401,
//         });
//       }

//       if (roles?.length && !roles.includes(payload.role)) {
//         throw new Response("Forbidden: Insufficient permissions", {
//           status: 403,
//         });
//       }

//       return {
//         user: payload,
//       };
//     }
//   );
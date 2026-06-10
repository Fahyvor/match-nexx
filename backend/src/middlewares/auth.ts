import Elysia from "elysia";
import { verifyToken } from "../utils/jwt";

export const authMiddleware = new Elysia({ name: "authMiddleware" })
  .derive({ as: "scoped" }, ({ headers }) => {
    const authHeader = headers.authorization;

    if (!authHeader) {
      throw new Error("Unauthorized: No token provided");
    }

    const token = authHeader.replace("Bearer ", "");
    const payload = verifyToken(token);

    if (!payload) {
      throw new Error("Unauthorized: Invalid token");
    }

    return { user: payload };
  });
import { Elysia } from "elysia";
import { paymentController } from "../controllers/paymentController";

export const requireActiveSubscription = new Elysia().onBeforeHandle(
  async ({ user, set }: { user?: { sub: string; id?: string; role: string }; set: any }) => {
    if (!user) {
      set.status = 401;
      return { success: false, message: "Unauthorized" };
    }

    if (user.role !== "recruiter") return;

    const userId = user.sub || user.id || "";
    const status = await paymentController.getStatus(userId);

    if (!status.success || !status.data?.isActive) {
      set.status = 402;
      return {
        success: false,
        message: "Active subscription required to view candidates",
        code: "SUBSCRIPTION_REQUIRED",
      };
    }
  }
);
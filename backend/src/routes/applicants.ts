import Elysia, { t } from "elysia";
import { ApplicantController } from "../controllers/applicantController";
import { authMiddleware } from "../middlewares/auth";

const applicantController = new ApplicantController();

export default new Elysia({ prefix: "/applicant" })

.use(authMiddleware(["applicant"]))
.put(
  "/complete-profile",
  applicantController.completeProfile,
  {
    body: t.Object({
      headline: t.Optional(t.String()),
      summary: t.Optional(t.String()),
      phone: t.Optional(t.String()),
      location: t.Optional(t.String()),
      portfolio: t.Optional(t.String()),
      github: t.Optional(t.String()),
      linkedin: t.Optional(t.String()),
    }),
  }
)

.put(
  "/upload-cv",
  applicantController.uploadCV,
  {
    body: t.Object({
      cv: t.File({
        type: "application/pdf",
      }),
    }),
  }
)

.post(
  "/parse-cv",
  applicantController.parseCV,
  {
    body: t.Object({
      cv: t.File({
        type: "application/pdf",
      }),
    }),
  }
)

.post(
  "/apply/:jobId",
  applicantController.applyForJob,
  {
    params: t.Object({
      jobId: t.String(),
    }),
  }
);
import { Elysia, t } from "elysia";
import { authMiddleware } from "../middlewares/auth";
import { cvController } from "../controllers/cvController";

const app = new Elysia({ prefix: "/cv" })
  .use(authMiddleware(["applicant"]))

  .post(
    "/create",
    async ({ user, body }) => cvController.create(user?.sub, body),
    {
      body: t.Object({
        personalInfo: t.Object({
          phone: t.String(),
          position: t.Optional(t.String()),
          firstName: t.Optional(t.String()),
          lastName: t.Optional(t.String()),
          address: t.Optional(t.String()),
        }),
        skills: t.Array(t.String()),
        experiences: t.Optional(
          t.Array(
            t.Object({
              company: t.String(),
              role: t.String(),
              startDate: t.Optional(t.String()),
              endDate: t.Optional(t.String()),
              isCurrent: t.Optional(t.Boolean()),
              description: t.Optional(t.String()),
            })
          )
        ),
        educations: t.Optional(
          t.Array(
            t.Object({
              institution: t.String(),
              degree: t.Optional(t.String()),
              department: t.Optional(t.String()),
              startDate: t.Optional(t.String()),
              endDate: t.Optional(t.String()),
            })
          )
        ),
        projects: t.Optional(
          t.Array(
            t.Object({
              name: t.String(),
              description: t.Optional(t.String()),
              technologies: t.Optional(t.Array(t.String())),
              link: t.Optional(t.String()),
            })
          )
        ),
        references: t.Optional(
          t.Array(
            t.Object({
              name: t.String(),
              position: t.Optional(t.String()),
              company: t.Optional(t.String()),
              email: t.Optional(t.String()),
              phone: t.Optional(t.String()),
              relationship: t.Optional(t.String()),
            })
          )
        ),
        links: t.Optional(
          t.Object({
            portfolio: t.Optional(t.String()),
            linkedIn: t.Optional(t.String()),
            github: t.Optional(t.String()),
            twitter: t.Optional(t.String()),
            facebook: t.Optional(t.String()),
          })
        ),
        professionalSummary: t.Optional(t.String()),
      }),
    }
  )

  .post(
    "/generate-summary",
    async ({ user, body }) => cvController.generateSummary(user?.sub, body as any),
    {
      body: t.Object({
        personalInfo: t.Optional(
          t.Object({
            phone: t.Optional(t.String()),
            position: t.Optional(t.String()),
          })
        ),
        skills: t.Optional(t.Array(t.String())),
        experiences: t.Optional(
          t.Array(
            t.Object({
              company: t.String(),
              role: t.String(),
              startDate: t.Optional(t.String()),
              endDate: t.Optional(t.String()),
              isCurrent: t.Optional(t.Boolean()),
              description: t.Optional(t.String()),
            })
          )
        ),
        educations: t.Optional(
          t.Array(
            t.Object({
              institution: t.String(),
              degree: t.Optional(t.String()),
              department: t.Optional(t.String()),
              startDate: t.Optional(t.String()),
              endDate: t.Optional(t.String()),
            })
          )
        ),
      }),
    }
  )

  .get("/me", async ({ user }) => cvController.getByUserId(user?.sub));

export default app;
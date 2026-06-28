import { Elysia, t } from "elysia";
import { jobController } from "../controllers/jobController";
import { authMiddleware } from "../middlewares/auth";

export default new Elysia({ prefix: "/jobs" })

  .use(authMiddleware(["recruiter", "applicant", "admin"]))
  .get("/all-jobs", ({ query }) => {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;

    return jobController.getAllJobs(page, limit);
  })

  .get(
    "/get-single-job/:id",
    ({ params }: { params: { id: string } }) => {
      return jobController.getJobById(params.id);
    }
  )

  .use(authMiddleware(["recruiter"]))
  .post(
    "/create-job",
    ({ body, user}) => {
      const recruiterId = user?.sub
      // console.log("User", user)
      if (!user?.sub) {
        throw new Error("Unauthorized - missing user");
      }
      return jobController.createJob(recruiterId, body);
    },
    {
      body: t.Object({
        title: t.String(),
        company: t.String(),
        description: t.String(),
        requirements: t.Array(t.String()),
        experienceLevel: t.String(),
        salary: t.Number(),
        type: t.String(),
        location: t.String(),
      }),
    }
  )

  .use(authMiddleware(["recruiter"]))
  .put(
    "/update-job/:id",
    ({ params, body, user }) => {
      const recruiterId = user?.sub;

      return jobController.updateJob(params.id, recruiterId, body);
    },
    {
      body: t.Partial(
        t.Object({
          title: t.String(),
          company: t.String(),
          description: t.String(),
          requirements: t.Array(t.String()),
          experienceLevel: t.String(),
          salary: t.Number(),
          type: t.String(),
          location: t.String(),
          status: t.String(),
        })
      ),
    }
  )

  .use(authMiddleware(["recruiter"]))
  .delete("/delete-job/:id", ({ params, user }) => {
    const recruiterId = user?.sub
    return jobController.deleteJob(params.id, recruiterId);
  });
import { Elysia, t } from "elysia";
import { jobController } from "../controllers/jobController";

export default new Elysia({ prefix: "/jobs" })

  .get("/", ({ query }) => {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;

    return jobController.getAllJobs(page, limit);
  })

  .get("/:id", ({ params }) => {
    return jobController.getJobById(params.id);
  })

  .post(
    "/create-job",
    ({ body, headers }) => {
      const recruiterId = headers["x-user-id"];
      return jobController.createJob(recruiterId, body);
    },
    {
      body: t.Object({
        title: t.String(),
        company: t.String(),
        description: t.String(),
        requirements: t.Array(t.String()),
        salary: t.String(),
      }),
    }
  )

  .put("/:id", ({ params, body, headers }) => {
    const recruiterId = headers["x-user-id"];
    return jobController.updateJob(params.id, recruiterId, body);
  })

  .delete("/:id", ({ params, headers }) => {
    const recruiterId = headers["x-user-id"];
    return jobController.deleteJob(params.id, recruiterId);
  });
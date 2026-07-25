import { eq } from "drizzle-orm";
import { db } from "../db/db";
import { jobs } from "../db/schema";
import { randomUUID } from "crypto";

export const jobController = {
  /* =========================
     GET ALL JOBS
  ========================= */
  getAllJobs: async (page = 1, limit = 20) => {
    const offset = (page - 1) * limit;

    const allJobs = await db.select().from(jobs).limit(limit).offset(offset);

    const total = await db.select().from(jobs);

    return {
      success: true,
      message: "Jobs fetched successfully!",
      status: 200,
      data: allJobs,
      total: total.length,
      page,
      limit,
    };
  },

  /* =========================
     GET JOB BY ID
  ========================= */
  getJobById: async (jobId: string) => {
    const result = await db
      .select()
      .from(jobs)
      .where(eq(jobs.id, jobId))
      .limit(1);

    const job = result[0];

    if (!job) {
      return { success: false, error: "Job not found" };
    }

    return { success: true, data: job };
  },

  //Get job by a particular recruiter
  getJobsByRecruiter: async (recruiterId: string) => {
    const jobsByRecruiter = await db
      .select()
      .from(jobs)
      .where(eq(jobs.recruiterId, recruiterId));

    if (!jobsByRecruiter || jobsByRecruiter.length === 0) {
      return {
        success: false,
        status: 404,
        error: "No jobs found for this recruiter",
      };
    }

    const totalApplicants = jobsByRecruiter.reduce(
      (total, job) => total + (job.totalApplicants ?? 0),
      0
    );

    return {
      success: true,
      message: "Jobs fetched successfully!",
      status: 200,
      totalApplicants,
      data: jobsByRecruiter,
    };
  },

  /* =========================
     CREATE JOB
  ========================= */
  createJob: async (
    recruiterId: string,
    jobData: {
      title: string;
      description: string;
      location?: string;
      type?: string;
      requirements?: string[];
      salary?: number | string;
      company: string;
      experienceLevel: string;
    }
  ) => {
    console.log("Job Data", jobData)
    console.log("Recruiter ID", recruiterId)
    if (!jobData.title || !jobData.description) {
      return {
        success: false,
        error: "Title and description are required",
      };
    }

    const newJob = {
      id: randomUUID(),

      recruiterId,

      title: jobData.title,
      description: jobData.description,

      experienceLevel: jobData.experienceLevel ?? "",

      location: jobData.location ?? "",
      type: jobData.type ?? "",
      company: jobData.company ?? "",

      requirements: jobData.requirements ?? [],

      salary: typeof jobData.salary === "string"
        ? Number(jobData.salary)
        : jobData.salary ?? 0,

      status: "active",
      totalApplicants: 0,

      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const inserted = await db.insert(jobs).values(newJob).returning();

    return {
      success: true,
      status: 201,
      message: "Job created successfully!",
      data: inserted[0],
    };
  },

  /* =========================
     UPDATE JOB
  ========================= */
  updateJob: async (
    jobId: string,
    recruiterId: string,
    updates: Partial<typeof jobs.$inferInsert>
  ) => {
    const existing = await db
      .select()
      .from(jobs)
      .where(eq(jobs.id, jobId))
      .limit(1);

    const job = existing[0];

    if (!job) {
      return { success: false, error: "Job not found" };
    }

    if (job.recruiterId !== recruiterId) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    const updated = await db
      .update(jobs)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(jobs.id, jobId))
      .returning();

    return {
      success: true,
      message: "Job updated successfully",
      data: updated[0],
    };
  },

  /* =========================
     DELETE JOB
  ========================= */
  deleteJob: async (jobId: string, recruiterId: string) => {
    const existing = await db
      .select()
      .from(jobs)
      .where(eq(jobs.id, jobId))
      .limit(1);

    const job = existing[0];

    if (!job) {
      return { success: false, error: "Job not found" };
    }

    if (job.recruiterId !== recruiterId) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    await db.delete(jobs).where(eq(jobs.id, jobId));

    return {
      success: true,
      message: "Job deleted successfully",
    };
  },
};
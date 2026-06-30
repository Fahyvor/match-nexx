import { db } from "../db/db";
import {
  applicants,
  applications,
  jobs,
} from "../db/schema";
import type { UploadedFile } from "elysia";
import { eq, and, sql } from "drizzle-orm";
import { randomUUID } from "crypto";
import { supabase } from "../config/supabase";

type AuthUser = {
  sub: string;
  email: string;
  role: "applicant" | "recruiter" | "admin";
};

type CompleteProfileBody = {
  headline?: string;
  summary?: string;
  phone?: string;
  location?: string;
  portfolio?: string;
  github?: string;
  linkedin?: string;
};

type UploadCVBody = {
  cv: File;
};

type ApplyParams = {
  jobId: string;
};

type ElysiaSet = {
  status: number;
};

export class ApplicantController {

  completeProfile = async ({
      body,
      user,
      set,
    }: {
      body: CompleteProfileBody;
      user: AuthUser;
      set: ElysiaSet;
    }) => {
    try {

      let applicant = await db.query.applicants.findFirst({
        where: eq(applicants.userId, user.sub),
      });

      if (!applicant) {
        const created = await db.insert(applicants).values({
          userId: user.sub,
        }).returning();

        applicant = created[0];
      }

      const updated = await db.update(applicants)
        .set({
          headline: body.headline,
          summary: body.summary,
          phone: body.phone,
          location: body.location,
          portfolio: body.portfolio,
          github: body.github,
          linkedin: body.linkedin,
          updatedAt: new Date(),
        })
        .where(eq(applicants.userId, user.sub))
        .returning();

      return {
        success: true,
        message: "Profile updated.",
        data: updated[0],
      };

    } catch (e: any) {

      set.status = 500;

      return {
        success: false,
        message: e.message,
      };
    }
  };


  uploadCV = async ({
      body,
      user,
      set,
    }: {
      body: CompleteProfileBody;
      user: AuthUser;
      set: ElysiaSet;
    }) => {

    try {

      const file = body.cv;

      if (!file) {
        set.status = 400;

        return {
          success: false,
          message: "CV is required.",
        };
      }

      let applicant = await db.query.applicants.findFirst({
        where: eq(applicants.userId, user.sub),
      });

      if (!applicant) {

        const created = await db.insert(applicants)
          .values({
            userId: user.sub,
          })
          .returning();

        applicant = created[0];
      }

      const filename = `${user.sub}/${randomUUID()}.pdf`;

      const { error } = await supabase.storage
        .from("cv")
        .upload(filename, file, {
          upsert: true,
          contentType: file.type,
        });

      if (error) throw error;

      const {
        data: { publicUrl },
      } = supabase.storage
        .from("cv")
        .getPublicUrl(filename);

      const updated = await db.update(applicants)
        .set({
          cvUrl: publicUrl,
          updatedAt: new Date(),
        })
        .where(eq(applicants.userId, user.sub))
        .returning();

      return {
        success: true,
        message: "CV uploaded successfully.",
        data: updated[0],
      };

    } catch (e: unknown) {
      set.status = 500;

      const message =
        e instanceof Error ? e.message : "Internal server error";

      return {
        success: false,
        message,
      };
    }

  };


  applyForJob = async ({
      params,
      user,
      set,
    }: {
      params: ApplyParams;
      user: AuthUser;
      set: ElysiaSet;
    }) => {

    try {

      const job = await db.query.jobs.findFirst({
        where: eq(jobs.id, params.jobId),
      });

      if (!job) {

        set.status = 404;

        return {
          success: false,
          message: "Job not found.",
        };
      }

      let applicant = await db.query.applicants.findFirst({
        where: eq(applicants.userId, user.sub),
      });

      if (!applicant) {

        const created = await db.insert(applicants)
          .values({
            userId: user.sub,
          })
          .returning();

        applicant = created[0];
      }

      if (!applicant.cvUrl) {

        set.status = 400;

        return {
          success: false,
          message: "Please upload your CV before applying.",
        };
      }

      const alreadyApplied = await db.query.applications.findFirst({
        where: and(
          eq(applications.jobId, params.jobId),
          eq(applications.applicantId, applicant.id)
        ),
      });

      if (alreadyApplied) {

        set.status = 400;

        return {
          success: false,
          message: "You already applied for this job.",
        };
      }

      const application = await db.insert(applications)
        .values({
          applicantId: applicant.id,
          jobId: params.jobId,
          status: "pending",
        })
        .returning();

      await db.update(jobs)
        .set({
          totalApplicants: sql`${jobs.totalApplicants} + 1`,
        })
        .where(eq(jobs.id, params.jobId));

      return {
        success: true,
        message: "Application submitted successfully.",
        data: application[0],
      };

    } catch (e: unknown) {
      set.status = 500;

      const message =
        e instanceof Error ? e.message : "Internal server error";

      return {
        success: false,
        message,
      };
    }

  };

}
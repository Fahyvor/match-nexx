import { db } from "../db/db";
import {
  applicants,
  applications,
  jobs,
} from "../db/schema";
import type { Context } from "elysia";
import { eq, and, sql } from "drizzle-orm";
import { randomUUID } from "crypto";
import { supabase } from "../config/supabase";
import { extractTextFromFile } from "../utils/fileTextExtractor";
import { AIService } from "../services/AIService";

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
  cv?: File;
};

type ApplyParams = {
  jobId: string;
};

// Derived from Elysia's own Context type so `set` always matches what
// Elysia actually passes in at runtime (status is optional and can be
// either a number or an HTTP status name string).
type ElysiaSet = Context["set"];

export class ApplicantController {

  // --- AI-POWERED PARSE CV METHOD ---
  parseCV = async ({
    body,
    set,
  }: {
    body: { cv: File };
    user: AuthUser;
    set: ElysiaSet;
  }) => {
    try {
      const file = body.cv;

      if (!file) {
        set.status = 400;
        return { success: false, message: "No CV file provided." };
      }

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const rawText = await extractTextFromFile(buffer, file.name || "", file.type || "");

      if (!rawText || rawText.trim().length < 20) {
        set.status = 400;
        return {
          success: false,
          message: "Could not extract readable text from document. Please upload a PDF, Word (DOCX), or text file.",
        };
      }

      const parsed = await AIService.extractCVData(rawText);

      // Support legacy consumer fields (e.g. JobApplication.tsx) while exposing the full parsed data
      const responseData = {
        headline: parsed.personalInfo?.position || "",
        summary: parsed.professionalSummary || "",
        phone: parsed.personalInfo?.phone || "",
        location: parsed.personalInfo?.address || "",
        portfolio: parsed.links?.portfolio || "",
        github: parsed.links?.github || "",
        linkedin: parsed.links?.linkedIn || "",
        ...parsed,
      };

      return {
        success: true,
        message: "CV successfully parsed.",
        data: responseData,
      };
    } catch (e: unknown) {
      set.status = 500;
      const message = e instanceof Error ? e.message : "Internal parsing error";
      return { success: false, message };
    }
  };

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

    } catch (e: unknown) {
      set.status = 500;

      console.log("Error in completeProfile:", e);

      const message =
        e instanceof Error ? e.message : "Internal server error";

      return {
        success: false,
        message,
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

      const { data, error } = await supabase.storage
        .from("cv")
        .upload(filename, file, {
          upsert: true,
          contentType: file.type,
        });

      console.log(data);
      console.error(error);

      // if (error) throw error;

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

  getApplications = async ({
    user,
    set,
  }: {
    user: AuthUser;
    set: ElysiaSet;
  }) => {

    try {

      const applicant = await db.query.applicants.findFirst({
        where: eq(applicants.userId, user.sub),
      });

      if (!applicant) {

        set.status = 404;

        return {
          success: false,
          message: "Applicant profile not found.",
        };
      }

      const applicationsList = await db.query.applications.findMany({
        where: eq(applications.applicantId, applicant.id),
        with: {
          job: true,
        },
      });

      return {
        success: true,
        data: applicationsList,
      };

    } catch (e) {
      console.error("getApplications error:", e);

      set.status = 500;

      return {
        success: false,
        message: e instanceof Error ? e.message : "Internal server error",
      };
    }
  }

}
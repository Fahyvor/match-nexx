import { db } from "../db/db";
import {
  applicants,
  applications,
  jobs,
} from "../db/schema";
import type { UploadedFile, Context } from "elysia";
import { eq, and, sql } from "drizzle-orm";
import { randomUUID } from "crypto";
import { supabase } from "../config/supabase";
import { PDFParse } from "pdf-parse";

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
  cv?: File; // Added to fix type checking
};

type ApplyParams = {
  jobId: string;
};

// Derived from Elysia's own Context type so `set` always matches what
// Elysia actually passes in at runtime (status is optional and can be
// either a number or an HTTP status name string).
type ElysiaSet = Context["set"];

export class ApplicantController {

  // --- NEW PARSE CV METHOD ---
  parseCV = async ({
    body,
    set,
  }: {
    body: { cv: UploadedFile };
    user: AuthUser;
    set: ElysiaSet;
  }) => {
    try {
      const file = body.cv;

      if (!file) {
        set.status = 400;
        return { success: false, message: "No CV file provided." };
      }

      // 1. Read file stream into a buffer
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // 2. Extract raw text from the PDF file
      const parser = new PDFParse({ data: buffer });
      let rawText: string;
      try {
        const pdfData = await parser.getText();
        rawText = pdfData.text;
      } finally {
        await parser.destroy();
      }

      // 3. Clean and parse details using Regular Expressions (Regex)
      // Note: For 100% accurate results, you could feed rawText into an LLM API here.
      const phoneRegex = /(?:\+?\d{1,3}[- ]?)?\(?\d{3}\)?[- ]?\d{3}[- ]?\d{4,6}/g;
      const linkedinRegex = /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/[A-Za-z0-9_-]+/i;
      const githubRegex = /(?:https?:\/\/)?(?:www\.)?github\.com\/[A-Za-z0-9_-]+/i;

      const phoneMatches = rawText.match(phoneRegex);
      const linkedinMatches = rawText.match(linkedinRegex);
      const githubMatches = rawText.match(githubRegex);

      // Simple structural fallback strategies for headline & summary
      const cleanLines = rawText.split("\n").map(l => l.trim()).filter(Boolean);
      const headline = cleanLines[0] ? `${cleanLines[0]} Professional` : "";
      const summary = cleanLines.slice(1, 4).join(" ");

      const extractedProfile = {
        headline: headline.slice(0, 50),
        summary: summary.slice(0, 200),
        phone: phoneMatches ? phoneMatches[0] : "",
        location: "", // Can be filled out manually by user
        portfolio: "",
        github: githubMatches ? githubMatches[0] : "",
        linkedin: linkedinMatches ? linkedinMatches[0] : "",
      };

      return {
        success: true,
        message: "CV successfully parsed.",
        data: extractedProfile,
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
import { db } from '../db/db';
import {
  applicants,
  applications,
  experiences,
  educations,
  jobs,
  users,
} from '../db/schema';
import { eq, and } from 'drizzle-orm';
import type {
  CreateApplicantInput,
  UpdateApplicantInput,
  CreateExperienceInput,
  CreateEducationInput,
} from '../models/Applicant';

export const applicantController = {

  // ─── PROFILE ────────────────────────────────────────────────────────────────
  getProfile: async (userId: string) => {
    const [applicant] = await db
      .select()
      .from(applicants)
      .where(eq(applicants.userId, userId))
      .limit(1);

    if (!applicant) {
      return { success: false, error: 'Applicant profile not found' };
    }

    return { success: true, data: applicant };
  },

  createProfile: async (userId: string, data: CreateApplicantInput) => {
    const [existing] = await db
      .select()
      .from(applicants)
      .where(eq(applicants.userId, userId))
      .limit(1);

    if (existing) {
      return {
        success: false,
        message: 'Profile already exists',
        error: 'Applicant already has a profile',
      };
    }

    const [created] = await db
      .insert(applicants)
      .values({
        userId,
        headline: data.headline,
        // summary: data.summary,
      })
      .returning();

    return {
      success: true,
      message: 'Profile created successfully',
      data: created,
    };
  },

  updateProfile: async (userId: string, updates: UpdateApplicantInput) => {
    const [applicant] = await db
      .select()
      .from(applicants)
      .where(eq(applicants.userId, userId))
      .limit(1);

    if (!applicant) {
      return {
        success: false,
        message: 'Profile not found',
        error: 'Applicant profile does not exist',
      };
    }

    const [updated] = await db
      .update(applicants)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(applicants.id, applicant.id))
      .returning();

    return {
      success: true,
      message: 'Profile updated successfully',
      data: updated,
    };
  },

  // ─── APPLICATIONS ────────────────────────────────────────────────────────────

  getApplications: async (userId: string) => {
    const [applicant] = await db
      .select()
      .from(applicants)
      .where(eq(applicants.userId, userId))
      .limit(1);

    if (!applicant) {
      return { success: true, data: [] };
    }

    const rows = await db
      .select({
        id: applications.id,
        jobId: applications.jobId,
        status: applications.status,
        createdAt: applications.createdAt,
        updatedAt: applications.updatedAt,
        jobTitle: jobs.title,
        company: jobs.location,
      })
      .from(applications)
      .leftJoin(jobs, eq(applications.jobId, jobs.id))
      .where(eq(applications.applicantId, applicant.id));

    return { success: true, data: rows };
  },

  applyForJob: async (userId: string, jobId: string) => {
    const [applicant] = await db
      .select()
      .from(applicants)
      .where(eq(applicants.userId, userId))
      .limit(1);

    if (!applicant) {
      return {
        success: false,
        message: 'Profile required',
        error: 'Create an applicant profile first',
      };
    }

    const [job] = await db
      .select()
      .from(jobs)
      .where(eq(jobs.id, jobId))
      .limit(1);

    if (!job) {
      return { success: false, message: 'Job not found', error: 'Job does not exist' };
    }

    const [alreadyApplied] = await db
      .select()
      .from(applications)
      .where(
        and(
          eq(applications.applicantId, applicant.id),
          eq(applications.jobId, jobId)
        )
      )
      .limit(1);

    if (alreadyApplied) {
      return {
        success: false,
        message: 'Already applied',
        error: 'You have already applied for this job',
      };
    }

    const [created] = await db
      .insert(applications)
      .values({
        applicantId: applicant.id,
        jobId,
        status: 'pending',
      })
      .returning();

    return {
      success: true,
      message: 'Application submitted successfully',
      data: created,
    };
  },

  withdrawApplication: async (userId: string, applicationId: string) => {
    const [applicant] = await db
      .select()
      .from(applicants)
      .where(eq(applicants.userId, userId))
      .limit(1);

    if (!applicant) {
      return {
        success: false,
        message: 'Profile not found',
        error: 'Applicant profile does not exist',
      };
    }

    const [application] = await db
      .select()
      .from(applications)
      .where(
        and(
          eq(applications.id, applicationId),
          eq(applications.applicantId, applicant.id)
        )
      )
      .limit(1);

    if (!application) {
      return {
        success: false,
        message: 'Application not found',
        error: 'Application does not exist or does not belong to you',
      };
    }

    await db
      .update(applications)
      .set({ status: 'withdrawn', updatedAt: new Date() })
      .where(eq(applications.id, applicationId));

    return { success: true, message: 'Application withdrawn successfully' };
  },

  // ─── EXPERIENCE ──────────────────────────────────────────────────────────────

  addExperience: async (userId: string, data: CreateExperienceInput) => {
    const [applicant] = await db
      .select()
      .from(applicants)
      .where(eq(applicants.userId, userId))
      .limit(1);

    if (!applicant) {
      return {
        success: false,
        message: 'Profile not found',
        error: 'Applicant profile does not exist',
      };
    }

    const [created] = await db
      .insert(experiences)
      .values({
        applicantId: users.id,
        company: data.company,
        role: data.role,
        startDate: data.startDate,
        endDate: data.endDate,
        description: data.description,
      })
      .returning();

    return {
      success: true,
      message: 'Experience added successfully',
      data: created,
    };
  },

  updateExperience: async (
    userId: string,
    experienceId: string,
    updates: Partial<CreateExperienceInput>
  ) => {
    const [applicant] = await db
      .select()
      .from(applicants)
      .where(eq(applicants.userId, userId))
      .limit(1);

    if (!applicant) {
      return {
        success: false,
        message: 'Profile not found',
        error: 'Applicant profile does not exist',
      };
    }

    const [experience] = await db
      .select()
      .from(experiences)
      .where(
        and(
          eq(experiences.id, experienceId),
          eq(experiences.applicantId, applicant.id)
        )
      )
      .limit(1);

    if (!experience) {
      return {
        success: false,
        message: 'Experience not found',
        error: 'Experience does not exist or does not belong to you',
      };
    }

    const [updated] = await db
      .update(experiences)
      .set(updates)
      .where(eq(experiences.id, experienceId))
      .returning();

    return {
      success: true,
      message: 'Experience updated successfully',
      data: updated,
    };
  },

  deleteExperience: async (userId: string, experienceId: string) => {
    const [applicant] = await db
      .select()
      .from(applicants)
      .where(eq(applicants.userId, userId))
      .limit(1);

    if (!applicant) {
      return {
        success: false,
        message: 'Profile not found',
        error: 'Applicant profile does not exist',
      };
    }

    const [experience] = await db
      .select()
      .from(experiences)
      .where(
        and(
          eq(experiences.id, experienceId),
          eq(experiences.applicantId, applicant.id)
        )
      )
      .limit(1);

    if (!experience) {
      return {
        success: false,
        message: 'Experience not found',
        error: 'Experience does not exist or does not belong to you',
      };
    }

    await db.delete(experiences).where(eq(experiences.id, experienceId));

    return { success: true, message: 'Experience deleted successfully' };
  },

  // ─── EDUCATION ───────────────────────────────────────────────────────────────

  addEducation: async (userId: string, data: CreateEducationInput) => {
    const [applicant] = await db
      .select()
      .from(applicants)
      .where(eq(applicants.userId, userId))
      .limit(1);

    if (!applicant) {
      return {
        success: false,
        message: 'Profile not found',
        error: 'Applicant profile does not exist',
      };
    }

    const [created] = await db
      .insert(educations)
      .values({
        applicantId: applicant.id,
        school: data.school,
        degree: data.degree,
        field: data.field,
        // startYear: data.startYear,
        // endYear: data.endYear,
      })
      .returning();

    return {
      success: true,
      message: 'Education added successfully',
      data: created,
    };
  },

  updateEducation: async (
    userId: string,
    educationId: string,
    updates: Partial<CreateEducationInput>
  ) => {
    const [applicant] = await db
      .select()
      .from(applicants)
      .where(eq(applicants.userId, userId))
      .limit(1);

    if (!applicant) {
      return {
        success: false,
        message: 'Profile not found',
        error: 'Applicant profile does not exist',
      };
    }

    const [education] = await db
      .select()
      .from(educations)
      .where(
        and(
          eq(educations.id, educationId),
          eq(educations.applicantId, applicant.id)
        )
      )
      .limit(1);

    if (!education) {
      return {
        success: false,
        message: 'Education not found',
        error: 'Education does not exist or does not belong to you',
      };
    }

    const [updated] = await db
      .update(educations)
      .set(updates)
      .where(eq(educations.id, educationId))
      .returning();

    return {
      success: true,
      message: 'Education updated successfully',
      data: updated,
    };
  },

  deleteEducation: async (userId: string, educationId: string) => {
    const [applicant] = await db
      .select()
      .from(applicants)
      .where(eq(applicants.userId, userId))
      .limit(1);

    if (!applicant) {
      return {
        success: false,
        message: 'Profile not found',
        error: 'Applicant profile does not exist',
      };
    }

    const [education] = await db
      .select()
      .from(educations)
      .where(
        and(
          eq(educations.id, educationId),
          eq(educations.applicantId, applicant.id)
        )
      )
      .limit(1);

    if (!education) {
      return {
        success: false,
        message: 'Education not found',
        error: 'Education does not exist or does not belong to you',
      };
    }

    await db.delete(educations).where(eq(educations.id, educationId));

    return { success: true, message: 'Education deleted successfully' };
  },
};
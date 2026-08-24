import { db } from "../db/db";
import { applicants, experiences, educations, skills, projects, cvs, users } from "../db/schema";
import { eq } from "drizzle-orm";
import { AIService } from "../services/AIService";

interface ExperienceInput {
  company: string;
  role: string;
  startDate?: string;
  endDate?: string;
  isCurrent?: boolean;
  description?: string;
}

interface EducationInput {
  institution: string;
  degree?: string;
  department?: string;
  startDate?: string;
  endDate?: string;
}

interface ProjectInput {
  name: string;
  description?: string;
  technologies?: string[];
  link?: string;
}

interface LinksInput {
  portfolio?: string;
  linkedIn?: string;
  github?: string;
  twitter?: string;
  facebook?: string;
}

interface PersonalInfoInput {
  phone: string;
  position?: string;
  firstName?: string;
  lastName?: string;
  address?: string;
}

export interface ReferenceEntry {
  name: string;
  position?: string;
  company?: string;
  email?: string;
  phone?: string;
  relationship?: string;
}

interface CreateCVBody {
  personalInfo: PersonalInfoInput;
  skills: string[];
  educations?: EducationInput[];
  experiences?: ExperienceInput[];
  projects?: ProjectInput[];
  references?: ReferenceEntry[];
  links?: LinksInput;
  professionalSummary?: string;
}

export const cvController = {
  create: async (userId: string, body: CreateCVBody) => {
    try {
      const {
        personalInfo,
        skills: skillNames,
        educations: educationInput,
        experiences: experienceInput,
        projects: projectInput,
        references: referenceInput,
        links,
        professionalSummary: customSummary,
      } = body;

      if (!personalInfo || !personalInfo.phone) {
        return { success: false, message: "Phone number is required." };
      }

      if (!skillNames || !Array.isArray(skillNames) || skillNames.length === 0) {
        return { success: false, message: "At least one skill is required." };
      }

      let applicant = await db.query.applicants.findFirst({
        where: eq(applicants.userId, userId),
      });

      if (!applicant) {
        const created = await db
          .insert(applicants)
          .values({
            userId: userId,
          })
          .returning();
        applicant = created[0];
      }

      if (applicant.hasPaidCv !== true) {
        return {
          success: false,
          code: "CV_PAYMENT_REQUIRED",
          message: "Payment of ₦2,000 is required before creating your CV.",
        };
      }

      const existingCv = await db.query.cvs.findFirst({
        where: eq(cvs.applicantId, applicant.id),
      });

      const user = await db.query.users.findFirst({ where: eq(users.id, userId) });
      if (!user) {
        return { success: false, message: "User not found." };
      }

      if (personalInfo.firstName || personalInfo.lastName || personalInfo.address) {
        const userUpdates: Record<string, unknown> = {};
        if (personalInfo.firstName) userUpdates.firstName = personalInfo.firstName;
        if (personalInfo.lastName) userUpdates.lastName = personalInfo.lastName;
        if (personalInfo.address) {
          const parts = personalInfo.address.split(",").map((s) => s.trim());
          if (parts.length >= 2) {
            userUpdates.state = parts[0];
            userUpdates.country = parts[1];
          } else if (parts.length === 1 && parts[0]) {
            userUpdates.state = parts[0];
          }
        }
        await db.update(users).set(userUpdates).where(eq(users.id, userId));
      }

      await db
        .update(applicants)
        .set({
          phone: personalInfo.phone,
          headline: personalInfo.position || applicant.headline,
          location: personalInfo.address || applicant.location,
          portfolio: links?.portfolio || applicant.portfolio,
          github: links?.github || applicant.github,
          linkedin: links?.linkedIn || applicant.linkedin,
          twitter: links?.twitter || applicant.twitter,
          facebook: links?.facebook || applicant.facebook,
          updatedAt: new Date(),
        })
        .where(eq(applicants.id, applicant.id));

      // Replace experiences
      if (Array.isArray(experienceInput)) {
        await db.delete(experiences).where(eq(experiences.applicantId, applicant.id));
        if (experienceInput.length > 0) {
          await db.insert(experiences).values(
            experienceInput.map((exp) => ({
              applicantId: applicant.id,
              company: exp.company,
              role: exp.role,
              startDate: exp.startDate,
              endDate: exp.isCurrent ? undefined : exp.endDate,
              description: exp.description || "",
            }))
          );
        }
      }

      if (Array.isArray(educationInput)) {
        await db.delete(educations).where(eq(educations.applicantId, applicant.id));
        if (educationInput.length > 0) {
          await db.insert(educations).values(
            educationInput.map((edu) => ({
              applicantId: applicant.id,
              school: edu.institution,
              degree: edu.degree,
              field: edu.department,
              startYear: edu.startDate,
              endYear: edu.endDate,
            }))
          );
        }
      }

      await db.delete(skills).where(eq(skills.applicantId, applicant.id));
      if (skillNames.length > 0) {
        await db.insert(skills).values(
          skillNames.map((name) => ({ applicantId: applicant.id, name }))
        );
      }

      if (Array.isArray(projectInput)) {
        await db.delete(projects).where(eq(projects.applicantId, applicant.id));
        if (projectInput.length > 0) {
          await db.insert(projects).values(
            projectInput.map((proj) => ({
              applicantId: applicant.id,
              name: proj.name,
              description: proj.description || "",
              technologies: proj.technologies || [],
              link: proj.link || "",
            }))
          );
        }
      }

      let professionalSummary = customSummary;
      if (!professionalSummary) {
        const updatedUser = await db.query.users.findFirst({ where: eq(users.id, userId) });
        const fullName = updatedUser ? `${updatedUser.firstName} ${updatedUser.lastName}`.trim() : `${user.firstName} ${user.lastName}`.trim();
        professionalSummary = await AIService.generateProfessionalSummary({
          fullName,
          experience: experienceInput || [],
          skills: skillNames,
          education: educationInput || [],
          role: personalInfo.position,
        });
      }

      const referencesData = Array.isArray(referenceInput) ? referenceInput : [];

      if (existingCv) {
        await db
          .update(cvs)
          .set({
            professionalSummary,
            references: referencesData,
            updatedAt: new Date(),
          })
          .where(eq(cvs.id, existingCv.id));
      } else {
        await db.insert(cvs).values({
          applicantId: applicant.id,
          professionalSummary,
          references: referencesData,
        });
      }

      const fullCv = await db.query.applicants.findFirst({
        where: eq(applicants.id, applicant.id),
        with: {
          user: true,
          experiences: true,
          educations: true,
          skills: true,
          projects: true,
          cv: true,
        },
      });

      return {
        success: true,
        message: existingCv ? "CV updated successfully" : "CV created successfully",
        data: fullCv,
      };
    } catch (e) {
      console.error("cvController.create error:", e);
      return {
        success: false,
        message: e instanceof Error ? e.message : "Internal server error",
      };
    }
  },

  getByUserId: async (userId: string) => {
    try {
      let applicant = await db.query.applicants.findFirst({
        where: eq(applicants.userId, userId),
        with: {
          user: true,
          experiences: true,
          educations: true,
          skills: true,
          projects: true,
          cv: true,
        },
      });

      if (!applicant) {
        const user = await db.query.users.findFirst({ where: eq(users.id, userId) });
        if (!user) {
          return { success: false, message: "Applicant profile not found." };
        }
        const created = await db.insert(applicants).values({ userId }).returning();
        applicant = {
          ...created[0],
          user,
          experiences: [],
          educations: [],
          skills: [],
          projects: [],
          cv: null,
        } as unknown as typeof applicant;
      }

      return { success: true, data: applicant };
    } catch (e) {
      console.error("cvController.getByUserId error:", e);
      return {
        success: false,
        message: e instanceof Error ? e.message : "Internal server error",
      };
    }
  },

  generateSummary: async (userId: string, body: CreateCVBody) => {
    try {
      const applicant = await db.query.applicants.findFirst({
        where: eq(applicants.userId, userId),
      });

      if (!applicant || applicant.hasPaidCv !== true) {
        return {
          success: false,
          code: "CV_PAYMENT_REQUIRED",
          message: "Payment of ₦2,000 is required before generating your CV summary.",
        };
      }

      const { personalInfo, skills: skillNames, educations: educationInput, experiences: experienceInput } = body;
      const user = await db.query.users.findFirst({ where: eq(users.id, userId) });
      const fullName = user ? `${user.firstName} ${user.lastName}`.trim() : "Candidate";

      const summary = await AIService.generateProfessionalSummary({
        fullName,
        experience: experienceInput || [],
        skills: skillNames || [],
        education: educationInput || [],
        role: personalInfo?.position,
      });

      return { success: true, summary };
    } catch (e) {
      console.error("cvController.generateSummary error:", e);
      return {
        success: false,
        message: e instanceof Error ? e.message : "Failed to generate summary",
      };
    }
  },
};
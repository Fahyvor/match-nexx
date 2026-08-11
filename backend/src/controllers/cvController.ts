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
  position?: string; // maps to applicants.headline
}

interface CreateCVBody {
  personalInfo: PersonalInfoInput;
  skills: string[];
  educations?: EducationInput[];
  experiences?: ExperienceInput[];
  projects?: ProjectInput[];
  links?: LinksInput;
  professionalSummary?: string;
}

export const cvController = {
  create: async (userId: string, body: CreateCVBody) => {
    try {
      const { personalInfo, skills: skillNames, educations: educationInput, experiences: experienceInput, projects: projectInput, links, professionalSummary: customSummary } = body;

      if (!personalInfo || !personalInfo.phone) {
        return { success: false, message: "Phone number is required." };
      }

      if (!skillNames || !Array.isArray(skillNames) || skillNames.length === 0) {
        return { success: false, message: "At least one skill is required." };
      }

      const applicant = await db.query.applicants.findFirst({
        where: eq(applicants.userId, userId),
      });

      if (!applicant) {
        return { success: false, message: "Applicant profile not found." };
      }

      const existingCv = await db.query.cvs.findFirst({
        where: eq(cvs.applicantId, applicant.id),
      });

      const user = await db.query.users.findFirst({ where: eq(users.id, userId) });
      if (!user) {
        return { success: false, message: "User not found." };
      }

      // Update applicant profile fields with any new info from the form
      await db
        .update(applicants)
        .set({
          phone: personalInfo.phone,
          headline: personalInfo.position || applicant.headline,
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

      // Replace educations
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

      // Replace skills
      await db.delete(skills).where(eq(skills.applicantId, applicant.id));
      if (skillNames.length > 0) {
        await db.insert(skills).values(
          skillNames.map((name) => ({ applicantId: applicant.id, name }))
        );
      }

      // Replace projects
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

      // Generate or use custom professional summary
      let professionalSummary = customSummary;
      if (!professionalSummary) {
        const fullName = `${user.firstName} ${user.lastName}`.trim();
        professionalSummary = await AIService.generateProfessionalSummary({
          fullName,
          experience: experienceInput || [],
          skills: skillNames,
          education: educationInput || [],
          role: personalInfo.position,
        });
      }

      if (existingCv) {
        await db
          .update(cvs)
          .set({
            professionalSummary,
            updatedAt: new Date(),
          })
          .where(eq(cvs.id, existingCv.id));
      } else {
        await db.insert(cvs).values({
          applicantId: applicant.id,
          professionalSummary,
        });
      }

      // Return the full assembled CV
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

      return { success: true, message: existingCv ? "CV updated successfully" : "CV created successfully", data: fullCv };
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
      const applicant = await db.query.applicants.findFirst({
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
        return { success: false, message: "Applicant profile not found." };
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
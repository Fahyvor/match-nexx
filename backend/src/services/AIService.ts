import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

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

interface GenerateSummaryInput {
  fullName: string;
  experience: ExperienceInput[];
  skills: string[];
  education: EducationInput[];
  role?: string;
}

export interface ParsedCVData {
  personalInfo: {
    phone: string;
    position: string;
  };
  links: {
    portfolio: string;
    linkedIn: string;
    github: string;
    twitter: string;
    facebook: string;
  };
  experiences: {
    company: string;
    role: string;
    startDate: string;
    endDate: string;
    isCurrent: boolean;
    description: string;
  }[];
  educations: {
    institution: string;
    degree: string;
    department: string;
    startDate: string;
    endDate: string;
  }[];
  projects: {
    name: string;
    description: string;
    technologies: string[];
    link: string;
  }[];
  skills: string[];
}

export const AIService = {
  generateProfessionalSummary: async ({
    fullName,
    experience,
    skills,
    education,
    role,
  }: GenerateSummaryInput): Promise<string> => {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const experienceText = experience.length
        ? experience
            .map(
              (exp) =>
                `${exp.role} at ${exp.company} (${exp.startDate || "N/A"} - ${
                  exp.isCurrent ? "Present" : exp.endDate || "N/A"
                })${exp.description ? `: ${exp.description}` : ""}`
            )
            .join("\n")
        : "No work experience listed.";

      const educationText = education.length
        ? education
            .map(
              (edu) =>
                `${edu.degree || ""} ${edu.department ? `in ${edu.department}` : ""} at ${
                  edu.institution
                } (${edu.startDate || "N/A"} - ${edu.endDate || "N/A"})`.trim()
            )
            .join("\n")
        : "No education listed.";

      const prompt = `
          You are a professional CV writer. Write a concise, compelling professional summary (3-4 sentences, no more than 80 words)
          for a CV based on the details below. Write in third person is not needed — write it as if it will appear directly on the
          candidate's CV (first-person implied, no "I" statements, resume style). Do not use markdown formatting, headers, or bullet
          points. Return only the summary text, nothing else.

          Name: ${fullName}
          Target Role: ${role || "Not specified"}

          Skills: ${skills.join(", ")}

          Experience:
          ${experienceText}

          Education:
          ${educationText}
                `.trim();

      const result = await model.generateContent(prompt);
      const summary = result.response.text().trim();

      if (!summary) {
        throw new Error("AI returned an empty summary");
      }

      return summary;
    } catch (e) {
      console.error("AIService.generateProfessionalSummary error:", e);

      // Fallback so CV creation never fails just because the AI call failed
      const topSkills = skills.slice(0, 3).join(", ");
      const latestRole = experience[0]?.role;
      const latestCompany = experience[0]?.company;

      if (latestRole && latestCompany) {
        return `${role || latestRole} with hands-on experience at ${latestCompany}. Skilled in ${topSkills}. Committed to delivering high-quality results and continuously growing professionally.`;
      }

      return `${role || "Motivated professional"} skilled in ${topSkills || "a range of technical and soft skills"}. Eager to contribute and grow within a dynamic team.`;
    }
  },

  extractCVData: async (rawText: string): Promise<ParsedCVData> => {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
You are a CV parser. Extract structured data from the raw CV text below and return ONLY valid JSON matching this exact shape — no markdown, no code fences, no explanation, just the JSON object:

{
  "personalInfo": { "phone": "", "position": "" },
  "links": { "portfolio": "", "linkedIn": "", "github": "", "twitter": "", "facebook": "" },
  "experiences": [
    { "company": "", "role": "", "startDate": "", "endDate": "", "isCurrent": false, "description": "" }
  ],
  "educations": [
    { "institution": "", "degree": "", "department": "", "startDate": "", "endDate": "" }
  ],
  "projects": [
    { "name": "", "description": "", "technologies": [], "link": "" }
  ],
  "skills": []
}

Rules:
- If a field cannot be found, leave it as an empty string, empty array, or false.
- "position" should be the candidate's most recent or primary job title.
- Dates should stay in whatever format they appear in the source text.
- "isCurrent" should be true only if the role explicitly says "Present", "Current", or similar.
- Do not invent information that isn't present in the text.

CV TEXT:
"""
${rawText}
"""
    `.trim();

    const result = await model.generateContent(prompt);
    let text = result.response.text().trim();

    // Strip markdown code fences if the model adds them despite instructions
    text = text.replace(/^```json\s*/i, "").replace(/```$/, "").trim();

    try {
      return JSON.parse(text) as ParsedCVData;
    } catch (e) {
      console.error("Failed to parse AI CV extraction response:", text);
      console.log(e)
      throw new Error("Could not parse CV. Please try again or fill the form manually.");
    }
  },
};
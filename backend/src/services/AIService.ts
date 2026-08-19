import axios from "axios";

const DEEPSEEK_API_URL = "https://api.deepseek.com/chat/completions";

const deepseek = axios.create({
  baseURL: DEEPSEEK_API_URL,
  headers: {
    Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
    "Content-Type": "application/json",
  },
  timeout: 60000,
});

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


/**
 * DeepSeek helper
 */
const callDeepSeek = async (
  prompt: string,
  options?: {
    temperature?: number;
    maxTokens?: number;
    jsonMode?: boolean;
  }
): Promise<string> => {
  if (!process.env.DEEPSEEK_API_KEY) {
    throw new Error("DEEPSEEK_API_KEY is not configured");
  }

  const response = await deepseek.post("", {
    model: "deepseek-chat",

    messages: [
      {
        role: "system",
        content:
          "You are an expert professional CV writer and CV parser. Follow the user's instructions exactly.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],

    temperature: options?.temperature ?? 0.3,

    max_tokens: options?.maxTokens ?? 1000,

    ...(options?.jsonMode
      ? {
          response_format: {
            type: "json_object",
          },
        }
      : {}),
  });

  const content =
    response.data?.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error("DeepSeek returned an empty response");
  }

  return content.trim();
};


export const AIService = {

  /**
   * Generate professional CV summary
   */
  generateProfessionalSummary: async ({
    fullName,
    experience,
    skills,
    education,
    role,
  }: GenerateSummaryInput): Promise<string> => {
    try {
      const experienceText = experience.length
        ? experience
            .map(
              (exp) =>
                `${exp.role} at ${exp.company} (${
                  exp.startDate || "N/A"
                } - ${
                  exp.isCurrent
                    ? "Present"
                    : exp.endDate || "N/A"
                })${
                  exp.description
                    ? `: ${exp.description}`
                    : ""
                }`
            )
            .join("\n")
        : "No work experience listed.";

      const educationText = education.length
        ? education
            .map(
              (edu) =>
                `${edu.degree || ""} ${
                  edu.department
                    ? `in ${edu.department}`
                    : ""
                } at ${
                  edu.institution
                } (${
                  edu.startDate || "N/A"
                } - ${
                  edu.endDate || "N/A"
                })`.trim()
            )
            .join("\n")
        : "No education listed.";

      const prompt = `
Write a professional CV summary for this candidate.

Requirements:
- 3 to 4 sentences.
- Maximum 80 words.
- Professional and ATS-friendly.
- Write in resume style.
- Do not use "I", "we", or "my".
- Do not use markdown.
- Do not use headings.
- Do not use bullet points.
- Do not invent experience, skills, qualifications, or achievements.
- Focus on the candidate's strongest relevant experience and skills.
- Return ONLY the summary text.

Candidate:
Name: ${fullName}

Target Role:
${role || "Not specified"}

Skills:
${skills.length ? skills.join(", ") : "None listed"}

Experience:
${experienceText}

Education:
${educationText}
      `.trim();

      const summary = await callDeepSeek(prompt, {
        temperature: 0.4,
        maxTokens: 250,
      });

      if (!summary) {
        throw new Error(
          "DeepSeek returned an empty summary"
        );
      }

      return summary;

    } catch (e) {
      console.error(
        "AIService.generateProfessionalSummary error:",
        e
      );

      /**
       * Fallback
       * 
       * The CV should still be generated if
       * DeepSeek is unavailable.
       */
      const topSkills = skills
        .slice(0, 3)
        .filter(Boolean)
        .join(", ");

      const latestRole = experience[0]?.role;
      const latestCompany = experience[0]?.company;

      if (latestRole && latestCompany) {
        return `${
          role || latestRole
        } with hands-on experience at ${latestCompany}. Skilled in ${
          topSkills || "relevant professional skills"
        }. Committed to delivering high-quality results and continuously developing professionally.`;
      }

      return `${
        role || "Motivated professional"
      } skilled in ${
        topSkills ||
        "a range of technical and professional skills"
      }. Eager to contribute effectively and grow within a dynamic organization.`;
    }
  },


  /**
   * Extract structured information from CV text
   */
  extractCVData: async (
    rawText: string
  ): Promise<ParsedCVData> => {
    try {

      if (!rawText?.trim()) {
        throw new Error(
          "CV text is empty"
        );
      }

      const prompt = `
Extract structured information from the CV text below.

Return ONLY valid JSON matching EXACTLY this structure:

{
  "personalInfo": {
    "phone": "",
    "position": ""
  },

  "links": {
    "portfolio": "",
    "linkedIn": "",
    "github": "",
    "twitter": "",
    "facebook": ""
  },

  "experiences": [
    {
      "company": "",
      "role": "",
      "startDate": "",
      "endDate": "",
      "isCurrent": false,
      "description": ""
    }
  ],

  "educations": [
    {
      "institution": "",
      "degree": "",
      "department": "",
      "startDate": "",
      "endDate": ""
    }
  ],

  "projects": [
    {
      "name": "",
      "description": "",
      "technologies": [],
      "link": ""
    }
  ],

  "skills": []
}

STRICT RULES:

1. Do not invent information.

2. If a field cannot be found, use:
   - "" for strings
   - [] for arrays
   - false for booleans

3. "position" should contain the candidate's most recent or primary professional job title.

4. Preserve dates in the format they appear in the CV.

5. "isCurrent" must only be true when the CV explicitly indicates:
   - Present
   - Current
   - Currently
   - or an equivalent expression.

6. Extract all relevant work experiences.

7. Extract all relevant education entries.

8. Extract projects when they are explicitly listed.

9. Extract technologies associated with each project.

10. Extract professional skills.

11. Extract URLs exactly when possible.

12. Do not add explanations outside the JSON.

13. Do not wrap the JSON in markdown code fences.

CV TEXT:

"""
${rawText}
"""
      `.trim();

      const text = await callDeepSeek(prompt, {
        temperature: 0,
        maxTokens: 4000,
        jsonMode: true,
      });

      /**
       * DeepSeek should already return JSON because
       * response_format = json_object is enabled.
       *
       * Still remove accidental code fences just in case.
       */
      let cleanedText = text
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/```$/i, "")
        .trim();

      let parsed: ParsedCVData;

      try {
        parsed = JSON.parse(
          cleanedText
        ) as ParsedCVData;
      } catch (parseError) {
        console.error(
          "Failed to parse DeepSeek CV response:"
        );

        console.error(
          cleanedText
        );

        console.error(
          parseError
        );

        throw new Error(
          "Could not parse CV. Please try again or fill the form manually."
        );
      }

      /**
       * Basic structure validation
       */
      if (
        !parsed ||
        typeof parsed !== "object"
      ) {
        throw new Error(
          "DeepSeek returned invalid CV data"
        );
      }

      /**
       * Ensure all expected properties exist.
       */
      parsed.personalInfo ??= {
        phone: "",
        position: "",
      };

      parsed.links ??= {
        portfolio: "",
        linkedIn: "",
        github: "",
        twitter: "",
        facebook: "",
      };

      parsed.experiences ??= [];
      parsed.educations ??= [];
      parsed.projects ??= [];
      parsed.skills ??= [];

      return parsed;

    } catch (e) {
      console.error(
        "AIService.extractCVData error:",
        e
      );

      if (
        e instanceof Error &&
        e.message.includes(
          "Could not parse CV"
        )
      ) {
        throw e;
      }

      throw new Error(
        "Could not process CV. Please try again or fill the form manually."
      );
    }
  },
};

// import { GoogleGenerativeAI } from "@google/generative-ai";

// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// interface ExperienceInput {
//   company: string;
//   role: string;
//   startDate?: string;
//   endDate?: string;
//   isCurrent?: boolean;
//   description?: string;
// }

// interface EducationInput {
//   institution: string;
//   degree?: string;
//   department?: string;
//   startDate?: string;
//   endDate?: string;
// }

// interface GenerateSummaryInput {
//   fullName: string;
//   experience: ExperienceInput[];
//   skills: string[];
//   education: EducationInput[];
//   role?: string;
// }

// export interface ParsedCVData {
//   personalInfo: {
//     phone: string;
//     position: string;
//   };
//   links: {
//     portfolio: string;
//     linkedIn: string;
//     github: string;
//     twitter: string;
//     facebook: string;
//   };
//   experiences: {
//     company: string;
//     role: string;
//     startDate: string;
//     endDate: string;
//     isCurrent: boolean;
//     description: string;
//   }[];
//   educations: {
//     institution: string;
//     degree: string;
//     department: string;
//     startDate: string;
//     endDate: string;
//   }[];
//   projects: {
//     name: string;
//     description: string;
//     technologies: string[];
//     link: string;
//   }[];
//   skills: string[];
// }

// export const AIService = {
//   generateProfessionalSummary: async ({
//     fullName,
//     experience,
//     skills,
//     education,
//     role,
//   }: GenerateSummaryInput): Promise<string> => {
//     try {
//       const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

//       const experienceText = experience.length
//         ? experience
//             .map(
//               (exp) =>
//                 `${exp.role} at ${exp.company} (${exp.startDate || "N/A"} - ${
//                   exp.isCurrent ? "Present" : exp.endDate || "N/A"
//                 })${exp.description ? `: ${exp.description}` : ""}`
//             )
//             .join("\n")
//         : "No work experience listed.";

//       const educationText = education.length
//         ? education
//             .map(
//               (edu) =>
//                 `${edu.degree || ""} ${edu.department ? `in ${edu.department}` : ""} at ${
//                   edu.institution
//                 } (${edu.startDate || "N/A"} - ${edu.endDate || "N/A"})`.trim()
//             )
//             .join("\n")
//         : "No education listed.";

//       const prompt = `
//           You are a professional CV writer. Write a concise, compelling professional summary (3-4 sentences, no more than 80 words)
//           for a CV based on the details below. Write in third person is not needed — write it as if it will appear directly on the
//           candidate's CV (first-person implied, no "I" statements, resume style). Do not use markdown formatting, headers, or bullet
//           points. Return only the summary text, nothing else.

//           Name: ${fullName}
//           Target Role: ${role || "Not specified"}

//           Skills: ${skills.join(", ")}

//           Experience:
//           ${experienceText}

//           Education:
//           ${educationText}
//                 `.trim();

//       const result = await model.generateContent(prompt);
//       const summary = result.response.text().trim();

//       if (!summary) {
//         throw new Error("AI returned an empty summary");
//       }

//       return summary;
//     } catch (e) {
//       console.error("AIService.generateProfessionalSummary error:", e);

//       // Fallback so CV creation never fails just because the AI call failed
//       const topSkills = skills.slice(0, 3).join(", ");
//       const latestRole = experience[0]?.role;
//       const latestCompany = experience[0]?.company;

//       if (latestRole && latestCompany) {
//         return `${role || latestRole} with hands-on experience at ${latestCompany}. Skilled in ${topSkills}. Committed to delivering high-quality results and continuously growing professionally.`;
//       }

//       return `${role || "Motivated professional"} skilled in ${topSkills || "a range of technical and soft skills"}. Eager to contribute and grow within a dynamic team.`;
//     }
//   },

//   extractCVData: async (rawText: string): Promise<ParsedCVData> => {
//     const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

//     const prompt = `
// You are a CV parser. Extract structured data from the raw CV text below and return ONLY valid JSON matching this exact shape — no markdown, no code fences, no explanation, just the JSON object:

// {
//   "personalInfo": { "phone": "", "position": "" },
//   "links": { "portfolio": "", "linkedIn": "", "github": "", "twitter": "", "facebook": "" },
//   "experiences": [
//     { "company": "", "role": "", "startDate": "", "endDate": "", "isCurrent": false, "description": "" }
//   ],
//   "educations": [
//     { "institution": "", "degree": "", "department": "", "startDate": "", "endDate": "" }
//   ],
//   "projects": [
//     { "name": "", "description": "", "technologies": [], "link": "" }
//   ],
//   "skills": []
// }

// Rules:
// - If a field cannot be found, leave it as an empty string, empty array, or false.
// - "position" should be the candidate's most recent or primary job title.
// - Dates should stay in whatever format they appear in the source text.
// - "isCurrent" should be true only if the role explicitly says "Present", "Current", or similar.
// - Do not invent information that isn't present in the text.

// CV TEXT:
// """
// ${rawText}
// """
//     `.trim();

//     const result = await model.generateContent(prompt);
//     let text = result.response.text().trim();

//     // Strip markdown code fences if the model adds them despite instructions
//     text = text.replace(/^```json\s*/i, "").replace(/```$/, "").trim();

//     try {
//       return JSON.parse(text) as ParsedCVData;
//     } catch (e) {
//       console.error("Failed to parse AI CV extraction response:", text);
//       console.log(e)
//       throw new Error("Could not parse CV. Please try again or fill the form manually.");
//     }
//   },
// };
import { GoogleGenAI } from "@google/genai";
import { createHash } from "node:crypto";
import dotenv from "dotenv";
import path from "node:path";

dotenv.config();
dotenv.config({ path: path.join(__dirname, "../../.env") });

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.warn("GEMINI_API_KEY is not configured");
}

const gemini = new GoogleGenAI({
  apiKey: GEMINI_API_KEY,
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

export interface ImproveJobDescriptionInput {
  title?: string;
  company?: string;
  description: string;
  requirements?: string[];
  experienceLevel?: string;
  type?: string;
  location?: string;
}

export interface ImproveExperienceInput {
  role?: string;
  company?: string;
  description: string;
}

export interface ParsedCVData {
  personalInfo: {
    firstName?: string;
    lastName?: string;
    phone: string;
    email?: string;
    position: string;
    address?: string;
  };

  professionalSummary?: string;

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
    cgpa?: string;
  }[];

  projects: {
    name: string;
    description: string;
    technologies: string[];
    link: string;
  }[];

  skills: string[];

  references?: {
    name: string;
    position?: string;
    company?: string;
    email?: string;
    phone?: string;
    relationship?: string;
  }[];
}

/* ------------------------------------------------------------------ */
/*  Monitoring: lightweight in-process metrics + structured logging   */
/* ------------------------------------------------------------------ */

type OperationMetrics = {
  count: number;
  successCount: number;
  errorCount: number;
  cacheHitCount: number;
  totalDurationMs: number;
  lastDurationMs?: number;
  lastError?: string;
  lastErrorAt?: string;
};

const metricsStore: Record<string, OperationMetrics> = {};

const getMetric = (op: string): OperationMetrics =>
  metricsStore[op] ??
  (metricsStore[op] = {
    count: 0,
    successCount: 0,
    errorCount: 0,
    cacheHitCount: 0,
    totalDurationMs: 0,
  });

const recordSuccess = (op: string, durationMs: number) => {
  const m = getMetric(op);
  m.count += 1;
  m.successCount += 1;
  m.totalDurationMs += durationMs;
  m.lastDurationMs = durationMs;
};

const recordError = (op: string, durationMs: number, error: unknown) => {
  const m = getMetric(op);
  m.count += 1;
  m.errorCount += 1;
  m.totalDurationMs += durationMs;
  m.lastDurationMs = durationMs;
  m.lastError = error instanceof Error ? error.message : String(error);
  m.lastErrorAt = new Date().toISOString();
};

const recordCacheHit = (op: string) => {
  getMetric(op).cacheHitCount += 1;
};

/**
 * Snapshot of current AIService metrics. Wire this up to a
 * /health or /metrics endpoint, or ship it to your APM
 * (Datadog, Sentry, CloudWatch, etc.) on an interval.
 */
export const getAIServiceMetrics = () =>
  Object.fromEntries(
    Object.entries(metricsStore).map(([op, m]) => [
      op,
      {
        ...m,
        avgDurationMs: m.count ? Math.round(m.totalDurationMs / m.count) : 0,
        errorRate: m.count ? Number((m.errorCount / m.count).toFixed(3)) : 0,
      },
    ])
  );

let requestSeq = 0;
const nextRequestId = (op: string) => `${op}-${Date.now()}-${++requestSeq}`;

const log = (level: "info" | "warn" | "error", payload: Record<string, unknown>) => {
  const line = JSON.stringify({ level, ts: new Date().toISOString(), ...payload });
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.log(line);
};

/**
 * Wraps an async operation with timing, structured logs, and metrics.
 */
async function monitored<T>(op: string, fn: (requestId: string) => Promise<T>): Promise<T> {
  const requestId = nextRequestId(op);
  const start = Date.now();
  log("info", { op, requestId, event: "start" });

  try {
    const result = await fn(requestId);
    const durationMs = Date.now() - start;
    recordSuccess(op, durationMs);
    log("info", { op, requestId, event: "success", durationMs });
    return result;
  } catch (error) {
    const durationMs = Date.now() - start;
    recordError(op, durationMs, error);
    log("error", {
      op,
      requestId,
      event: "error",
      durationMs,
      message: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

/* ------------------------------------------------------------------ */
/*  Speed / resilience helpers                                        */
/* ------------------------------------------------------------------ */

/**
 * Races a promise against a timeout so a slow/hung Gemini call
 * can never block a request indefinitely.
 */
const withTimeout = <T>(promise: Promise<T>, ms: number, label: string): Promise<T> => {
  let timer: ReturnType<typeof setTimeout>;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer)) as Promise<T>;
};

/**
 * Retries only on transient errors (rate limit / server-side),
 * with short exponential backoff. Never retries on bad input.
 */
async function withRetry<T>(fn: () => Promise<T>, retries = 1, baseDelayMs = 250): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (error: unknown) {
      lastError = error;
      const errObj = error as { status?: number; response?: { status?: number } };
      const status = errObj?.status ?? errObj?.response?.status;
      const isTransient = status === 429 || status === 500 || status === 503;
      if (!isTransient || attempt === retries) throw error;
      const delay = baseDelayMs * 2 ** attempt;
      log("warn", { event: "retry", attempt: attempt + 1, delay, status });
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  throw lastError;
}

const DEFAULT_TIMEOUT_MS = Number(process.env.GEMINI_TIMEOUT_MS ?? 15000);

/**
 * Gemini helper (now monitored, timed-out, and retried).
 */
const callGemini = async (
  prompt: string,
  options?: {
    temperature?: number;
    maxTokens?: number;
    jsonMode?: boolean;
    timeoutMs?: number;
    op?: string;
  }
): Promise<string> => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  const op = options?.op ?? "gemini.call";
  const timeoutMs = options?.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const preferredModel = process.env.GEMINI_MODEL || "gemini-2.5-flash";

  return monitored(op, async () => {
    const modelsToTry = [preferredModel, "gemini-2.0-flash", "gemini-1.5-flash"];
    let lastError: unknown;

    for (const model of modelsToTry) {
      try {
        const response = await withRetry(() =>
          withTimeout(
            gemini.models.generateContent({
              model,
              contents: prompt,
              config: {
                temperature: options?.temperature ?? 0.3,
                maxOutputTokens: options?.maxTokens ?? 1000,
                ...(options?.jsonMode ? { responseMimeType: "application/json" } : {}),
              },
            }),
            timeoutMs,
            op
          )
        );

        const content = response.text;
        if (content && content.trim()) {
          return content.trim();
        }
      } catch (err: unknown) {
        lastError = err;
        const msg = err instanceof Error ? err.message : String(err);
        if (msg.includes("not found") || msg.includes("404") || msg.includes("invalid model")) {
          log("warn", { op, event: "model_fallback", failedModel: model, error: msg });
          continue;
        }
        throw err;
      }
    }

    throw lastError || new Error("Gemini returned an empty response");
  });
};

/* ------------------------------------------------------------------ */
/*  Simple TTL cache for CV extraction                                 */
/*  Avoids re-calling Gemini for text that was already parsed          */
/*  (duplicate submits, retries, dev/test loops, etc.)                 */
/* ------------------------------------------------------------------ */

const CACHE_TTL_MS = Number(process.env.CV_EXTRACT_CACHE_TTL_MS ?? 10 * 60 * 1000);
const CACHE_MAX_ENTRIES = 200;

const extractCache = new Map<string, { data: ParsedCVData; expiresAt: number }>();

const hashText = (text: string) => createHash("sha256").update(text).digest("hex");

const getFromCache = (key: string): ParsedCVData | undefined => {
  const entry = extractCache.get(key);
  if (!entry) return undefined;
  if (entry.expiresAt < Date.now()) {
    extractCache.delete(key);
    return undefined;
  }
  return entry.data;
};

const setInCache = (key: string, data: ParsedCVData) => {
  // Basic eviction so this can never grow unbounded.
  if (extractCache.size >= CACHE_MAX_ENTRIES) {
    const oldestKey = extractCache.keys().next().value;
    if (oldestKey) extractCache.delete(oldestKey);
  }
  extractCache.set(key, { data, expiresAt: Date.now() + CACHE_TTL_MS });
};

/**
 * Fallback regex & heuristic parser when AI calls cannot be reached.
 * Ensures the user's CV is always parsed into editable fields.
 */
function heuristicExtractCVData(rawText: string): ParsedCVData {
  const emailMatch = rawText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  const phoneMatch = rawText.match(/(?:\+?\d{1,3}[- ]?)?\(?\d{3}\)?[- ]?\d{3}[- ]?\d{4,6}/);
  const linkedinMatch = rawText.match(/(?:https?:\/\/)?(?:www\.)?linkedin\.com\/(?:in\/)?[A-Za-z0-9_-]+/i);
  const githubMatch = rawText.match(/(?:https?:\/\/)?(?:www\.)?github\.com\/[A-Za-z0-9_-]+/i);
  const twitterMatch = rawText.match(/(?:https?:\/\/)?(?:www\.)?(?:twitter|x)\.com\/[A-Za-z0-9_]+/i);
  const portfolioMatch = rawText.match(/(?:https?:\/\/)?(?:www\.)?[a-zA-Z0-9-]+\.(?:com|dev|io|me|tech|ng|co|net)[^\s]*/i);

  const lines = rawText.split("\n").map((l) => l.trim()).filter(Boolean);

  let firstName = "";
  let lastName = "";
  let position = "";

  for (let i = 0; i < Math.min(lines.length, 5); i++) {
    const line = lines[i];
    if (line.includes("@") || line.includes("http") || /^\+?\d/.test(line)) continue;
    const words = line.split(/\s+/);
    if (!firstName && words.length >= 2 && words.length <= 4 && !/resume|curriculum|vitae|page/i.test(line)) {
      firstName = words[0];
      lastName = words.slice(1).join(" ");
    } else if (!position && words.length <= 6 && !/resume|curriculum|vitae/i.test(line)) {
      position = line;
    }
  }

  // Common skills search
  const commonSkills = [
    "JavaScript", "TypeScript", "React", "Node.js", "Python", "Java", "C++", "C#", "SQL",
    "PostgreSQL", "MongoDB", "HTML", "CSS", "Tailwind CSS", "Next.js", "Express", "Docker",
    "Kubernetes", "AWS", "Azure", "Git", "REST API", "GraphQL", "Linux", "Figma", "Redux",
    "Communication", "Leadership", "Project Management", "Problem Solving", "Agile", "Scrum"
  ];
  const foundSkills = commonSkills.filter((s) =>
    new RegExp(`\\b${s.replace("+", "\\+")}\\b`, "i").test(rawText)
  );

  return {
    personalInfo: {
      firstName: firstName || "",
      lastName: lastName || "",
      phone: phoneMatch ? phoneMatch[0] : "",
      email: emailMatch ? emailMatch[0] : "",
      position: position || "",
      address: "",
    },
    professionalSummary: lines.slice(1, 4).join(" ").slice(0, 300),
    links: {
      portfolio: portfolioMatch ? portfolioMatch[0] : "",
      linkedIn: linkedinMatch ? linkedinMatch[0] : "",
      github: githubMatch ? githubMatch[0] : "",
      twitter: twitterMatch ? twitterMatch[0] : "",
      facebook: "",
    },
    experiences: [],
    educations: [],
    projects: [],
    skills: foundSkills,
    references: [],
  };
}

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
                `${exp.role || "Role not specified"} at ${
                  exp.company || "Company not specified"
                } (${exp.startDate || "N/A"} - ${
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
                  edu.institution || "Institution not specified"
                } (${edu.startDate || "N/A"} - ${edu.endDate || "N/A"})`.trim()
            )
            .join("\n")
        : "No education listed.";

      const prompt = `
Write a well detailed professional CV summary for this candidate.

Requirements:
- 3 to 4 sentences.
- Maximum 400 words.
- Professional and ATS-friendly.
- Write in resume style.
- Do not use "I", "we", or "my".
- Do not use markdown.
- Do not use headings.
- Do not use bullet points.
- Do not invent experience, skills, qualifications, or achievements.
- Focus only on the candidate's strongest relevant experience and skills.
- If experience or education is missing, do not invent it.
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

      const summary = await callGemini(prompt, {
        temperature: 0.4,
        maxTokens: 250,
        timeoutMs: 12000,
        op: "generateProfessionalSummary",
      });

      if (!summary) {
        throw new Error("Gemini returned an empty summary");
      }

      return summary;
    } catch (e) {
      console.error("AIService.generateProfessionalSummary error:", e);

      const topSkills = skills.slice(0, 3).filter(Boolean).join(", ");
      const latestRole = experience[0]?.role;
      const latestCompany = experience[0]?.company;

      if (latestRole && latestCompany) {
        return `${role || latestRole} with hands-on experience at ${latestCompany}. Skilled in ${
          topSkills || "relevant professional skills"
        }. Committed to delivering high-quality results and continuously developing professionally.`;
      }

      return `${role || "Motivated professional"} skilled in ${
        topSkills || "a range of technical and professional skills"
      }. Eager to contribute effectively and grow within a dynamic organization.`;
    }
  },

  /**
   * Extract structured information from CV text
   */
  extractCVData: async (rawText: string): Promise<ParsedCVData> => {
    if (!rawText?.trim()) {
      throw new Error("CV text is empty");
    }

    const cacheKey = hashText(rawText.trim());
    const cached = getFromCache(cacheKey);
    if (cached) {
      recordCacheHit("extractCVData");
      log("info", { op: "extractCVData", event: "cache_hit" });
      return cached;
    }

    try {
      const prompt = `
Extract structured information from the CV text below.

Return ONLY valid JSON matching EXACTLY this structure:

{
  "personalInfo": {
    "firstName": "",
    "lastName": "",
    "phone": "",
    "email": "",
    "position": "",
    "address": ""
  },

  "professionalSummary": "",

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
      "startDate": "YYYY-MM-DD or YYYY-MM or YYYY",
      "endDate": "YYYY-MM-DD or YYYY-MM or YYYY",
      "isCurrent": false,
      "description": ""
    }
  ],

  "educations": [
    {
      "institution": "",
      "degree": "",
      "department": "",
      "startDate": "YYYY",
      "endDate": "YYYY",
      "cgpa": ""
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

  "skills": [],

  "references": [
    {
      "name": "",
      "position": "",
      "company": "",
      "email": "",
      "phone": "",
      "relationship": ""
    }
  ]
}

STRICT RULES:
1. Do not invent information. If a field cannot be found, use "" for strings, [] for arrays, false for booleans.
2. Separate firstName and lastName accurately if full name is provided.
3. "position" should contain the candidate's most recent, current, or target professional job title.
4. "address" should contain candidate location (city, state, country) if present.
5. "professionalSummary" should contain their summary, career objective, or profile statement.
6. Preserve or standardize dates. If a role is currently held, set "isCurrent" to true and "endDate" to "".
7. Extract all relevant work experiences with clear responsibilities/achievements in "description".
8. Extract all relevant education entries (institution, degree, department/field, dates, cgpa).
9. Extract projects when explicitly listed with names, descriptions, and technologies.
10. Extract individual professional and technical skills into the "skills" array.
11. Extract any listed references into "references".
12. Return ONLY valid JSON without markdown fences.

CV TEXT:

"""
${rawText}
"""
      `.trim();

      const text = await callGemini(prompt, {
        temperature: 0,
        maxTokens: 4000,
        jsonMode: true,
        timeoutMs: 25000,
        op: "extractCVData",
      });

      const cleanedText = text
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/```$/i, "")
        .trim();

      let parsed: ParsedCVData;

      try {
        parsed = JSON.parse(cleanedText) as ParsedCVData;
      } catch (parseError) {
        console.warn("Gemini CV JSON parse failed, falling back to heuristic parser:", parseError);
        const fallback = heuristicExtractCVData(rawText);
        setInCache(cacheKey, fallback);
        return fallback;
      }

      if (!parsed || typeof parsed !== "object") {
        throw new Error("Gemini returned invalid CV data");
      }

      parsed.personalInfo ??= {
        firstName: "",
        lastName: "",
        phone: "",
        email: "",
        position: "",
        address: "",
      };

      parsed.professionalSummary ??= "";

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
      parsed.references ??= [];

      setInCache(cacheKey, parsed);
      return parsed;
    } catch (e) {
      console.warn("AIService.extractCVData AI call failed, using heuristic fallback parser:", e);
      const fallback = heuristicExtractCVData(rawText);
      setInCache(cacheKey, fallback);
      return fallback;
    }
  },

  /**
   * Improve and enhance a job description using AI
   */
  improveJobDescription: async ({
    title,
    company,
    description,
    requirements,
    experienceLevel,
    type,
    location,
  }: ImproveJobDescriptionInput): Promise<string> => {
    try {
      const prompt = `
You are an expert technical talent recruiter and copywriter.
Enhance and professionally rewrite the following job description.

Job Context:
- Role Title: ${title || "Not specified"}
- Company Name: ${company || "Our Company"}
- Experience Level: ${experienceLevel || "Not specified"}
- Job Type: ${type || "Not specified"}
- Location: ${location || "Not specified"}
- Stated Requirements: ${requirements?.length ? requirements.join(", ") : "None specified"}

Draft / Input from Recruiter:
"""
${description}
"""

Requirements for your improved output:
1. Make it compelling, modern, well-structured, and ATS-friendly.
2. Structure clearly with clean sections:
   • About the Role: A strong, attractive opening paragraph introducing the mission, impact, and scope.
   • What You'll Do (Key Responsibilities): 4 to 7 impactful, actionable bullet points describing day-to-day duties.
   • What We're Looking For (Qualifications): Essential skills, technologies, and experience directly reflecting the role and requirements.
   • Nice to Have: 2-3 bonus skills or strengths (if applicable).
   • Why Join Us: Highlighting team culture, growth opportunities, and positive workplace environment.
3. Preserve all specific technologies, requirements, and constraints specified in the recruiter's input.
4. Do not invent rigid requirements that were not implied by the input.
5. Do NOT include markdown code fences or conversational meta-talk (do not say "Here is the improved job description:").
6. Return ONLY the improved job description ready to paste and edit.
`.trim();

      const improved = await callGemini(prompt, {
        temperature: 0.5,
        maxTokens: 1400,
        timeoutMs: 18000,
        op: "improveJobDescription",
      });

      return improved;
    } catch (e) {
      console.warn("AIService.improveJobDescription AI call failed, using structured template fallback:", e);

      const roleName = title || "Team Member";
      const compName = company || "Our Company";
      const reqList = requirements?.length
        ? requirements.map((r) => `• ${r}`).join("\n")
        : "• Proven background and relevant professional skills\n• Strong problem-solving abilities and communication";

      const cleanedInputLines = description
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean);

      const bullets = cleanedInputLines.length > 0
        ? cleanedInputLines.map((l) => `• ${l.replace(/^[•\-\*]\s*/, "")}`).join("\n")
        : `• Collaborate with the team to deliver high-quality work\n• Own key projects from design through execution\n• Maintain high standards and continuously improve processes`;

      return `### About the Role
We are seeking a talented ${roleName} to join our team at ${compName}. In this role, you will play a pivotal part in delivering high-impact solutions, collaborating across cross-functional teams, and driving forward our core initiatives.

### Key Responsibilities
${bullets}

### What We're Looking For
${reqList}

### What We Offer
• Dynamic, collaborative work environment
• Opportunities for professional growth and career advancement
• Competitive compensation and support for ongoing learning`;
    }
  },

  /**
   * Improve and ATS-optimize work experience responsibilities and achievements
   */
  improveExperience: async ({
    role,
    company,
    description,
  }: ImproveExperienceInput): Promise<string> => {
    try {
      const prompt = `
You are an expert executive resume writer and ATS optimization specialist.
Improve and rewrite the following work experience responsibilities and achievements for a CV/resume so that it passes Applicant Tracking Systems (ATS) and impresses recruiters.

Candidate Role: ${role || "Professional"}
Company: ${company || "Company"}

User's Raw Input / Responsibilities Draft:
"""
${description}
"""

Requirements:
1. ATS Optimization: Use strong industry-standard keywords and phrasing aligned with the role.
2. Action-Driven Bullets: Produce 3 to 5 powerful, high-impact bullet points.
3. Every bullet point MUST begin with a strong action verb (e.g., "Spearheaded", "Architected", "Engineered", "Optimized", "Delivered", "Streamlined", "Resolved", "Collaborated", "Championed").
4. Focus on measurable impact, scope, performance improvements, and business outcomes where sensible based on the user's input.
5. Do NOT invent untrue credentials, degrees, or unrelated technologies.
6. Do NOT wrap in markdown code blocks or add conversational introductory/closing text (do NOT say "Here are your improved bullet points:").
7. Start each bullet point with "• " on a new line.
8. Return ONLY the bullet points text.
`.trim();

      const improved = await callGemini(prompt, {
        temperature: 0.4,
        maxTokens: 800,
        timeoutMs: 15000,
        op: "improveExperience",
      });

      return improved;
    } catch (e) {
      console.warn("AIService.improveExperience AI call failed, using heuristic bullet generator:", e);

      const lines = description
        .split("\n")
        .map((l) => l.trim().replace(/^[•\-\*]\s*/, ""))
        .filter(Boolean);

      const actionVerbs = [
        "Delivered",
        "Engineered",
        "Streamlined",
        "Collaborated on",
        "Optimized",
        "Coordinated",
      ];

      if (lines.length === 0) {
        return `• Executed core responsibilities for ${role || "the role"} at ${company || "the company"}, ensuring high standards of delivery.\n• Collaborated with cross-functional team members to achieve operational milestones.\n• Identified and implemented process improvements to enhance productivity and outcomes.`;
      }

      return lines
        .map((line, idx) => {
          const startsWithVerb = /^[A-Z][a-z]+ed\b/.test(line);
          const verb = actionVerbs[idx % actionVerbs.length];
          const formattedLine = startsWithVerb ? line : `${verb} ${line.charAt(0).toLowerCase()}${line.slice(1)}`;
          return `• ${formattedLine}`;
        })
        .join("\n");
    }
  },

  getMetrics: getAIServiceMetrics,
};


// import axios from "axios";

// const DEEPSEEK_API_URL = "https://api.deepseek.com/chat/completions";

// const deepseek = axios.create({
//   baseURL: DEEPSEEK_API_URL,
//   headers: {
//     Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
//     "Content-Type": "application/json",
//   },
//   timeout: 60000,
// });

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


// /**
//  * DeepSeek helper
//  */
// const callDeepSeek = async (
//   prompt: string,
//   options?: {
//     temperature?: number;
//     maxTokens?: number;
//     jsonMode?: boolean;
//   }
// ): Promise<string> => {
//   if (!process.env.DEEPSEEK_API_KEY) {
//     throw new Error("DEEPSEEK_API_KEY is not configured");
//   }

//   const response = await deepseek.post("", {
//     model: "deepseek-chat",

//     messages: [
//       {
//         role: "system",
//         content:
//           "You are an expert professional CV writer and CV parser. Follow the user's instructions exactly and make this pass ATS checks.",
//       },
//       {
//         role: "user",
//         content: prompt,
//       },
//     ],

//     temperature: options?.temperature ?? 0.3,

//     max_tokens: options?.maxTokens ?? 1000,

//     ...(options?.jsonMode
//       ? {
//           response_format: {
//             type: "json_object",
//           },
//         }
//       : {}),
//   });

//   const content =
//     response.data?.choices?.[0]?.message?.content;

//   if (!content) {
//     throw new Error("DeepSeek returned an empty response");
//   }

//   return content.trim();
// };


// export const AIService = {

//   /**
//    * Generate professional CV summary
//    */
//   generateProfessionalSummary: async ({
//     fullName,
//     experience,
//     skills,
//     education,
//     role,
//   }: GenerateSummaryInput): Promise<string> => {
//     try {
//       const experienceText = experience.length
//         ? experience
//             .map(
//               (exp) =>
//                 `${exp.role} at ${exp.company} (${
//                   exp.startDate || "N/A"
//                 } - ${
//                   exp.isCurrent
//                     ? "Present"
//                     : exp.endDate || "N/A"
//                 })${
//                   exp.description
//                     ? `: ${exp.description}`
//                     : ""
//                 }`
//             )
//             .join("\n")
//         : "No work experience listed.";

//       const educationText = education.length
//         ? education
//             .map(
//               (edu) =>
//                 `${edu.degree || ""} ${
//                   edu.department
//                     ? `in ${edu.department}`
//                     : ""
//                 } at ${
//                   edu.institution
//                 } (${
//                   edu.startDate || "N/A"
//                 } - ${
//                   edu.endDate || "N/A"
//                 })`.trim()
//             )
//             .join("\n")
//         : "No education listed.";

//       const prompt = `
// Write a full detailed professional CV summary for this candidate.

// Requirements:
// - 3 to 4 sentences.
// - Maximum 400 words.
// - Professional and ATS-friendly.
// - Write in resume style.
// - Do not use "I", "we", or "my".
// - Do not use markdown.
// - Do not use headings.
// - Do not use bullet points.
// - Do not invent experience, skills, qualifications, or achievements.
// - Focus on the candidate's strongest relevant experience and skills.
// - Return ONLY the summary text.

// Candidate:
// Name: ${fullName}

// Target Role:
// ${role || "Not specified"}

// Skills:
// ${skills.length ? skills.join(", ") : "None listed"}

// Experience:
// ${experienceText}

// Education:
// ${educationText}
//       `.trim();

//       const summary = await callDeepSeek(prompt, {
//         temperature: 0.4,
//         maxTokens: 250,
//       });

//       if (!summary) {
//         throw new Error(
//           "DeepSeek returned an empty summary"
//         );
//       }

//       return summary;

//     } catch (e) {
//       console.error(
//         "AIService.generateProfessionalSummary error:",
//         e
//       );

//       /**
//        * Fallback
//        * 
//        * The CV should still be generated if
//        * DeepSeek is unavailable.
//        */
//       const topSkills = skills
//         .slice(0, 3)
//         .filter(Boolean)
//         .join(", ");

//       const latestRole = experience[0]?.role;
//       const latestCompany = experience[0]?.company;

//       if (latestRole && latestCompany) {
//         return `${
//           role || latestRole
//         } with hands-on experience at ${latestCompany}. Skilled in ${
//           topSkills || "relevant professional skills"
//         }. Committed to delivering high-quality results and continuously developing professionally.`;
//       }

//       return `${
//         role || "Motivated professional"
//       } skilled in ${
//         topSkills ||
//         "a range of technical and professional skills"
//       }. Eager to contribute effectively and grow within a dynamic organization.`;
//     }
//   },


//   /**
//    * Extract structured information from CV text
//    */
//   extractCVData: async (
//     rawText: string
//   ): Promise<ParsedCVData> => {
//     try {

//       if (!rawText?.trim()) {
//         throw new Error(
//           "CV text is empty"
//         );
//       }

//       const prompt = `
// Extract structured information from the CV text below.

// Return ONLY valid JSON matching EXACTLY this structure:

// {
//   "personalInfo": {
//     "phone": "",
//     "position": ""
//   },

//   "links": {
//     "portfolio": "",
//     "linkedIn": "",
//     "github": "",
//     "twitter": "",
//     "facebook": ""
//   },

//   "experiences": [
//     {
//       "company": "",
//       "role": "",
//       "startDate": "",
//       "endDate": "",
//       "isCurrent": false,
//       "description": ""
//     }
//   ],

//   "educations": [
//     {
//       "institution": "",
//       "degree": "",
//       "department": "",
//       "startDate": "",
//       "endDate": ""
//     }
//   ],

//   "projects": [
//     {
//       "name": "",
//       "description": "",
//       "technologies": [],
//       "link": ""
//     }
//   ],

//   "skills": []
// }

// STRICT RULES:

// 1. Do not invent information.

// 2. If a field cannot be found, use:
//    - "" for strings
//    - [] for arrays
//    - false for booleans

// 3. "position" should contain the candidate's most recent or primary professional job title.

// 4. Preserve dates in the format they appear in the CV.

// 5. "isCurrent" must only be true when the CV explicitly indicates:
//    - Present
//    - Current
//    - Currently
//    - or an equivalent expression.

// 6. Extract all relevant work experiences.

// 7. Extract all relevant education entries.

// 8. Extract projects when they are explicitly listed.

// 9. Extract technologies associated with each project.

// 10. Extract professional skills.

// 11. Extract URLs exactly when possible.

// 12. Do not add explanations outside the JSON.

// 13. Do not wrap the JSON in markdown code fences.

// CV TEXT:

// """
// ${rawText}
// """
//       `.trim();

//       const text = await callDeepSeek(prompt, {
//         temperature: 0,
//         maxTokens: 4000,
//         jsonMode: true,
//       });

//       /**
//        * DeepSeek should already return JSON because
//        * response_format = json_object is enabled.
//        *
//        * Still remove accidental code fences just in case.
//        */
//       let cleanedText = text
//         .replace(/^```json\s*/i, "")
//         .replace(/^```\s*/i, "")
//         .replace(/```$/i, "")
//         .trim();

//       let parsed: ParsedCVData;

//       try {
//         parsed = JSON.parse(
//           cleanedText
//         ) as ParsedCVData;
//       } catch (parseError) {
//         console.error(
//           "Failed to parse DeepSeek CV response:"
//         );

//         console.error(
//           cleanedText
//         );

//         console.error(
//           parseError
//         );

//         throw new Error(
//           "Could not parse CV. Please try again or fill the form manually."
//         );
//       }

//       /**
//        * Basic structure validation
//        */
//       if (
//         !parsed ||
//         typeof parsed !== "object"
//       ) {
//         throw new Error(
//           "DeepSeek returned invalid CV data"
//         );
//       }

//       /**
//        * Ensure all expected properties exist.
//        */
//       parsed.personalInfo ??= {
//         phone: "",
//         position: "",
//       };

//       parsed.links ??= {
//         portfolio: "",
//         linkedIn: "",
//         github: "",
//         twitter: "",
//         facebook: "",
//       };

//       parsed.experiences ??= [];
//       parsed.educations ??= [];
//       parsed.projects ??= [];
//       parsed.skills ??= [];

//       return parsed;

//     } catch (e) {
//       console.error(
//         "AIService.extractCVData error:",
//         e
//       );

//       if (
//         e instanceof Error &&
//         e.message.includes(
//           "Could not parse CV"
//         )
//       ) {
//         throw e;
//       }

//       throw new Error(
//         "Could not process CV. Please try again or fill the form manually."
//       );
//     }
//   },
// };

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
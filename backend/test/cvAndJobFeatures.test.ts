import { describe, it, expect } from "bun:test";
import { extractTextFromFile } from "../src/utils/fileTextExtractor";
import { AIService } from "../src/services/AIService";
import { jobController } from "../src/controllers/jobController";
import { cvController } from "../src/controllers/cvController";

describe("CV Parsing and Text Extraction", () => {
  it("extracts plain text file correctly", async () => {
    const sampleCV = `
John Doe
Senior Software Engineer
john.doe@example.com | +1 (555) 123-4567 | San Francisco, CA
https://linkedin.com/in/johndoe | https://github.com/johndoe

Summary:
Experienced engineer with 6+ years in TypeScript, React, and Node.js.

Skills:
React, TypeScript, Node.js, GraphQL, Docker, PostgreSQL

Experience:
TechCorp Inc. - Senior Engineer
2021-01 - Present
Built high-scale web apps and managed a team of 4 engineers.

Education:
Stanford University - B.Sc Computer Science
2015 - 2019
    `.trim();

    const buffer = Buffer.from(sampleCV, "utf-8");
    const extracted = await extractTextFromFile(buffer, "sample_cv.txt", "text/plain");

    expect(extracted).toContain("John Doe");
    expect(extracted).toContain("Senior Software Engineer");
    expect(extracted).toContain("john.doe@example.com");
  });

  it("extracts structured CV data via AIService or heuristic fallback", async () => {
    const sampleCV = `
Alex Mercer
Full Stack Developer
alex.mercer@gmail.com
+234 801 234 5678
Lagos, Nigeria
https://linkedin.com/in/alexmercer
https://github.com/alexmercer

Profile:
Passionate software developer specializing in building modern web applications.

Skills:
React, TypeScript, Node.js, PostgreSQL, Docker, AWS

Experience:
Acme Labs - Software Engineer
2022-03 - Present
Developed performant user interfaces and integrated REST APIs.
    `.trim();

    const parsed = await AIService.extractCVData(sampleCV);

    expect(parsed).toBeDefined();
    expect(parsed.personalInfo).toBeDefined();
    expect(parsed.personalInfo.phone).toContain("801");
    expect(parsed.personalInfo.email).toBe("alex.mercer@gmail.com");
    expect(parsed.links.github).toContain("github.com/alexmercer");
    expect(parsed.links.linkedIn).toContain("linkedin.com/in/alexmercer");
    expect(Array.isArray(parsed.skills)).toBe(true);
    expect(parsed.skills.length).toBeGreaterThan(0);
  });

  it("cvController.parseCV handles file uploads and returns structured data", async () => {
    const sampleText = `
Jane Smith
Product Designer
jane.smith@design.io
+1 (555) 987-6543
https://linkedin.com/in/janesmith
https://janesmith.design

Skills:
Figma, UI Design, Prototyping, CSS
    `.trim();

    const file = new File([sampleText], "resume.txt", { type: "text/plain" });
    const result = await cvController.parseCV(file);

    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    expect(result.data?.personalInfo?.email).toBe("jane.smith@design.io");
  });
});

describe("AI Job Description Improvement", () => {
  it("improves job description with structured sections and preserves details", async () => {
    const input = {
      title: "Senior React Engineer",
      company: "MatchNexx",
      description: "Need someone to build web apps, 4+ years react, fast paced startup, mentor juniors.",
      requirements: ["React", "TypeScript", "Tailwind CSS"],
      experienceLevel: "senior",
      type: "full-time",
      location: "Lagos",
    };

    const improved = await AIService.improveJobDescription(input);

    expect(typeof improved).toBe("string");
    expect(improved.length).toBeGreaterThan(50);
    // Should have structured sections
    expect(improved.toLowerCase()).toMatch(/about the role|responsibilities|qualifications|requirements|looking for/i);
  });

  it("jobController.improveDescription validates empty input and returns formatted description", async () => {
    const emptyResult = await jobController.improveDescription({
      description: "",
      title: "Dev",
    });
    expect(emptyResult.success).toBe(false);

    const validResult = await jobController.improveDescription({
      title: "Frontend Developer",
      company: "Kaay",
      description: "Build clean UI and collaborate with backend team.",
      requirements: ["React", "CSS"],
    });

    expect(validResult.success).toBe(true);
    expect(validResult.data).toBeDefined();
  });
});

describe("Work Experience Responsibilities and Achievements Improvement", () => {
  it("improves work experience responsibilities into ATS-optimized bullet points", async () => {
    const input = {
      role: "Full Stack Engineer",
      company: "Stripe",
      description: "built payment dashboard, fixed checkout latency, worked with postgres and react.",
    };

    const improved = await AIService.improveExperience(input);

    expect(typeof improved).toBe("string");
    expect(improved.length).toBeGreaterThan(30);
    // Should have bullet points
    expect(improved).toContain("•");
  });

  it("cvController.improveExperience validates empty descriptions and returns enhanced bullets", async () => {
    const emptyResult = await cvController.improveExperience({
      role: "Backend Engineer",
      company: "Paystack",
      description: "",
    });
    expect(emptyResult.success).toBe(false);

    const validResult = await cvController.improveExperience({
      role: "Backend Engineer",
      company: "Paystack",
      description: "developed microservices with node and redis, improved throughput.",
    });

    expect(validResult.success).toBe(true);
    expect(validResult.data).toBeDefined();
    expect(validResult.data).toContain("•");
  });
});


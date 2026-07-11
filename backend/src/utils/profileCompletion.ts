import { db } from "../db/db";
import { applicants } from "../db/schema";
import { eq } from "drizzle-orm";

export async function calculateProfileCompletion(userId: string) {
  const applicant = await db.query.applicants.findFirst({
    where: eq(applicants.userId, userId),
    with: {
      experiences: true,
      educations: true,
    },
  });

  if (!applicant) {
    return {
      percentage: 0,
      completed: [],
      missing: [
        "Profile",
        "CV",
        "Experience",
        "Education",
        "Profile Picture",
      ],
    };
  }

  let score = 0;

  const completed: string[] = [];
  const missing: string[] = [];

  const check = (
    value: unknown,
    points: number,
    label: string
  ) => {
    if (
      value !== null &&
      value !== undefined &&
      value !== ""
    ) {
      score += points;
      completed.push(label);
    } else {
      missing.push(label);
    }
  };

  check(applicant.headline, 8, "Headline");
  check(applicant.summary, 12, "Summary");
  check(applicant.phone, 8, "Phone");
  check(applicant.location, 8, "Location");
  check(applicant.portfolio, 8, "Portfolio");
  check(applicant.github, 6, "GitHub");
  check(applicant.linkedin, 6, "LinkedIn");
  check(applicant.cvUrl, 18, "CV");
  check(applicant.profilePicture, 10, "Profile Picture");

  if (applicant.experiences.length > 0) {
    score += 10;
    completed.push("Experience");
  } else {
    missing.push("Experience");
  }

  if (applicant.educations.length > 0) {
    score += 6;
    completed.push("Education");
  } else {
    missing.push("Education");
  }

  return {
    percentage: Math.min(score, 100),
    completed,
    missing,
  };
}
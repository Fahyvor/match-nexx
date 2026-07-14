import {
  pgTable,
  text,
  uuid,
  timestamp,
  integer,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

/* ===========================
   USERS
=========================== */

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),

  email: text("email").notNull().unique(),
  password: text("password").notNull(),

  firstName: text("firstName").notNull(),
  lastName: text("lastName").notNull(),

  state: text("state").notNull(),
  country: text("country").notNull(),

  years_of_experience: integer("years_of_experience").notNull(),

  role: text("role").notNull(),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

/* ===========================
   APPLICANTS
=========================== */

export const applicants = pgTable("applicants", {
  id: uuid("id").primaryKey().defaultRandom(),

  userId: uuid("user_id")
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade" }),

  headline: text("headline"),

  summary: text("summary"),

  phone: text("phone"),

  location: text("location"),

  portfolio: text("portfolio"),

  github: text("github"),

  linkedin: text("linkedin"),

  cvUrl: text("cv_url"),

  profilePicture: text("profile_picture"),

  createdAt: timestamp("created_at").defaultNow(),

  updatedAt: timestamp("updated_at").defaultNow(),
});

/* ===========================
   RECRUITERS
=========================== */

export const recruiters = pgTable("recruiters", {
  id: uuid("id").primaryKey().defaultRandom(),

  userId: uuid("user_id")
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade" }),

  companyName: text("company_name"),

  website: text("website"),

  createdAt: timestamp("created_at").defaultNow(),

  updatedAt: timestamp("updated_at").defaultNow(),
});

/* ===========================
   JOBS
=========================== */

export const jobs = pgTable("jobs", {
  id: uuid("id").primaryKey().defaultRandom(),

  recruiterId: uuid("recruiter_id")
    .notNull()
    .references(() => recruiters.id, { onDelete: "cascade" }),

  title: text("title").notNull(),

  description: text("description"),

  location: text("location"),

  type: text("type"),

  experienceLevel: text("experience_level"),

  salary: integer("salary"),

  requirements: text("requirements").array(),

  company: text("company"),

  status: text("status").default("active"),

  totalApplicants: integer("total_applicants").default(0),

  createdAt: timestamp("created_at").defaultNow(),

  updatedAt: timestamp("updated_at").defaultNow(),
});

/* ===========================
   APPLICATIONS
=========================== */

export const applications = pgTable("applications", {
  id: uuid("id").primaryKey().defaultRandom(),

  applicantId: uuid("applicant_id")
    .notNull()
    .references(() => applicants.id, { onDelete: "cascade" }),

  jobId: uuid("job_id")
    .notNull()
    .references(() => jobs.id, { onDelete: "cascade" }),

  status: text("status").default("pending"),

  createdAt: timestamp("created_at").defaultNow(),

  updatedAt: timestamp("updated_at").defaultNow(),
});

/* ===========================
   EXPERIENCES
=========================== */

export const experiences = pgTable("experiences", {
  id: uuid("id").primaryKey().defaultRandom(),

  applicantId: uuid("applicant_id")
    .notNull()
    .references(() => applicants.id, { onDelete: "cascade" }),

  company: text("company").notNull(),

  role: text("role").notNull(),

  startDate: text("start_date"),

  endDate: text("end_date"),

  description: text("description"),
});

/* ===========================
   EDUCATIONS
=========================== */

export const educations = pgTable("educations", {
  id: uuid("id").primaryKey().defaultRandom(),

  applicantId: uuid("applicant_id")
    .notNull()
    .references(() => applicants.id, { onDelete: "cascade" }),

  school: text("school").notNull(),

  degree: text("degree"),

  field: text("field"),

  startYear: text("start_year"),

  endYear: text("end_year"),
});

/* ===========================
   RELATIONS
=========================== */

export const userRelations = relations(users, ({ one }) => ({
  applicant: one(applicants, {
    fields: [users.id],
    references: [applicants.userId],
  }),

  recruiter: one(recruiters, {
    fields: [users.id],
    references: [recruiters.userId],
  }),
}));

export const applicantRelations = relations(applicants, ({ one, many }) => ({
  user: one(users, {
    fields: [applicants.userId],
    references: [users.id],
  }),

  applications: many(applications),

  experiences: many(experiences),

  educations: many(educations),
}));

export const recruiterRelations = relations(recruiters, ({ one, many }) => ({
  user: one(users, {
    fields: [recruiters.userId],
    references: [users.id],
  }),

  jobs: many(jobs),
}));

export const jobRelations = relations(jobs, ({ one, many }) => ({
  recruiter: one(recruiters, {
    fields: [jobs.recruiterId],
    references: [recruiters.id],
  }),

  applications: many(applications),
}));

export const applicationRelations = relations(applications, ({ one }) => ({
  applicant: one(applicants, {
    fields: [applications.applicantId],
    references: [applicants.id],
  }),

  job: one(jobs, {
    fields: [applications.jobId],
    references: [jobs.id],
  }),
}));

export const experienceRelations = relations(experiences, ({ one }) => ({
  applicant: one(applicants, {
    fields: [experiences.applicantId],
    references: [applicants.id],
  }),
}));

export const educationRelations = relations(educations, ({ one }) => ({
  applicant: one(applicants, {
    fields: [educations.applicantId],
    references: [applicants.id],
  }),
}));


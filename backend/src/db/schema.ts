import {
  pgTable,
  text,
  uuid,
  timestamp,
  integer,
  boolean,
  decimal,
  jsonb,
} from "drizzle-orm/pg-core";

import { relations } from "drizzle-orm";

/* =========================================================
   USERS
========================================================= */

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

  resetTokenHash: text("reset_token_hash"),
  
  resetTokenExpiresAt: timestamp("reset_token_expires_at", {
    withTimezone: true,
  }),

  createdAt: timestamp("created_at").defaultNow(),

  updatedAt: timestamp("updated_at").defaultNow(),
});

/* =========================================================
   APPLICANTS
========================================================= */

export const applicants = pgTable("applicants", {
  id: uuid("id").primaryKey().defaultRandom(),

  userId: uuid("user_id")
    .notNull()
    .unique()
    .references(() => users.id, {
      onDelete: "cascade",
    }),

  headline: text("headline"),

  summary: text("summary"),

  phone: text("phone"),

  location: text("location"),

  portfolio: text("portfolio"),

  github: text("github"),

  linkedin: text("linkedin"),

  twitter: text("twitter"),

  facebook: text("facebook"),

  cvUrl: text("cv_url"),

  profilePicture: text("profile_picture"),

  hasPaidCv: boolean("has_paid_cv").default(false),

  /*
   * Kept for backward compatibility.
   *
   * The transaction table should be the source of truth
   * for payment records.
   */
  bachsCheckoutId: text("bachs_checkout_id").unique(),

  bachsChargeId: text("bachs_charge_id").unique(),

  paidAt: timestamp("paid_at"),

  createdAt: timestamp("created_at").defaultNow(),

  updatedAt: timestamp("updated_at").defaultNow(),
});

/* =========================================================
   RECRUITERS
========================================================= */

export const recruiters = pgTable("recruiters", {
  id: uuid("id").primaryKey().defaultRandom(),

  userId: uuid("user_id")
    .notNull()
    .unique()
    .references(() => users.id, {
      onDelete: "cascade",
    }),

  companyName: text("company_name"),

  website: text("website"),

  createdAt: timestamp("created_at").defaultNow(),

  updatedAt: timestamp("updated_at").defaultNow(),
});

/* =========================================================
   JOBS
========================================================= */

export const jobs = pgTable("jobs", {
  id: uuid("id").primaryKey().defaultRandom(),

  recruiterId: uuid("recruiter_id")
    .notNull()
    .references(() => recruiters.id, {
      onDelete: "cascade",
    }),

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

/* =========================================================
   APPLICATIONS
========================================================= */

export const applications = pgTable("applications", {
  id: uuid("id").primaryKey().defaultRandom(),

  applicantId: uuid("applicant_id")
    .notNull()
    .references(() => applicants.id, {
      onDelete: "cascade",
    }),

  jobId: uuid("job_id")
    .notNull()
    .references(() => jobs.id, {
      onDelete: "cascade",
    }),

  status: text("status").default("pending"),

  createdAt: timestamp("created_at").defaultNow(),

  updatedAt: timestamp("updated_at").defaultNow(),
});

/* =========================================================
   EXPERIENCES
========================================================= */

export const experiences = pgTable("experiences", {
  id: uuid("id").primaryKey().defaultRandom(),

  applicantId: uuid("applicant_id")
    .notNull()
    .references(() => applicants.id, {
      onDelete: "cascade",
    }),

  company: text("company").notNull(),

  role: text("role").notNull(),

  startDate: text("start_date"),

  endDate: text("end_date"),

  description: text("description"),
});

/* =========================================================
   EDUCATIONS
========================================================= */

export const educations = pgTable("educations", {
  id: uuid("id").primaryKey().defaultRandom(),

  applicantId: uuid("applicant_id")
    .notNull()
    .references(() => applicants.id, {
      onDelete: "cascade",
    }),

  school: text("school").notNull(),

  degree: text("degree"),

  field: text("field"),

  startYear: text("start_year"),

  endYear: text("end_year"),
});

/* =========================================================
   SKILLS
========================================================= */

export const skills = pgTable("skills", {
  id: uuid("id").primaryKey().defaultRandom(),

  applicantId: uuid("applicant_id")
    .notNull()
    .references(() => applicants.id, {
      onDelete: "cascade",
    }),

  name: text("name").notNull(),
});

/* =========================================================
   PROJECTS
========================================================= */

export const projects = pgTable("projects", {
  id: uuid("id").primaryKey().defaultRandom(),

  applicantId: uuid("applicant_id")
    .notNull()
    .references(() => applicants.id, {
      onDelete: "cascade",
    }),

  name: text("name").notNull(),

  description: text("description"),

  technologies: text("technologies").array(),

  link: text("link"),
});

/* =========================================================
   CVS
========================================================= */

export const cvs = pgTable("cvs", {
  id: uuid("id").primaryKey().defaultRandom(),

  applicantId: uuid("applicant_id")
    .notNull()
    .unique()
    .references(() => applicants.id, {
      onDelete: "cascade",
    }),

  professionalSummary: text("professional_summary"),

  references: jsonb("references"),

  template: text("template").default("minimal"),

  createdAt: timestamp("created_at").defaultNow(),

  updatedAt: timestamp("updated_at").defaultNow(),
});

/* =========================================================
   RECRUITER SUBSCRIPTIONS
========================================================= */

export const subscriptions = pgTable("subscriptions", {
  id: uuid("id").primaryKey().defaultRandom(),

  recruiterId: uuid("recruiter_id")
    .notNull()
    .references(() => recruiters.id, {
      onDelete: "cascade",
    }),

  plan: text("plan").notNull(),

  status: text("status")
    .notNull()
    .default("pending"),

  bachsCheckoutId: text("bachs_checkout_id").unique(),

  bachsChargeId: text("bachs_charge_id").unique(),

  currentPeriodEnd: timestamp("current_period_end"),

  createdAt: timestamp("created_at").defaultNow(),

  updatedAt: timestamp("updated_at").defaultNow(),
});

/* =========================================================
   TRANSACTIONS
=========================================================

   This is the central payment record.

   IMPORTANT:

   A transaction should be created BEFORE calling Bachs.

   Example:

   1. Create transaction -> pending
   2. Call Bachs
   3. Save checkout ID
   4. User pays
   5. Bachs sends webhook
   6. Update transaction -> successful
   7. Update applicant/subscription

========================================================= */

export const transactions = pgTable("transactions", {
  id: uuid("id").primaryKey().defaultRandom(),

  /*
   * The user who initiated the payment.
   */
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, {
      onDelete: "cascade",
    }),

  /*
   * Optional applicant associated with transaction.
   */
  applicantId: uuid("applicant_id").references(
    () => applicants.id,
    {
      onDelete: "set null",
    }
  ),

  /*
   * Optional recruiter associated with transaction.
   */
  recruiterId: uuid("recruiter_id").references(
    () => recruiters.id,
    {
      onDelete: "set null",
    }
  ),

  /*
   * What the user is paying for.
   *
   * Examples:
   * cv_builder
   * recruiter_subscription
   */
  type: text("type").notNull(),

  /*
   * Current state of the transaction.
   *
   * pending
   * processing
   * successful
   * failed
   * cancelled
   * refunded
   */
  status: text("status")
    .notNull()
    .default("pending"),

  /*
   * Amount requested from the customer.
   *
   * Decimal is preferable for money instead of integer.
   */
  amount: decimal("amount", {
    precision: 18,
    scale: 2,
  }).notNull(),

  /*
   * Currency used for the transaction.
   *
   * Example:
   * USD
   * NGN
   */
  currency: text("currency").notNull(),

  /*
   * Payment provider.
   *
   * Example:
   * bachs
   */
  provider: text("provider")
    .notNull()
    .default("bachs"),

  /*
   * Provider checkout/session ID.
   */
  providerCheckoutId: text("provider_checkout_id").unique(),

  /*
   * Provider charge/payment ID.
   */
  providerChargeId: text("provider_charge_id").unique(),

  /*
   * Provider transaction/reference ID if supplied.
   */
  providerTransactionId: text(
    "provider_transaction_id"
  ).unique(),

  /*
   * Prevents duplicate webhook processing.
   *
   * Store the provider's event ID here when available.
   */
  providerEventId: text("provider_event_id").unique(),

  /*
   * Useful for tracking why a transaction failed.
   */
  failureReason: text("failure_reason"),

  /*
   * Additional provider information.
   *
   * Useful because payment providers can return
   * different metadata depending on the event.
   */
  metadata: jsonb("metadata"),

  /*
   * When payment was successfully completed.
   */
  paidAt: timestamp("paid_at"),

  /*
   * When transaction was refunded.
   */
  refundedAt: timestamp("refunded_at"),

  createdAt: timestamp("created_at").defaultNow(),

  updatedAt: timestamp("updated_at").defaultNow(),
});

/* =========================================================
   RELATIONS
========================================================= */

/* =========================================================
   USER RELATIONS
========================================================= */

export const userRelations = relations(
  users,
  ({ one, many }) => ({
    applicant: one(applicants, {
      fields: [users.id],
      references: [applicants.userId],
    }),

    recruiter: one(recruiters, {
      fields: [users.id],
      references: [recruiters.userId],
    }),

    transactions: many(transactions),
  })
);

/* =========================================================
   APPLICANT RELATIONS
========================================================= */

export const applicantRelations = relations(
  applicants,
  ({ one, many }) => ({
    user: one(users, {
      fields: [applicants.userId],
      references: [users.id],
    }),

    applications: many(applications),

    experiences: many(experiences),

    educations: many(educations),

    skills: many(skills),

    projects: many(projects),

    cv: one(cvs, {
      fields: [applicants.id],
      references: [cvs.applicantId],
    }),

    transactions: many(transactions),
  })
);

/* =========================================================
   RECRUITER RELATIONS
========================================================= */

export const recruiterRelations = relations(
  recruiters,
  ({ one, many }) => ({
    user: one(users, {
      fields: [recruiters.userId],
      references: [users.id],
    }),

    jobs: many(jobs),

    subscriptions: many(subscriptions),

    transactions: many(transactions),
  })
);

/* =========================================================
   TRANSACTION RELATIONS
========================================================= */

export const transactionRelations = relations(
  transactions,
  ({ one }) => ({
    user: one(users, {
      fields: [transactions.userId],
      references: [users.id],
    }),

    applicant: one(applicants, {
      fields: [transactions.applicantId],
      references: [applicants.id],
    }),

    recruiter: one(recruiters, {
      fields: [transactions.recruiterId],
      references: [recruiters.id],
    }),
  })
);

/* =========================================================
   SUBSCRIPTION RELATIONS
========================================================= */

export const subscriptionRelations = relations(
  subscriptions,
  ({ one }) => ({
    recruiter: one(recruiters, {
      fields: [subscriptions.recruiterId],
      references: [recruiters.id],
    }),
  })
);

/* =========================================================
   JOB RELATIONS
========================================================= */

export const jobRelations = relations(
  jobs,
  ({ one, many }) => ({
    recruiter: one(recruiters, {
      fields: [jobs.recruiterId],
      references: [recruiters.id],
    }),

    applications: many(applications),
  })
);

/* =========================================================
   APPLICATION RELATIONS
========================================================= */

export const applicationRelations = relations(
  applications,
  ({ one }) => ({
    applicant: one(applicants, {
      fields: [applications.applicantId],
      references: [applicants.id],
    }),

    job: one(jobs, {
      fields: [applications.jobId],
      references: [jobs.id],
    }),
  })
);

/* =========================================================
   EXPERIENCE RELATIONS
========================================================= */

export const experienceRelations = relations(
  experiences,
  ({ one }) => ({
    applicant: one(applicants, {
      fields: [experiences.applicantId],
      references: [applicants.id],
    }),
  })
);

/* =========================================================
   EDUCATION RELATIONS
========================================================= */

export const educationRelations = relations(
  educations,
  ({ one }) => ({
    applicant: one(applicants, {
      fields: [educations.applicantId],
      references: [applicants.id],
    }),
  })
);

/* =========================================================
   SKILL RELATIONS
========================================================= */

export const skillRelations = relations(
  skills,
  ({ one }) => ({
    applicant: one(applicants, {
      fields: [skills.applicantId],
      references: [applicants.id],
    }),
  })
);

/* =========================================================
   PROJECT RELATIONS
========================================================= */

export const projectRelations = relations(
  projects,
  ({ one }) => ({
    applicant: one(applicants, {
      fields: [projects.applicantId],
      references: [applicants.id],
    }),
  })
);

/* =========================================================
   CV RELATIONS
========================================================= */

export const cvRelations = relations(
  cvs,
  ({ one }) => ({
    applicant: one(applicants, {
      fields: [cvs.applicantId],
      references: [applicants.id],
    }),
  })
);
import { pgTable, foreignKey, uuid, text, timestamp, unique, integer } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const applications = pgTable("applications", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	applicantId: uuid("applicant_id").notNull(),
	jobId: uuid("job_id").notNull(),
	status: text().default('pending'),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.applicantId],
			foreignColumns: [applicants.id],
			name: "applications_applicant_id_applicants_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.jobId],
			foreignColumns: [jobs.id],
			name: "applications_job_id_jobs_id_fk"
		}).onDelete("cascade"),
]);

export const educations = pgTable("educations", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	applicantId: uuid("applicant_id").notNull(),
	school: text().notNull(),
	degree: text(),
	field: text(),
	startYear: text("start_year"),
	endYear: text("end_year"),
}, (table) => [
	foreignKey({
			columns: [table.applicantId],
			foreignColumns: [applicants.id],
			name: "educations_applicant_id_applicants_id_fk"
		}).onDelete("cascade"),
]);

export const applicants = pgTable("applicants", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	headline: text(),
	summary: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
	phone: text(),
	location: text(),
	portfolio: text(),
	github: text(),
	linkedin: text(),
	cvUrl: text("cv_url"),
	profilePicture: text("profile_picture"),
	twitter: text(),
	facebook: text(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "applicants_user_id_users_id_fk"
		}).onDelete("cascade"),
	unique("applicants_user_id_unique").on(table.userId),
]);

export const experiences = pgTable("experiences", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	applicantId: uuid("applicant_id").notNull(),
	company: text().notNull(),
	role: text().notNull(),
	startDate: text("start_date"),
	endDate: text("end_date"),
	description: text(),
}, (table) => [
	foreignKey({
			columns: [table.applicantId],
			foreignColumns: [applicants.id],
			name: "experiences_applicant_id_applicants_id_fk"
		}).onDelete("cascade"),
]);

export const jobs = pgTable("jobs", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	recruiterId: uuid("recruiter_id").notNull(),
	title: text().notNull(),
	description: text(),
	location: text(),
	type: text(),
	status: text().default('active'),
	totalApplicants: integer("total_applicants").default(0),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
	experienceLevel: text("experience_level"),
	salary: integer(),
	requirements: text().array(),
	company: text(),
});

export const recruiters = pgTable("recruiters", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	companyName: text("company_name"),
	website: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "recruiters_user_id_users_id_fk"
		}).onDelete("cascade"),
	unique("recruiters_user_id_unique").on(table.userId),
]);

export const users = pgTable("users", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	email: text().notNull(),
	password: text().notNull(),
	role: text().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
	firstName: text().notNull(),
	lastName: text().notNull(),
	state: text().notNull(),
	country: text().notNull(),
	yearsOfExperience: integer("years_of_experience").notNull(),
}, (table) => [
	unique("users_email_unique").on(table.email),
]);

export const subscriptions = pgTable("subscriptions", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	recruiterId: uuid("recruiter_id").notNull(),
	plan: text().notNull(),
	status: text().default('pending').notNull(),
	paystackCustomerCode: text("paystack_customer_code"),
	paystackSubscriptionCode: text("paystack_subscription_code"),
	currentPeriodEnd: timestamp("current_period_end", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.recruiterId],
			foreignColumns: [recruiters.id],
			name: "subscriptions_recruiter_id_recruiters_id_fk"
		}).onDelete("cascade"),
]);

export const cvs = pgTable("cvs", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	applicantId: uuid("applicant_id").notNull(),
	professionalSummary: text("professional_summary"),
	template: text().default('minimal'),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.applicantId],
			foreignColumns: [applicants.id],
			name: "cvs_applicant_id_applicants_id_fk"
		}).onDelete("cascade"),
	unique("cvs_applicant_id_unique").on(table.applicantId),
]);

export const projects = pgTable("projects", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	applicantId: uuid("applicant_id").notNull(),
	name: text().notNull(),
	description: text(),
	technologies: text().array(),
	link: text(),
}, (table) => [
	foreignKey({
			columns: [table.applicantId],
			foreignColumns: [applicants.id],
			name: "projects_applicant_id_applicants_id_fk"
		}).onDelete("cascade"),
]);

export const skills = pgTable("skills", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	applicantId: uuid("applicant_id").notNull(),
	name: text().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.applicantId],
			foreignColumns: [applicants.id],
			name: "skills_applicant_id_applicants_id_fk"
		}).onDelete("cascade"),
]);

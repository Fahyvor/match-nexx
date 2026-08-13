import { relations } from "drizzle-orm/relations";
import { applicants, applications, jobs, educations, users, experiences, recruiters, subscriptions, cvs, projects, skills } from "./schema";

export const applicationsRelations = relations(applications, ({one}) => ({
	applicant: one(applicants, {
		fields: [applications.applicantId],
		references: [applicants.id]
	}),
	job: one(jobs, {
		fields: [applications.jobId],
		references: [jobs.id]
	}),
}));

export const applicantsRelations = relations(applicants, ({one, many}) => ({
	applications: many(applications),
	educations: many(educations),
	user: one(users, {
		fields: [applicants.userId],
		references: [users.id]
	}),
	experiences: many(experiences),
	cvs: many(cvs),
	projects: many(projects),
	skills: many(skills),
}));

export const jobsRelations = relations(jobs, ({many}) => ({
	applications: many(applications),
}));

export const educationsRelations = relations(educations, ({one}) => ({
	applicant: one(applicants, {
		fields: [educations.applicantId],
		references: [applicants.id]
	}),
}));

export const usersRelations = relations(users, ({many}) => ({
	applicants: many(applicants),
	recruiters: many(recruiters),
}));

export const experiencesRelations = relations(experiences, ({one}) => ({
	applicant: one(applicants, {
		fields: [experiences.applicantId],
		references: [applicants.id]
	}),
}));

export const recruitersRelations = relations(recruiters, ({one, many}) => ({
	user: one(users, {
		fields: [recruiters.userId],
		references: [users.id]
	}),
	subscriptions: many(subscriptions),
}));

export const subscriptionsRelations = relations(subscriptions, ({one}) => ({
	recruiter: one(recruiters, {
		fields: [subscriptions.recruiterId],
		references: [recruiters.id]
	}),
}));

export const cvsRelations = relations(cvs, ({one}) => ({
	applicant: one(applicants, {
		fields: [cvs.applicantId],
		references: [applicants.id]
	}),
}));

export const projectsRelations = relations(projects, ({one}) => ({
	applicant: one(applicants, {
		fields: [projects.applicantId],
		references: [applicants.id]
	}),
}));

export const skillsRelations = relations(skills, ({one}) => ({
	applicant: one(applicants, {
		fields: [skills.applicantId],
		references: [applicants.id]
	}),
}));
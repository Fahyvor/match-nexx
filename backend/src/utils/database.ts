// In-memory database for demonstration
// In production, replace with actual database (PostgreSQL, MongoDB, etc.)

import type { User, UserProfile } from '../models/User';
import type { Applicant, Experience, Education, Application } from '../models/Applicant';
import type { Recruiter, Interview, JobOffer } from '../models/Recruiter';
import type { Job, JobMatch } from '../models/Job';

interface Database {
  users: Map<string, User>;
  userProfiles: Map<string, UserProfile>;
  applicants: Map<string, Applicant>;
  experiences: Map<string, Experience>;
  educations: Map<string, Education>;
  applications: Map<string, Application>;
  recruiters: Map<string, Recruiter>;
  interviews: Map<string, Interview>;
  jobOffers: Map<string, JobOffer>;
  jobs: Map<string, Job>;
  jobMatches: Map<string, JobMatch>;
}

// Initialize in-memory database
export const db: Database = {
  users: new Map(),
  userProfiles: new Map(),
  applicants: new Map(),
  experiences: new Map(),
  educations: new Map(),
  applications: new Map(),
  recruiters: new Map(),
  interviews: new Map(),
  jobOffers: new Map(),
  jobs: new Map(),
  jobMatches: new Map(),
};

// Generate unique IDs
export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Generic database helpers
export const dbHelpers = {
  // User operations
  getUserById: (id: string) => db.users.get(id),
  getUserByEmail: (email: string) => {
    for (const user of db.users.values()) {
      if (user.email === email) return user;
    }
    return undefined;
  },
  createUser: (user: User) => {
    db.users.set(user.id, user);
    return user;
  },
  updateUser: (id: string, updates: Partial<User>) => {
    const user = db.users.get(id);
    if (!user) return null;
    const updated = { ...user, ...updates, updatedAt: new Date() };
    db.users.set(id, updated);
    return updated;
  },

  // Applicant operations
  getApplicantByUserId: (userId: string) => {
    for (const applicant of db.applicants.values()) {
      if (applicant.userId === userId) return applicant;
    }
    return undefined;
  },
  getApplicantById: (id: string) => db.applicants.get(id),
  createApplicant: (applicant: Applicant) => {
    db.applicants.set(applicant.id, applicant);
    return applicant;
  },
  updateApplicant: (id: string, updates: Partial<Applicant>) => {
    const applicant = db.applicants.get(id);
    if (!applicant) return null;
    const updated = { ...applicant, ...updates, updatedAt: new Date() };
    db.applicants.set(id, updated);
    return updated;
  },

  // Experience operations
  getExperiencesByApplicant: (applicantId: string) => {
    const experiences: Experience[] = [];
    for (const exp of db.experiences.values()) {
      if (exp.applicantId === applicantId) experiences.push(exp);
    }
    return experiences;
  },
  getExperienceById: (id: string) => db.experiences.get(id),
  createExperience: (experience: Experience) => {
    db.experiences.set(experience.id, experience);
    return experience;
  },
  updateExperience: (id: string, updates: Partial<Experience>) => {
    const experience = db.experiences.get(id);
    if (!experience) return null;
    const updated = { ...experience, ...updates, updatedAt: new Date() };
    db.experiences.set(id, updated);
    return updated;
  },
  deleteExperience: (id: string) => {
    return db.experiences.delete(id);
  },

  // Education operations
  getEducationByApplicant: (applicantId: string) => {
    const educations: Education[] = [];
    for (const edu of db.educations.values()) {
      if (edu.applicantId === applicantId) educations.push(edu);
    }
    return educations;
  },
  getEducationById: (id: string) => db.educations.get(id),
  createEducation: (education: Education) => {
    db.educations.set(education.id, education);
    return education;
  },
  updateEducation: (id: string, updates: Partial<Education>) => {
    const education = db.educations.get(id);
    if (!education) return null;
    const updated = { ...education, ...updates, updatedAt: new Date() };
    db.educations.set(id, updated);
    return updated;
  },
  deleteEducation: (id: string) => {
    return db.educations.delete(id);
  },

  // Application operations
  getApplicationsByApplicant: (applicantId: string) => {
    const applications: Application[] = [];
    for (const app of db.applications.values()) {
      if (app.applicantId === applicantId) applications.push(app);
    }
    return applications;
  },
  getApplicationsByJob: (jobId: string) => {
    const applications: Application[] = [];
    for (const app of db.applications.values()) {
      if (app.jobId === jobId) applications.push(app);
    }
    return applications;
  },
  createApplication: (application: Application) => {
    db.applications.set(application.id, application);
    // Update job applicant count
    const job = db.jobs.get(application.jobId);
    if (job) {
      job.totalApplicants += 1;
    }
    return application;
  },
  updateApplication: (id: string, updates: Partial<Application>) => {
    const application = db.applications.get(id);
    if (!application) return null;
    const updated = { ...application, ...updates, updatedAt: new Date() };
    db.applications.set(id, updated);
    return updated;
  },

  // Recruiter operations
  getRecruiterByUserId: (userId: string) => {
    for (const recruiter of db.recruiters.values()) {
      if (recruiter.userId === userId) return recruiter;
    }
    return undefined;
  },
  createRecruiter: (recruiter: Recruiter) => {
    db.recruiters.set(recruiter.id, recruiter);
    return recruiter;
  },
  updateRecruiter: (id: string, updates: Partial<Recruiter>) => {
    const recruiter = db.recruiters.get(id);
    if (!recruiter) return null;
    const updated = { ...recruiter, ...updates, updatedAt: new Date() };
    db.recruiters.set(id, updated);
    return updated;
  },

  // Job operations
  getJobsByRecruiter: (recruiterId: string) => {
    const jobs: Job[] = [];
    for (const job of db.jobs.values()) {
      if (job.recruiterId === recruiterId) jobs.push(job);
    }
    return jobs;
  },
  getAllActiveJobs: () => {
    const jobs: Job[] = [];
    for (const job of db.jobs.values()) {
      if (job.status === 'active') jobs.push(job);
    }
    return jobs;
  },
  getJobById: (id: string) => db.jobs.get(id),
  createJob: (job: Job) => {
    db.jobs.set(job.id, job);
    return job;
  },
  updateJob: (id: string, updates: Partial<Job>) => {
    const job = db.jobs.get(id);
    if (!job) return null;
    const updated = { ...job, ...updates, updatedAt: new Date() };
    db.jobs.set(id, updated);
    return updated;
  },
  deleteJob: (id: string) => {
    return db.jobs.delete(id);
  },

  // Interview operations
  getInterviewsByRecruiter: (recruiterId: string) => {
    const interviews: Interview[] = [];
    for (const interview of db.interviews.values()) {
      if (interview.recruiterId === recruiterId) interviews.push(interview);
    }
    return interviews;
  },
  getInterviewsByApplicant: (applicantId: string) => {
    const interviews: Interview[] = [];
    for (const interview of db.interviews.values()) {
      if (interview.applicantId === applicantId) interviews.push(interview);
    }
    return interviews;
  },
  createInterview: (interview: Interview) => {
    db.interviews.set(interview.id, interview);
    return interview;
  },
  updateInterview: (id: string, updates: Partial<Interview>) => {
    const interview = db.interviews.get(id);
    if (!interview) return null;
    const updated = { ...interview, ...updates, updatedAt: new Date() };
    db.interviews.set(id, updated);
    return updated;
  },

  // Job Offer operations
  getOffersByApplicant: (applicantId: string) => {
    const offers: JobOffer[] = [];
    for (const offer of db.jobOffers.values()) {
      if (offer.applicantId === applicantId) offers.push(offer);
    }
    return offers;
  },
  getOffersByRecruiter: (recruiterId: string) => {
    const offers: JobOffer[] = [];
    for (const offer of db.jobOffers.values()) {
      if (offer.recruiterId === recruiterId) offers.push(offer);
    }
    return offers;
  },
  createJobOffer: (offer: JobOffer) => {
    db.jobOffers.set(offer.id, offer);
    return offer;
  },
  updateJobOffer: (id: string, updates: Partial<JobOffer>) => {
    const offer = db.jobOffers.get(id);
    if (!offer) return null;
    const updated = { ...offer, ...updates, updatedAt: new Date() };
    db.jobOffers.set(id, updated);
    return updated;
  },
};

// Export database directly for direct access if needed
export const getDb = () => db;

// Additional helper functions for getting by ID
export const getApplicantById = (id: string) => db.applicants.get(id);
export const getInterviewById = (id: string) => db.interviews.get(id);
export const getJobOfferById = (id: string) => db.jobOffers.get(id);
export const getApplicationById = (id: string) => db.applications.get(id);

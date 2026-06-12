import type { Job, CreateJobInput, UpdateJobInput } from '../models/Job';
import { jobs } from '../db/schema';
import { db } from "../db/db"

export const jobController = {
  getAllJobs: async (
    page = 1,
    limit = 20
  ): Promise<{
    success: boolean;
    data: Job[];
    total: number;
    page: number;
    limit: number;
  }> => {
    const allJobs = await db.select().from(jobs);

    const start = (page - 1) * limit;
    const end = start + limit;

    const paginatedJobs = allJobs.slice(start, end);

    return {
      success: true,
      data: paginatedJobs,
      total: allJobs.length,
      page,
      limit,
    };
  },

  getJobById: async (jobId: string) => {
    const job = Job.getJobById(jobId);

    if (!job) {
      return { success: false, error: 'Job not found' };
    }

    return { success: true, data: job };
  },

  getJobsByRecruiter: async (recruiterId: string) => {
    const jobs = dbHelpers.getJobsByRecruiter(recruiterId);
    return { success: true, data: jobs };
  },

  createJob: async (recruiterId: string, jobData: CreateJobInput) => {
    if (!jobData.title || !jobData.description) {
      return {
        success: false,
        message: 'Missing required fields',
        error: 'Title and description are required',
      };
    }

    const job: Job = {
      id: generateId(),
      recruiterId,
      title: jobData.title,
      description: jobData.description,
      company: jobData.company,
      location: jobData.location,
      locationType: jobData.locationType,
      salaryMin: jobData.salaryMin,
      salaryMax: jobData.salaryMax,
      currency: jobData.currency,
      jobType: jobData.jobType,
      skills: jobData.skills || [],
      requirements: jobData.requirements || [],
      benefits: jobData.benefits,
      experienceLevel: jobData.experienceLevel,
      applicationDeadline: jobData.applicationDeadline,
      status: 'active',
      totalApplicants: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const createdJob = dbHelpers.createJob(job);

    return {
      success: true,
      message: 'Job created successfully',
      data: createdJob,
    };
  },

  updateJob: async (jobId: string, recruiterId: string, updates: UpdateJobInput) => {
    const job = dbHelpers.getJobById(jobId);

    if (!job) {
      return { success: false, message: 'Job not found', error: 'Job does not exist' };
    }

    if (job.recruiterId !== recruiterId) {
      return {
        success: false,
        message: 'Unauthorized',
        error: 'You can only update your own jobs',
      };
    }

    const updatedJob = dbHelpers.updateJob(jobId, updates);

    return {
      success: true,
      message: 'Job updated successfully',
      data: updatedJob || undefined,
    };
  },

  closeJob: async (jobId: string, recruiterId: string) => {
    const job = dbHelpers.getJobById(jobId);

    if (!job) {
      return { success: false, message: 'Job not found', error: 'Job does not exist' };
    }

    if (job.recruiterId !== recruiterId) {
      return {
        success: false,
        message: 'Unauthorized',
        error: 'You can only close your own jobs',
      };
    }

    dbHelpers.updateJob(jobId, { status: 'closed' });

    return {
      success: true,
      message: 'Job closed successfully',
    };
  },

  deleteJob: async (jobId: string, recruiterId: string) => {
    const job = dbHelpers.getJobById(jobId);

    if (!job) {
      return { success: false, message: 'Job not found', error: 'Job does not exist' };
    }

    if (job.recruiterId !== recruiterId) {
      return {
        success: false,
        message: 'Unauthorized',
        error: 'You can only delete your own jobs',
      };
    }

    dbHelpers.deleteJob(jobId);

    return {
      success: true,
      message: 'Job deleted successfully',
    };
  },

  searchJobs: async (
    query: string,
    filters?: {
      location?: string;
      jobType?: string;
      salaryMin?: number;
      salaryMax?: number;
    }
  ) => {
    let results = dbHelpers.getAllActiveJobs();

    const lowerQuery = query?.toLowerCase() || '';

    // Search
    if (lowerQuery) {
      results = results.filter(
        job =>
          job.title?.toLowerCase().includes(lowerQuery) ||
          job.description?.toLowerCase().includes(lowerQuery) ||
          job.company?.toLowerCase().includes(lowerQuery)
      );
    }

    // Filters (SAFE optional chaining)
    if (filters?.location) {
      const loc = filters.location.toLowerCase();
      results = results.filter(
        job => job.location?.toLowerCase().includes(loc)
      );
    }

    if (filters?.jobType) {
      results = results.filter(job => job.jobType === filters.jobType);
    }

    if (filters?.salaryMin !== undefined) {
      results = results.filter(
        job => job.salaryMax === undefined || job.salaryMax >= filters.salaryMin!
      );
    }

    if (filters?.salaryMax !== undefined) {
      results = results.filter(
        job => job.salaryMin === undefined || job.salaryMin <= filters.salaryMax!
      );
    }

    return {
      success: true,
      data: results,
    };
  },
};
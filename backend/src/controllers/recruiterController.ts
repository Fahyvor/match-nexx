// Recruiter Controller
import { dbHelpers, generateId } from '../utils/database';
import type {
  Recruiter,
  Interview,
  JobOffer,
  CreateRecruiterInput,
  UpdateRecruiterInput,
  CreateInterviewInput,
  CreateJobOfferInput,
} from '../models/Recruiter';

export const recruiterController = {
  // Get recruiter profile
  getProfile: async (userId: string): Promise<{
    success: boolean;
    data?: Recruiter;
    error?: string;
  }> => {
    const recruiter = dbHelpers.getRecruiterByUserId(userId);

    if (!recruiter) {
      return { success: false, error: 'Recruiter profile not found' };
    }

    return { success: true, data: recruiter };
  },

  // Create recruiter profile
  createProfile: async (userId: string, data: CreateRecruiterInput): Promise<{
    success: boolean;
    message: string;
    data?: Recruiter;
    error?: string;
  }> => {
    const existingRecruiter = dbHelpers.getRecruiterByUserId(userId);

    if (existingRecruiter) {
      return {
        success: false,
        message: 'Profile already exists',
        error: 'Recruiter already has a profile',
      };
    }

    const recruiter: Recruiter = {
      id: generateId(),
      userId,
      companyName: data.companyName,
      companyWebsite: data.companyWebsite,
      industry: data.industry,
      companySize: data.companySize,
      phone: data.phone,
      address: data.address,
      city: data.city,
      country: data.country,
      logo: data.logo,
      description: data.description,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const createdRecruiter = dbHelpers.createRecruiter(recruiter);

    return {
      success: true,
      message: 'Profile created successfully',
      data: createdRecruiter,
    };
  },

  // Update recruiter profile
  updateProfile: async (userId: string, updates: UpdateRecruiterInput): Promise<{
    success: boolean;
    message: string;
    data?: Recruiter;
    error?: string;
  }> => {
    const recruiter = dbHelpers.getRecruiterByUserId(userId);

    if (!recruiter) {
      return { success: false, message: 'Profile not found', error: 'Recruiter profile does not exist' };
    }

    const updatedRecruiter = dbHelpers.updateRecruiter(recruiter.id, updates);

    return {
      success: true,
      message: 'Profile updated successfully',
      data: updatedRecruiter || undefined,
    };
  },

  // Get recruiter dashboard stats
  getDashboard: async (userId: string): Promise<{
    success: boolean;
    data?: {
      activeJobs: number;
      totalApplicants: number;
      scheduledInterviews: number;
      offersExtended: number;
      recentApplications: Array<{
        id: string;
        applicantId: string;
        jobId: string;
        status: string;
        appliedAt: Date;
      }>;
      upcomingInterviews: Array<{
        id: string;
        title: string;
        scheduledAt: Date;
        duration: number;
      }>;
    };
    error?: string;
  }> => {
    const recruiter = dbHelpers.getRecruiterByUserId(userId);

    if (!recruiter) {
      return { success: false, error: 'Recruiter profile not found' };
    }

    const jobs = dbHelpers.getJobsByRecruiter(recruiter.id);
    const activeJobs = jobs.filter(j => j.status === 'active').length;

    const applications: Array<{
      id: string;
      applicantId: string;
      jobId: string;
      status: string;
      appliedAt: Date;
    }> = [];
    let totalApplicants = 0;
    jobs.forEach(job => {
      const jobApps = dbHelpers.getApplicationsByJob(job.id);
      applications.push(...jobApps);
      totalApplicants += jobApps.length;
    });

    const interviews = dbHelpers.getInterviewsByRecruiter(recruiter.id);
    const scheduledInterviews = interviews.filter(i => i.status === 'scheduled').length;
    const upcomingInterviews = interviews
      .filter(i => i.status === 'scheduled' && new Date(i.scheduledAt) > new Date())
      .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
      .slice(0, 5);

    const offers = dbHelpers.getOffersByRecruiter(recruiter.id);
    const offersExtended = offers.filter(o => o.status === 'pending').length;

    const recentApplications = applications
      .sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime())
      .slice(0, 10);

    return {
      success: true,
      data: {
        activeJobs,
        totalApplicants,
        scheduledInterviews,
        offersExtended,
        recentApplications,
        upcomingInterviews,
      },
    };
  },

  // Get all candidates (applicants who applied to recruiter's jobs)
  getCandidates: async (userId: string, filter?: { status?: string }): Promise<{
    success: boolean;
    data: Array<{ id: string; name?: string; email?: string; headline?: string; skills: string[]; applications: Array<{ id: string; jobId: string; status: string; appliedAt: Date }> }>;
  }> => {
    const recruiter = dbHelpers.getRecruiterByUserId(userId);

    if (!recruiter) {
      return { success: true, data: [] };
    }

    const jobs = dbHelpers.getJobsByRecruiter(recruiter.id);
    const candidates = new Map<string, { id: string; name?: string; email?: string; headline?: string; skills: string[]; applications: Array<{ id: string; jobId: string; status: string; appliedAt: Date }> }>();

    jobs.forEach(job => {
      const applications = dbHelpers.getApplicationsByJob(job.id);
      applications.forEach(app => {
        if (!filter?.status || app.status === filter.status) {
          if (!candidates.has(app.applicantId)) {
            const applicant = dbHelpers.getApplicantById(app.applicantId);
            if (applicant) {
              const user = dbHelpers.getUserById(applicant.userId);
              candidates.set(app.applicantId, {
                id: applicant.id,
                name: user?.name,
                email: user?.email,
                headline: applicant.headline,
                skills: applicant.skills,
                applications: [app],
              });
            }
          } else {
            const existing = candidates.get(app.applicantId);
            if (existing) {
              existing.applications.push(app);
            }
          }
        }
      });
    });

    return {
      success: true,
      data: Array.from(candidates.values()),
    };
  },

  // Get candidate details
  getCandidateDetails: async (userId: string, candidateId: string): Promise<{
    success: boolean;
    data?: {
      id: string;
      name?: string;
      email?: string;
      headline?: string;
      bio?: string;
      skills: string[];
      phone?: string;
      portfolio?: string;
      applications: Array<{ id: string; jobId: string; status: string; appliedAt: Date }>;
      experiences: Array<{ id: string; title: string; company: string; startDate: Date; endDate?: Date }>;
      educations: Array<{ id: string; school: string; degree: string; field: string; startDate: Date; endDate?: Date }>;
    };
    error?: string;
  }> => {
    const recruiter = dbHelpers.getRecruiterByUserId(userId);

    if (!recruiter) {
      return { success: false, error: 'Recruiter profile not found' };
    }

    const applicant = dbHelpers.getApplicantById(candidateId);

    if (!applicant) {
      return { success: false, error: 'Candidate not found' };
    }

    const user = dbHelpers.getUserById(applicant.userId);
    const applications = dbHelpers.getApplicationsByApplicant(applicant.id);
    const experiences = dbHelpers.getExperiencesByApplicant(applicant.id);
    const educations = dbHelpers.getEducationByApplicant(applicant.id);

    return {
      success: true,
      data: {
        id: applicant.id,
        name: user?.name,
        email: user?.email,
        headline: applicant.headline,
        bio: applicant.bio,
        skills: applicant.skills,
        phone: applicant.phone,
        portfolio: applicant.portfolio,
        applications,
        experiences,
        educations,
      },
    };
  },

  // Schedule interview
  scheduleInterview: async (
    userId: string,
    data: CreateInterviewInput
  ): Promise<{
    success: boolean;
    message: string;
    data?: Interview;
    error?: string;
  }> => {
    const recruiter = dbHelpers.getRecruiterByUserId(userId);

    if (!recruiter) {
      return { success: false, message: 'Recruiter not found', error: 'Recruiter profile does not exist' };
    }

    const interview: Interview = {
      id: generateId(),
      jobId: data.jobId,
      applicantId: data.applicantId,
      recruiterId: recruiter.id,
      title: data.title,
      description: data.description,
      scheduledAt: data.scheduledAt,
      duration: data.duration,
      meetingLink: data.meetingLink,
      status: 'scheduled',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const createdInterview = dbHelpers.createInterview(interview);

    return {
      success: true,
      message: 'Interview scheduled successfully',
      data: createdInterview,
    };
  },

  // Update interview
  updateInterview: async (
    userId: string,
    interviewId: string,
    updates: Partial<Interview>
  ): Promise<{
    success: boolean;
    message: string;
    data?: Interview;
    error?: string;
  }> => {
    const recruiter = dbHelpers.getRecruiterByUserId(userId);

    if (!recruiter) {
      return { success: false, message: 'Recruiter not found', error: 'Recruiter profile does not exist' };
    }

    const interview = dbHelpers.getInterviewById(interviewId);

    if (!interview || interview.recruiterId !== recruiter.id) {
      return { success: false, message: 'Interview not found', error: 'Interview does not exist' };
    }

    const updated = dbHelpers.updateInterview(interviewId, updates);

    return {
      success: true,
      message: 'Interview updated successfully',
      data: updated || undefined,
    };
  },

  // Send job offer
  sendOffer: async (
    userId: string,
    data: CreateJobOfferInput
  ): Promise<{
    success: boolean;
    message: string;
    data?: JobOffer;
    error?: string;
  }> => {
    const recruiter = dbHelpers.getRecruiterByUserId(userId);

    if (!recruiter) {
      return { success: false, message: 'Recruiter not found', error: 'Recruiter profile does not exist' };
    }

    const offer: JobOffer = {
      id: generateId(),
      jobId: data.jobId,
      applicantId: data.applicantId,
      recruiterId: recruiter.id,
      title: data.title,
      description: data.description,
      salary: data.salary,
      currency: data.currency,
      startDate: data.startDate,
      benefits: data.benefits,
      status: 'pending',
      expiresAt: data.expiresAt,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const createdOffer = dbHelpers.createJobOffer(offer);

    // Update application status to shortlisted
    const applications = dbHelpers.getApplicationsByApplicant(data.applicantId);
    const jobApplication = applications.find(a => a.jobId === data.jobId);
    if (jobApplication) {
      dbHelpers.updateApplication(jobApplication.id, { status: 'shortlisted' });
    }

    return {
      success: true,
      message: 'Job offer sent successfully',
      data: createdOffer,
    };
  },

  // Update offer status
  updateOfferStatus: async (
    userId: string,
    offerId: string,
    status: 'accepted' | 'rejected' | 'withdrawn'
  ): Promise<{
    success: boolean;
    message: string;
    data?: JobOffer;
    error?: string;
  }> => {
    const recruiter = dbHelpers.getRecruiterByUserId(userId);

    if (!recruiter) {
      return { success: false, message: 'Recruiter not found', error: 'Recruiter profile does not exist' };
    }

    const offer = dbHelpers.getJobOfferById(offerId);

    if (!offer || offer.recruiterId !== recruiter.id) {
      return { success: false, message: 'Offer not found', error: 'Offer does not exist' };
    }

    const updated = dbHelpers.updateJobOffer(offerId, { status });

    return {
      success: true,
      message: 'Offer status updated successfully',
      data: updated || undefined,
    };
  },

  // Update application status
  updateApplicationStatus: async (
    userId: string,
    applicationId: string,
    status: 'reviewing' | 'shortlisted' | 'rejected'
  ): Promise<{
    success: boolean;
    message: string;
    error?: string;
  }> => {
    const recruiter = dbHelpers.getRecruiterByUserId(userId);

    if (!recruiter) {
      return { success: false, message: 'Recruiter not found', error: 'Recruiter profile does not exist' };
    }

    const application = dbHelpers.getApplicationById(applicationId);

    if (!application) {
      return { success: false, message: 'Application not found', error: 'Application does not exist' };
    }

    dbHelpers.updateApplication(applicationId, { status });

    return {
      success: true,
      message: 'Application status updated successfully',
    };
  },
};

import type {
  Applicant,
  Experience,
  Education,
  Application,
  CreateApplicantInput,
  UpdateApplicantInput,
  CreateExperienceInput,
  CreateEducationInput,
} from '../models/Applicant';

export const applicantController = {
  // Get applicant profile
  getProfile: async (userId: string): Promise<{
    success: boolean;
    data?: Applicant;
    error?: string;
  }> => {
    const applicant = dbHelpers.getApplicantByUserId(userId);

    if (!applicant) {
      return { success: false, error: 'Applicant profile not found' };
    }

    return { success: true, data: applicant };
  },

  // Create applicant profile
  createProfile: async (userId: string, data: CreateApplicantInput): Promise<{
    success: boolean;
    message: string;
    data?: Applicant;
    error?: string;
  }> => {
    const existingApplicant = dbHelpers.getApplicantByUserId(userId);

    if (existingApplicant) {
      return {
        success: false,
        message: 'Profile already exists',
        error: 'Applicant already has a profile',
      };
    }

    const applicant: Applicant = {
      id: generateId(),
      userId,
      headline: data.headline,
      bio: data.bio,
      location: data.location,
      phone: data.phone,
      portfolio: data.portfolio,
      resume: data.resume,
      skills: data.skills || [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const createdApplicant = dbHelpers.createApplicant(applicant);

    return {
      success: true,
      message: 'Profile created successfully',
      data: createdApplicant,
    };
  },

  // Update applicant profile
  updateProfile: async (userId: string, updates: UpdateApplicantInput): Promise<{
    success: boolean;
    message: string;
    data?: Applicant;
    error?: string;
  }> => {
    const applicant = dbHelpers.getApplicantByUserId(userId);

    if (!applicant) {
      return { success: false, message: 'Profile not found', error: 'Applicant profile does not exist' };
    }

    const updatedApplicant = dbHelpers.updateApplicant(applicant.id, updates);

    return {
      success: true,
      message: 'Profile updated successfully',
      data: updatedApplicant || undefined,
    };
  },

  // Get user applications
  getApplications: async (userId: string): Promise<{
    success: boolean;
    data: (Application & { jobTitle?: string; company?: string })[];
  }> => {
    const applicant = dbHelpers.getApplicantByUserId(userId);

    if (!applicant) {
      return { success: true, data: [] };
    }

    const applications = dbHelpers.getApplicationsByApplicant(applicant.id);
    const enrichedApplications = applications.map(app => {
      const job = dbHelpers.getJobById(app.jobId);
      return {
        ...app,
        jobTitle: job?.title,
        company: job?.company,
      };
    });

    return { success: true, data: enrichedApplications };
  },

  // Apply for a job
  applyForJob: async (
    userId: string,
    jobId: string,
    coverLetter?: string
  ): Promise<{
    success: boolean;
    message: string;
    data?: Application;
    error?: string;
  }> => {
    const applicant = dbHelpers.getApplicantByUserId(userId);

    if (!applicant) {
      return { success: false, message: 'Profile required', error: 'Create an applicant profile first' };
    }

    const job = dbHelpers.getJobById(jobId);

    if (!job) {
      return { success: false, message: 'Job not found', error: 'Job does not exist' };
    }

    // Check if already applied
    const applications = dbHelpers.getApplicationsByApplicant(applicant.id);
    const alreadyApplied = applications.some(app => app.jobId === jobId);

    if (alreadyApplied) {
      return { success: false, message: 'Already applied', error: 'You have already applied for this job' };
    }

    const application: Application = {
      id: generateId(),
      applicantId: applicant.id,
      jobId,
      status: 'pending',
      coverLetter,
      appliedAt: new Date(),
      updatedAt: new Date(),
    };

    const createdApplication = dbHelpers.createApplication(application);

    return {
      success: true,
      message: 'Application submitted successfully',
      data: createdApplication,
    };
  },

  // Withdraw application
  withdrawApplication: async (userId: string, applicationId: string): Promise<{
    success: boolean;
    message: string;
    error?: string;
  }> => {
    const applicant = dbHelpers.getApplicantByUserId(userId);

    if (!applicant) {
      return { success: false, message: 'Profile not found', error: 'Applicant profile does not exist' };
    }

    const application = dbHelpers.getApplicationsByApplicant(applicant.id).find(
      app => app.id === applicationId
    );

    if (!application) {
      return { success: false, message: 'Application not found', error: 'Application does not exist' };
    }

    dbHelpers.updateApplication(applicationId, { status: 'withdrawn' });

    return {
      success: true,
      message: 'Application withdrawn successfully',
    };
  },

  // Add experience
  addExperience: async (userId: string, data: CreateExperienceInput): Promise<{
    success: boolean;
    message: string;
    data?: Experience;
    error?: string;
  }> => {
    const applicant = dbHelpers.getApplicantByUserId(userId);

    if (!applicant) {
      return { success: false, message: 'Profile not found', error: 'Applicant profile does not exist' };
    }

    const experience: Experience = {
      id: generateId(),
      applicantId: applicant.id,
      title: data.title,
      company: data.company,
      location: data.location,
      description: data.description,
      startDate: data.startDate,
      endDate: data.endDate,
      current: data.current,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const createdExperience = dbHelpers.createExperience(experience);

    return {
      success: true,
      message: 'Experience added successfully',
      data: createdExperience,
    };
  },

  // Update experience
  updateExperience: async (userId: string, experienceId: string, updates: Partial<Experience>): Promise<{
    success: boolean;
    message: string;
    data?: Experience;
    error?: string;
  }> => {
    const applicant = dbHelpers.getApplicantByUserId(userId);

    if (!applicant) {
      return { success: false, message: 'Profile not found', error: 'Applicant profile does not exist' };
    }

    const experience = dbHelpers.getExperienceById(experienceId);

    if (!experience || experience.applicantId !== applicant.id) {
      return { success: false, message: 'Experience not found', error: 'Experience does not exist' };
    }

    const updated = dbHelpers.updateExperience(experienceId, updates);

    return {
      success: true,
      message: 'Experience updated successfully',
      data: updated || undefined,
    };
  },

  // Delete experience
  deleteExperience: async (userId: string, experienceId: string): Promise<{
    success: boolean;
    message: string;
    error?: string;
  }> => {
    const applicant = dbHelpers.getApplicantByUserId(userId);

    if (!applicant) {
      return { success: false, message: 'Profile not found', error: 'Applicant profile does not exist' };
    }

    const experience = dbHelpers.getExperienceById(experienceId);

    if (!experience || experience.applicantId !== applicant.id) {
      return { success: false, message: 'Experience not found', error: 'Experience does not exist' };
    }

    dbHelpers.deleteExperience(experienceId);

    return {
      success: true,
      message: 'Experience deleted successfully',
    };
  },

  // Add education
  addEducation: async (userId: string, data: CreateEducationInput): Promise<{
    success: boolean;
    message: string;
    data?: Education;
    error?: string;
  }> => {
    const applicant = dbHelpers.getApplicantByUserId(userId);

    if (!applicant) {
      return { success: false, message: 'Profile not found', error: 'Applicant profile does not exist' };
    }

    const education: Education = {
      id: generateId(),
      applicantId: applicant.id,
      school: data.school,
      degree: data.degree,
      field: data.field,
      startDate: data.startDate,
      endDate: data.endDate,
      grade: data.grade,
      description: data.description,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const createdEducation = dbHelpers.createEducation(education);

    return {
      success: true,
      message: 'Education added successfully',
      data: createdEducation,
    };
  },

  // Update education
  updateEducation: async (userId: string, educationId: string, updates: Partial<Education>): Promise<{
    success: boolean;
    message: string;
    data?: Education;
    error?: string;
  }> => {
    const applicant = dbHelpers.getApplicantByUserId(userId);

    if (!applicant) {
      return { success: false, message: 'Profile not found', error: 'Applicant profile does not exist' };
    }

    const education = dbHelpers.getEducationById(educationId);

    if (!education || education.applicantId !== applicant.id) {
      return { success: false, message: 'Education not found', error: 'Education does not exist' };
    }

    const updated = dbHelpers.updateEducation(educationId, updates);

    return {
      success: true,
      message: 'Education updated successfully',
      data: updated || undefined,
    };
  },

  // Delete education
  deleteEducation: async (userId: string, educationId: string): Promise<{
    success: boolean;
    message: string;
    error?: string;
  }> => {
    const applicant = dbHelpers.getApplicantByUserId(userId);

    if (!applicant) {
      return { success: false, message: 'Profile not found', error: 'Applicant profile does not exist' };
    }

    const education = dbHelpers.getEducationById(educationId);

    if (!education || education.applicantId !== applicant.id) {
      return { success: false, message: 'Education not found', error: 'Education does not exist' };
    }

    dbHelpers.deleteEducation(educationId);

    return {
      success: true,
      message: 'Education deleted successfully',
    };
  },
};

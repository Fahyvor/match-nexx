// Applicant model interface
export interface Applicant {
  id: string;
  userId: string;
  headline?: string;
  bio?: string;
  location?: string;
  phone?: string;
  portfolio?: string;
  resume?: string;
  skills: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Experience {
  id: string;
  applicantId: string;
  title: string;
  company: string;
  location?: string;
  description?: string;
  startDate: Date;
  endDate?: Date;
  current: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Education {
  id: string;
  applicantId: string;
  school: string;
  degree: string;
  field: string;
  startDate: Date;
  endDate?: Date;
  grade?: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Application {
  id: string;
  applicantId: string;
  jobId: string;
  status: 'pending' | 'reviewing' | 'shortlisted' | 'rejected' | 'accepted' | 'withdrawn';
  coverLetter?: string;
  appliedAt: Date;
  updatedAt: Date;
}

export type CreateApplicantInput = Omit<Applicant, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateApplicantInput = Partial<Omit<Applicant, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>;

export type CreateExperienceInput = Omit<Experience, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateExperienceInput = Partial<Omit<Experience, 'id' | 'applicantId' | 'createdAt' | 'updatedAt'>>;

export type CreateEducationInput = Omit<Education, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateEducationInput = Partial<Omit<Education, 'id' | 'applicantId' | 'createdAt' | 'updatedAt'>>;

export type CreateApplicationInput = Omit<Application, 'id' | 'appliedAt' | 'updatedAt'>;
export type UpdateApplicationInput = Partial<Pick<Application, 'status'>>;

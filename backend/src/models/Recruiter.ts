// Recruiter model interface
export interface Recruiter {
  id: string;
  userId: string;
  companyName: string;
  companyWebsite?: string;
  industry?: string;
  companySize?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  logo?: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface RecruiterVerification {
  id: string;
  recruiterId: string;
  verificationToken: string;
  verified: boolean;
  verifiedAt?: Date;
  expiresAt: Date;
  createdAt: Date;
}

export interface Interview {
  id: string;
  jobId: string;
  applicantId: string;
  recruiterId: string;
  title: string;
  description?: string;
  scheduledAt: Date;
  duration: number; // in minutes
  meetingLink?: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  feedback?: string;
  rating?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface JobOffer {
  id: string;
  jobId: string;
  applicantId: string;
  recruiterId: string;
  title: string;
  description?: string;
  salary: number;
  currency: string;
  startDate?: Date;
  benefits?: string[];
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn';
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type CreateRecruiterInput = Omit<Recruiter, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateRecruiterInput = Partial<Omit<Recruiter, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>;

export type CreateInterviewInput = Omit<Interview, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateInterviewInput = Partial<Pick<Interview, 'status' | 'feedback' | 'rating' | 'meetingLink'>>;

export type CreateJobOfferInput = Omit<JobOffer, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateJobOfferInput = Partial<Pick<JobOffer, 'status'>>;

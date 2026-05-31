// Job model interface
export interface Job {
  id: string;
  recruiterId: string;
  title: string;
  description: string;
  company: string;
  location: string;
  locationType: 'remote' | 'onsite' | 'hybrid';
  salaryMin?: number;
  salaryMax?: number;
  currency: string;
  jobType: 'full-time' | 'part-time' | 'contract' | 'internship';
  skills: string[];
  requirements: string[];
  benefits?: string[];
  experienceLevel: 'entry' | 'mid' | 'senior' | 'lead';
  applicationDeadline?: Date;
  status: 'draft' | 'active' | 'closed' | 'archived';
  totalApplicants: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export interface JobMatch {
  id: string;
  jobId: string;
  applicantId: string;
  matchScore: number; // 0-100
  matchReasons: string[];
  createdAt: Date;
  updatedAt: Date;
}

export type CreateJobInput = Omit<Job, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'totalApplicants'>;
export type UpdateJobInput = Partial<Omit<Job, 'id' | 'recruiterId' | 'createdAt' | 'updatedAt' | 'totalApplicants'>>;

export type CreateJobMatchInput = Omit<JobMatch, 'id' | 'createdAt' | 'updatedAt'>;

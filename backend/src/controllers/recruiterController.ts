import { db } from '../db/db';
import { recruiters, jobs, applications } from '../db/schema';
import { eq } from 'drizzle-orm';

export const recruiterController = {
  // Get recruiter profile
  getProfile: async (userId: string) => {
    try {
      const recruiter = await db.query.recruiters.findFirst({
        where: eq(recruiters.userId, userId),
      });

      if (!recruiter) {
        return { success: false, error: 'Recruiter profile not found' };
      }

      return { success: true, data: recruiter };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  },

  // Get recruiter dashboard stats
  getDashboard: async (userId: string) => {
    try {
      const recruiterJobs = await db.select().from(jobs).where(eq(jobs.recruiterId, userId));
      const activeJobs = recruiterJobs.filter((j: any) => j.status === 'active').length;
      const totalApplicants = recruiterJobs.reduce((sum: number, j: any) => sum + (j.totalApplicants || 0), 0);

      return {
        success: true,
        data: {
          activeJobs,
          totalApplicants,
          scheduledInterviews: 0,
          offersExtended: 0,
          jobs: recruiterJobs,
        },
      };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  },
};

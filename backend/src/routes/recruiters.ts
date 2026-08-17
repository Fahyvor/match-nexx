import { Elysia, t } from 'elysia';
import { authMiddleware } from '../middlewares/auth';
import { requireActiveSubscription } from '../middlewares/requireActiveSubscription';
import { authController } from '../controllers/authController';
import { jobController } from '../controllers/jobController';

export default new Elysia({ prefix: '/recruiters' })
  .use(authMiddleware(['recruiter', 'admin']))

  .get('/dashboard', async ({ user }) => {
    const jobsRes = await jobController.getJobsByRecruiter(user.sub);
    const jobsList = jobsRes.data || [];
    return {
      success: true,
      data: {
        activeJobs: jobsList.filter((j: any) => j.status === 'active').length,
        totalApplicants: jobsRes.totalApplicants || 0,
        scheduledInterviews: 0,
        offersExtended: 0,
        jobs: jobsList,
      },
    };
  })

  .get('/profile', async ({ user }) => {
    return authController.getSingleUser({ id: user.sub });
  })

  .put('/profile', async ({ body }) => {
    return {
      success: true,
      message: 'Profile updated successfully',
      data: body,
    };
  })

  // Candidates listing - Requires active payment subscription
  .use(
    new Elysia()
      .use(authMiddleware(['recruiter', 'admin']))
      .use(requireActiveSubscription)
      .get('/candidates', async () => authController.getAllApplicants())
      .get('/candidates/:id', async ({ params }) => authController.getSingleUser({ id: params.id }))
  )

  .post('/candidates/:id/interview', async ({ params, body }) => {
    return {
      success: true,
      message: 'Interview scheduled successfully',
      data: {
        candidateId: params.id,
        scheduledAt: body.scheduledAt,
        interviewType: body.interviewType,
      },
    };
  }, {
    body: t.Object({
      scheduledAt: t.String(),
      interviewType: t.String(),
    }),
  })

  .post('/candidates/:id/offer', async ({ params, body }) => {
    return {
      success: true,
      message: 'Offer sent successfully',
      data: {
        candidateId: params.id,
        offerDetails: body,
      },
    };
  });

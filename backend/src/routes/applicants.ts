import { Elysia, t } from 'elysia';
import { authMiddleware } from '../middlewares/auth';

export default new Elysia({ prefix: '/applicants' })
  .use(authMiddleware(["admin", "recruiter"]))
  .get('/all-applicants', async () => {
    return {
      success: true,
      data: [],
    };
  })

  .get('/profile', async () => {
    // TODO: Fetch current user's applicant profile
    return {
      success: true,
      data: {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        profile: {
          bio: '',
          skills: [],
          experience: [],
          education: []
        }
      }
    };
  })

  .put('/profile', async ({ body }) => {
    // TODO: Update applicant profile
    return {
      success: true,
      message: 'Profile updated successfully',
      data: body
    };
  })

  .get('/applications', async () => {
    // TODO: Fetch user's applications
    return {
      success: true,
      data: [
        {
          id: '1',
          jobId: '1',
          jobTitle: 'Senior Frontend Engineer',
          company: 'TechCorp',
          status: 'reviewing',
          appliedAt: new Date().toISOString()
        }
      ]
    };
  })

  .post('/applications', async ({ body }) => {
    // TODO: Submit job application
    return {
      success: true,
      message: 'Application submitted successfully',
      data: {
        id: '1',
        jobId: body.jobId,
        status: 'pending',
        appliedAt: new Date().toISOString()
      }
    };
  }, {
    body: t.Object({
      jobId: t.String()
    })
  });

import { Elysia } from 'elysia';
import { swagger } from '@elysiajs/swagger';
import { bearer } from '@elysiajs/bearer';
import { staticPlugin } from '@elysiajs/static';
import path from 'path';
import dotenv from "dotenv";

dotenv.config();

// Import routes
import authRoutes from './routes/auth';
import jobRoutes from './routes/jobs';
import applicantRoutes from './routes/applicants';
import recruiterRoutes from './routes/recruiters';

const PORT = parseInt(process.env.PORT || '3000', 10);
const isProd = process.env.NODE_ENV === 'production';

const app = new Elysia()
  .use(swagger())
  .use(bearer())

  .group('/api', app =>
    app
    .get('/health', () => ({
      status: 'online',
      message: 'Server is healthy',
      version: '1.0.0'
    }))
    .use(authRoutes)
    .use(jobRoutes)
    .use(applicantRoutes)
    .use(recruiterRoutes)
)

if (isProd) {
  app.use(
    staticPlugin({
      assets: path.join(process.cwd(), '../dist'),
      prefix: '/',
    })
  );

  // SPA fallback (PROD ONLY)
  app.get('*', async () => {
    const indexPath = path.join(process.cwd(), '../dist/index.html');

    try {
      const html = await Bun.file(indexPath).text();
      return new Response(html, {
        headers: {
          'Content-Type': 'text/html'
        }
      });
    } catch {
      return new Response('Not found', { status: 404 });
    }
  });
}

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`Swagger documentation: http://localhost:${PORT}/swagger`);

  if (isProd) {
    console.log(`Frontend: http://localhost:${PORT}`);
  } else {
    console.log(`Frontend: http://localhost:5173`);
  }
});

export default app;
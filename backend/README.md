# Recruiter API - Elysia Backend

A high-performance REST API built with Elysia for the Recruiter platform.

## 🚀 Quick Start

### Prerequisites
- Bun (v1.0+) - [Install Bun](https://bun.sh)
- Node.js 18+ (optional, for compatibility)

### Installation

```bash
# From the project root
npm run install:backend

# Or directly
cd backend && bun install
```

### Development

```bash
# Start backend server only
npm run dev:backend

# Or from the backend directory
cd backend && bun run dev
```

The API will be available at `http://localhost:3001`

### Production

```bash
# Build the backend
npm run build:backend

# Start the production server
cd backend && bun run start
```

## 📚 API Documentation

Once the server is running, visit:
- **Swagger UI**: http://localhost:3001/swagger
- **Health Check**: http://localhost:3001/health

## 🔌 API Endpoints

### Authentication (`/api/auth`)
- `POST /register` - Register a new user
- `POST /login` - Login user
- `POST /logout` - Logout user
- `POST /refresh-token` - Refresh JWT token

### Jobs (`/api/jobs`)
- `GET /` - List all jobs
- `GET /:id` - Get job details
- `POST /` - Create new job (authenticated)
- `PUT /:id` - Update job (authenticated)
- `DELETE /:id` - Delete job (authenticated)

### Applicants (`/api/applicants`)
- `GET /profile` - Get applicant profile
- `PUT /profile` - Update applicant profile
- `GET /applications` - List user applications
- `POST /applications` - Submit application

### Recruiters (`/api/recruiters`)
- `GET /dashboard` - Get recruiter dashboard stats
- `GET /profile` - Get recruiter profile
- `PUT /profile` - Update recruiter profile
- `GET /candidates` - List all candidates
- `GET /candidates/:id` - Get candidate details
- `POST /candidates/:id/interview` - Schedule interview
- `POST /candidates/:id/offer` - Send job offer

## 🔐 Authentication

The API uses JWT bearer tokens for authentication. Include the token in the Authorization header:

```
Authorization: Bearer your-jwt-token
```

## 🌍 CORS

CORS is enabled by default. Configure the allowed origins in the environment variables.

## 📝 Environment Variables

Create a `.env` file based on `.env.example`:

```env
PORT=3001
NODE_ENV=development
JWT_SECRET=your-secret-key-change-in-production
FRONTEND_URL=http://localhost:5173
DATABASE_URL=
```

## 📂 Project Structure

```
backend/
├── src/
│   ├── index.ts           # Main server file
│   ├── routes/            # API route handlers
│   │   ├── auth.ts
│   │   ├── jobs.ts
│   │   ├── applicants.ts
│   │   └── recruiters.ts
│   ├── controllers/       # Business logic
│   ├── models/            # Data models
│   └── utils/             # Utility functions
├── package.json
├── tsconfig.json
└── .env.example
```

## 🛠️ Development

### Adding a New Route

1. Create a new file in `src/routes/`
2. Define your routes using Elysia
3. Export the router
4. Import and use it in `src/index.ts`

Example:
```typescript
import { Elysia } from 'elysia';

export default new Elysia({ prefix: '/example' })
  .get('/', () => ({ message: 'Hello' }))
```

## 📦 Dependencies

- **elysia** - Modern web framework
- **@elysiajs/swagger** - Swagger documentation
- **@elysiajs/bearer** - Bearer token authentication
- **typescript** - Type safety

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Change the port in .env or use:
PORT=3002 bun run dev
```

### Module Not Found Errors
```bash
# Reinstall dependencies
cd backend && bun install --force
```

## 📄 License

MIT

## 🤝 Contributing

Please follow the existing code structure and add tests for new features.

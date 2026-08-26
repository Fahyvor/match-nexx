# Stage 1: Build Frontend and Backend
FROM docker.io/oven/bun:1-alpine AS builder

WORKDIR /app

# Copy dependency files
COPY package.json bun.lock ./
COPY backend/package.json backend/bun.lock ./backend/

# Install dependencies
RUN bun install --frozen-lockfile
RUN cd backend && bun install --frozen-lockfile

# Copy application source
COPY . .

# Production environment
ENV NODE_ENV=production

# Build frontend and backend
RUN bun run build


# Stage 2: Production Runner
FROM docker.io/oven/bun:1-alpine AS runner

WORKDIR /app/backend

ENV NODE_ENV=production
ENV PORT=3000

# Backend dependencies
COPY --from=builder /app/backend/package.json ./package.json
COPY --from=builder /app/backend/node_modules ./node_modules

# Built backend
COPY --from=builder /app/backend/dist ./dist

# Built frontend
COPY --from=builder /app/backend/public ./public

# Drizzle migrations
COPY --from=builder /app/backend/drizzle ./drizzle

EXPOSE 3000

CMD ["bun", "run", "start"]
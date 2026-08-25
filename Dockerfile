# Stage 1: Build Frontend and Backend
FROM oven/bun:1-alpine AS builder

WORKDIR /app

# Copy dependency declaration files
COPY package.json bun.lock* package-lock.json* ./
COPY backend/package.json backend/bun.lock* backend/package-lock.json* ./backend/

# Install root and backend dependencies
RUN bun install
RUN cd backend && bun install

# Copy full application source code
COPY . .

# Set environment to production for build
ENV NODE_ENV=production

# Build frontend (outputs to backend/public) & backend (outputs to backend/dist)
RUN bun run build

# Stage 2: Production Runner
FROM oven/bun:1-alpine AS runner

WORKDIR /app/backend

# Default production environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Copy node_modules and package file from builder
COPY --from=builder /app/backend/package.json ./package.json
COPY --from=builder /app/backend/node_modules ./node_modules

# Copy built backend bundle, static frontend assets, and database migrations
COPY --from=builder /app/backend/dist ./dist
COPY --from=builder /app/backend/public ./public
COPY --from=builder /app/backend/drizzle ./drizzle

# Expose application port
EXPOSE 3000

# Start server
CMD ["bun", "run", "start"]

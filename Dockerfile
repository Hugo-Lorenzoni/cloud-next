# This Dockerfile is used to build a Docker image for a Next.js application.
# It uses a multi-stage build process to optimize the image size and improve caching.

# Stage 1: Base image
# This Dockerfile sets up a Node.js environment based on the node:20-alpine image.
FROM node:20-alpine AS base

# Stage 2: Dependencies
FROM base AS deps

# Set the working directory to /app
WORKDIR /app

# Copy package.json, yarn.lock, package-lock.json, and pnpm-lock.yaml to the working directory
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./

# Install dependencies based on the lockfile type (yarn, npm, or pnpm)
RUN \
  if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm i --frozen-lockfile; \
  else echo "Lockfile not found." && exit 1; \
  fi

# Stage 3: Builder
FROM base AS builder

# Set the working directory to /app
WORKDIR /app

# Copy the node_modules directory from the deps stage to the working directory
COPY --from=deps /app/node_modules ./node_modules

# Copy the entire project directory to the working directory
COPY . .

# Build the Next.js application based on the lockfile type (yarn, npm, or pnpm)
RUN \
  if [ -f yarn.lock ]; then yarn run build; \
  elif [ -f package-lock.json ]; then npm run build; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm run build; \
  else echo "Lockfile not found." && exit 1; \
  fi

# Stage 4: Runner
FROM base AS runner

# Set the working directory to /app
WORKDIR /app

# Set the NODE_ENV environment variable to production
ENV NODE_ENV production

# Create a system group and user for running the application
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy the public directory from the builder stage to the working directory
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Copy the .next/standalone directory from the builder stage to the working directory
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./

# Copy the .next/static directory from the builder stage to the working directory
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Set the user to nextjs
USER nextjs

# Expose port 3000
EXPOSE 3000

# Set the PORT environment variable to 3000
ENV PORT 3000

# Start the application by running the server.js file with HOSTNAME set to "0.0.0.0"
CMD HOSTNAME="0.0.0.0" node server.js
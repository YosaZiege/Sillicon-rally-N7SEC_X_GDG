# Dockerfile for Next.js Application

# 1. Base Image for dependencies
FROM node:18-alpine AS deps
WORKDIR /app
COPY package.json ./
# Use npm ci for reproducible builds if you have a package-lock.json
RUN npm install

# 2. Builder Image
FROM node:18-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build arguments for environment variables
ARG SECRET_COOKIE_PASSWORD
ENV SECRET_COOKIE_PASSWORD=$SECRET_COOKIE_PASSWORD

# Build the Next.js app
RUN npm run build

# 3. Production Image
FROM node:18-alpine AS runner
WORKDIR /app

# Set environment variables
ENV NODE_ENV=production
ARG SECRET_COOKIE_PASSWORD
ENV SECRET_COOKIE_PASSWORD=$SECRET_COOKIE_PASSWORD

# Create a non-root user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Copy built app files
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/src/data ./src/data

# Change ownership of necessary folders
RUN chown -R nextjs:nodejs /app/.next
RUN chown -R nextjs:nodejs /app/src/data

# Switch to the non-root user
USER nextjs

EXPOSE 9002

# The command to start the app
CMD ["npm", "start", "--", "-p", "9002"]

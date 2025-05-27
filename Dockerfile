# Dockerfile for PostPilot application
FROM node:18-alpine AS base

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the application
COPY . .

# Disable Next.js telemetry
ENV NEXT_TELEMETRY_DISABLED=1

# Set environment variables for Clerk
ARG NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_ZXhjaXRpbmctZmxhbWluZ28tMjQuY2xlcmsuYWNjb3VudHMuZGV2JA
ARG CLERK_SECRET_KEY=sk_test_9KShpl9FYzH80KJrB3KpIgXsvHlYg2O85bDNJuunVF
ENV NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=${NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
ENV CLERK_SECRET_KEY=${CLERK_SECRET_KEY}

# Skip ESLint during build
ENV NEXT_DISABLE_ESLINT_DURING_BUILD=true

# Build the Next.js application
RUN npm run build

# Expose the port the app will run on
EXPOSE 3000

# Command to run the application
CMD ["npm", "start"]

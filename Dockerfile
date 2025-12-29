# Minimal Dockerfile for Boblox app
FROM node:18-alpine

# Create app directory
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy source
COPY . .

# Run migrations to ensure data structure exists (no-op if already present)
RUN npm run migrate || true

ENV NODE_ENV=production
EXPOSE 8080

# Use non-root user in production
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

CMD ["node","app.js"]

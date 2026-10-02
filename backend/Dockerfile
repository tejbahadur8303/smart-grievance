# Multi-stage production build for Smart Grievance Redressal Backend
FROM node:20-alpine AS builder

WORKDIR /app

# Copy configuration and dependencies
COPY package*.json tsconfig.json ./
RUN npm install

# Copy source and build TypeScript
COPY src ./src
RUN npm run build

# Runtime stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5002

COPY package*.json ./
RUN npm install --omit=dev

COPY --from=builder /app/dist ./dist
RUN mkdir -p uploads

EXPOSE 5002

CMD ["node", "dist/server.js"]

FROM node:20-alpine AS builder

WORKDIR /app
COPY backend/package*.json ./
RUN npm install

COPY backend/ ./
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY backend/package*.json ./
RUN npm install --only=production

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/uploads ./uploads

EXPOSE 5000

CMD ["node", "dist/server.js"]

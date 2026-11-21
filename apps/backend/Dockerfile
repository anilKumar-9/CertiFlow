# Stage 1: Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# Install build dependencies for native modules (bcrypt, etc.)
RUN apk add --no-cache python3 make g++

# Copy workspace configuration
COPY package.json package-lock.json* tsconfig.base.json ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/backend/package.json ./apps/backend/

# Install dependencies across workspaces
RUN npm install --ignore-scripts

# Copy shared package and backend sources
COPY packages/shared ./packages/shared
COPY apps/backend ./apps/backend

# Generate Prisma Client and compile packages
RUN npx prisma generate --schema=./apps/backend/prisma/schema.prisma
RUN npm run build --workspace=@certiflow/shared
RUN npm run build --workspace=@certiflow/backend

# Stage 2: Production runner stage
FROM node:22-alpine AS runner

WORKDIR /app

# Install runtime dependencies for health checks
RUN apk add --no-cache curl

ENV NODE_ENV=production

# Copy built artifacts and production dependencies
COPY package.json tsconfig.base.json ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/backend/package.json ./apps/backend/

# Install production dependencies
RUN npm install --omit=dev --ignore-scripts

# Copy generated Prisma engine/client and compiled code
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder /app/apps/backend/dist ./apps/backend/dist
COPY --from=builder /app/apps/backend/prisma ./apps/backend/prisma

EXPOSE 4000

# Default command launches API server; override in compose for worker
CMD ["node", "apps/backend/dist/src/app.js"]

# Stage 1: Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# Copy root workspace manifests
COPY package.json package-lock.json* tsconfig.base.json ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/frontend/package.json ./apps/frontend/

# Install dependencies across workspaces
RUN npm install --ignore-scripts

# Copy shared package and frontend sources
COPY packages/shared ./packages/shared
COPY apps/frontend ./apps/frontend

# Build shared package and frontend web application
RUN npm run build --workspace=@certiflow/shared
RUN npm run build --workspace=@certiflow/frontend

# Stage 2: Production Nginx runtime
FROM nginx:alpine AS runner

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy build artifacts from builder stage
COPY --from=builder /app/apps/frontend/dist /usr/share/nginx/html

# Provide custom SPA fallback configuration
RUN printf 'server {\n\
    listen 80;\n\
    server_name localhost;\n\
    root /usr/share/nginx/html;\n\
    index index.html;\n\
    location / {\n\
        try_files $uri $uri/ /index.html;\n\
    }\n\
    error_page 500 502 503 504 /50x.html;\n\
    location = /50x.html {\n\
        root /usr/share/nginx/html;\n\
    }\n\
}\n' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

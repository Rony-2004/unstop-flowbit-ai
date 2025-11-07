# Frontend Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies and ignore scripts to avoid patch-package issue
RUN npm install --legacy-peer-deps --ignore-scripts

# Then run prepare/build scripts if needed
RUN npm rebuild

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production image with nginx
FROM nginx:alpine

# Copy built application to nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]

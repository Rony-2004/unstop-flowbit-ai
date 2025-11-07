# Docker Deployment Guide

## Quick Start

### Prerequisites
- Docker Desktop installed
- Docker Compose installed

### Deploy with One Command

```bash
# Copy environment file
cp .env.docker .env

# Start all services
docker-compose up -d
```

Access the application:
- Frontend: http://localhost
- Backend API: http://localhost:3001

## Build Process

### Backend Build
The backend Dockerfile uses multi-stage build:
1. Builder stage: Installs dependencies, generates Prisma client, compiles TypeScript
2. Production stage: Only production dependencies, optimized for size

### Frontend Build
The frontend Dockerfile:
1. Builder stage: Builds React application with Vite
2. Production stage: Serves static files via Nginx

## Configuration

### Environment Variables

Edit `.env.docker` file:
```env
DATABASE_URL=your_postgresql_connection_string
GROQ_API_KEY=your_groq_api_key
```

### Nginx Configuration

The frontend uses Nginx as reverse proxy:
- Serves static React build
- Proxies `/api` requests to backend
- Handles client-side routing

## Managing Services

```bash
# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Rebuild after code changes
docker-compose up -d --build

# View running containers
docker ps

# Execute commands in container
docker exec -it flowbit-backend sh
docker exec -it flowbit-frontend sh
```

## Production Deployment

### Cloud Deployment Options

#### Option 1: AWS ECS
```bash
# Build and push to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account>.dkr.ecr.us-east-1.amazonaws.com
docker build -t flowbit-backend ./backend
docker tag flowbit-backend:latest <account>.dkr.ecr.us-east-1.amazonaws.com/flowbit-backend:latest
docker push <account>.dkr.ecr.us-east-1.amazonaws.com/flowbit-backend:latest
```

#### Option 2: Vercel (Frontend)
```bash
cd frontend
vercel --prod
```

#### Option 3: Railway/Render (Backend)
- Connect GitHub repository
- Set environment variables
- Deploy automatically

### Health Checks

Backend health check endpoint:
```bash
curl http://localhost:3001/api/health
```

Expected response:
```json
{
  "status": "OK",
  "timestamp": "2025-11-08T..."
}
```

## Troubleshooting

### Port Already in Use
```bash
# Find process using port 3001
netstat -ano | findstr :3001
# Kill process
taskkill /PID <process_id> /F
```

### Database Connection Issues
- Verify DATABASE_URL in .env.docker
- Check if Neon database is accessible
- Ensure connection string includes SSL parameters

### Container Build Fails
```bash
# Clear Docker cache
docker system prune -a

# Rebuild without cache
docker-compose build --no-cache
```

## Performance Optimization

### Image Size Reduction
- Multi-stage builds used
- Only production dependencies in final image
- Alpine Linux base images

### Resource Limits
Add to docker-compose.yml:
```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 512M
```

## Security Best Practices

1. Never commit .env files
2. Use Docker secrets for sensitive data
3. Run containers as non-root user
4. Keep base images updated
5. Scan images for vulnerabilities:
```bash
docker scan flowbit-backend
```

## Monitoring

### Container Stats
```bash
docker stats
```

### Logs
```bash
# Follow logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Last 100 lines
docker-compose logs --tail=100 backend
```

## Backup

### Database Backup
```bash
# Export database
pg_dump $DATABASE_URL > backup.sql

# Restore
psql $DATABASE_URL < backup.sql
```

### Container Volumes
```bash
# List volumes
docker volume ls

# Backup volume
docker run --rm -v flowbit_data:/data -v $(pwd):/backup alpine tar czf /backup/data-backup.tar.gz /data
```

## CI/CD Integration

### GitHub Actions Example
```yaml
name: Docker Build
on: [push]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Build images
        run: docker-compose build
      - name: Run tests
        run: docker-compose run backend npm test
```

---

For more information, see the main README.md

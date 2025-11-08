# Docker Setup Guide

This guide will help you run the entire Flowbit Analytics application using Docker.

## Prerequisites

- Docker Desktop installed and running
- Docker Compose installed (comes with Docker Desktop)

## Quick Start

### 1. Configure Environment Variables

The `.env.docker` file is already configured with:
- Local PostgreSQL database (will be created automatically)
- Your Groq API key for AI features

If needed, you can edit `.env.docker` to update:
```bash
DATABASE_URL=postgresql://postgres:postgres@db:5432/flowbit?schema=public
GROQ_API_KEY=your_groq_api_key_here
```

### 2. Build and Run

From the `unstop` directory, run:

```powershell
docker compose up -d --build
```

This will:
- Create a PostgreSQL database container
- Build and start the backend API server
- Build and start the frontend Next.js application
- Set up a Docker network for inter-container communication
- Run Prisma migrations automatically

### 3. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Database**: localhost:5432 (postgres/postgres)

### 4. Initial Setup

The first time you run the application:

1. Wait for all containers to start (check with `docker compose ps`)
2. The backend will automatically run database migrations
3. You may need to seed the database with initial data

To seed the database:
```powershell
docker compose exec backend npm run seed
```

## Container Details

### Services

1. **db** (PostgreSQL 15)
   - Port: 5432
   - User: postgres
   - Password: postgres
   - Database: flowbit
   - Data persists in Docker volume `postgres_data`

2. **backend** (Node.js API)
   - Port: 3001
   - Built from `./backend/Dockerfile`
   - Runs Prisma migrations on startup
   - Connects to PostgreSQL database

3. **frontend** (Next.js)
   - Port: 3000
   - Built from `./frontend/Dockerfile`
   - Standalone production build
   - Connects to backend API

## Useful Commands

### View Logs
```powershell
# All services
docker compose logs -f

# Specific service
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f db
```

### Stop Containers
```powershell
docker compose down
```

### Stop and Remove All Data
```powershell
docker compose down -v
```

### Rebuild Specific Service
```powershell
docker compose up -d --build backend
docker compose up -d --build frontend
```

### Execute Commands in Containers
```powershell
# Access backend container shell
docker compose exec backend sh

# Access database
docker compose exec db psql -U postgres -d flowbit

# Run Prisma commands
docker compose exec backend npx prisma studio
docker compose exec backend npx prisma migrate deploy
```

### Restart Services
```powershell
docker compose restart backend
docker compose restart frontend
```

## Troubleshooting

### Container Won't Start
```powershell
# Check container status
docker compose ps

# View detailed logs
docker compose logs backend
```

### Database Connection Issues
```powershell
# Verify database is healthy
docker compose exec db pg_isready -U postgres

# Check database logs
docker compose logs db
```

### Port Already in Use
If ports 3000, 3001, or 5432 are already in use, you can change them in `docker-compose.yml`:
```yaml
ports:
  - "3002:3001"  # Change host port (left side)
```

### Clear Everything and Start Fresh
```powershell
# Stop containers and remove volumes
docker compose down -v

# Remove images
docker compose down --rmi all

# Rebuild from scratch
docker compose up -d --build
```

### Prisma Issues
```powershell
# Regenerate Prisma client
docker compose exec backend npx prisma generate

# Reset database (WARNING: Deletes all data)
docker compose exec backend npx prisma migrate reset --force
```

## Development vs Production

The Docker setup is configured for **production** use with:
- Multi-stage builds for smaller images
- Non-root users for security
- Health checks for database
- Automatic restarts
- Optimized Next.js standalone build

For **local development** without Docker:
1. Use the local PostgreSQL/Neon database
2. Run `npm run dev` in backend and frontend directories
3. See the main README.md for development setup

## Environment Variables

### Backend (.env.docker)
- `DATABASE_URL`: PostgreSQL connection string
- `PORT`: Backend server port (3001)
- `GROQ_API_KEY`: Groq AI API key for chat features
- `NODE_ENV`: Set to production

### Frontend (docker-compose.yml)
- `NEXT_PUBLIC_API_BASE_URL`: Backend API URL
- `PORT`: Frontend server port (3000)
- `NODE_ENV`: Set to production

## Data Persistence

Database data is stored in a Docker volume named `postgres_data`. This means:
- Data persists between container restarts
- Data is NOT lost when you run `docker compose down`
- Data IS lost when you run `docker compose down -v`

To backup your data:
```powershell
docker compose exec db pg_dump -U postgres flowbit > backup.sql
```

To restore:
```powershell
Get-Content backup.sql | docker compose exec -T db psql -U postgres flowbit
```

## Network Architecture

All containers communicate through the `flowbit-network` bridge network:
- Frontend → Backend: `http://backend:3001/api` (internal DNS)
- Backend → Database: `postgresql://postgres:postgres@db:5432/flowbit`
- External access uses `localhost` with mapped ports

## Performance Tips

1. **Build Cache**: Docker caches layers. Change files from least to most frequently changed (dependencies → source code)
2. **Volume Mounts**: For development, you can add volume mounts to hot-reload code
3. **Resource Limits**: Set memory/CPU limits in docker-compose.yml if needed
4. **Health Checks**: The database has health checks; backend waits for DB to be ready

## Security Notes

⚠️ **Important for Production Deployment**:
- Change default PostgreSQL password
- Use environment-specific API keys
- Enable SSL for database connections
- Use secrets management (Docker Secrets, Vault)
- Run containers as non-root users (already configured)
- Keep images updated for security patches

## Next Steps

After successful Docker deployment:
1. Access the frontend at http://localhost:3000
2. Log in with your credentials
3. Upload invoices and explore analytics
4. Use the AI chat feature for data insights

For issues or questions, check the logs first:
```powershell
docker compose logs -f
```

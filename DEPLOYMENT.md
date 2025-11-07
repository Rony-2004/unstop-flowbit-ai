# 🚀 Deployment Guide

## Overview

This guide covers deploying the full-stack analytics dashboard to production.

**Stack:**
- **Frontend:** Vercel
- **Backend:** Vercel Serverless Functions
- **Database:** Neon PostgreSQL
- **AI Service:** (To be added - Render/Railway)

---

## 📋 Prerequisites

- GitHub account
- Vercel account
- Neon account (free tier available)
- Domain (optional)

---

## 🗄️ Database Setup (Neon)

### 1. Create Neon Project

1. Go to [Neon Console](https://console.neon.tech/)
2. Click **"Create Project"**
3. Name: `analytics-dashboard`
4. Region: Choose closest to your users
5. PostgreSQL version: 15+

### 2. Get Connection String

```bash
postgresql://user:password@ep-xxx.neon.tech/neondb?sslmode=require
```

### 3. Configure Database

```bash
# In your local backend folder
cd backend

# Update .env with Neon connection string
DATABASE_URL="postgresql://user:password@ep-xxx.neon.tech/neondb?sslmode=require"

# Push schema to Neon
npm run db:push

# Seed production data
npm run db:seed
```

---

## 🔧 Backend Deployment (Vercel)

### 1. Prepare Backend for Vercel

Create `backend/vercel.json`:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "src/index.ts",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "src/index.ts"
    }
  ]
}
```

### 2. Update package.json

Add to `backend/package.json`:

```json
{
  "scripts": {
    "vercel-build": "prisma generate && tsc"
  }
}
```

### 3. Deploy to Vercel

```bash
cd backend

# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

### 4. Configure Environment Variables in Vercel

1. Go to your Vercel project dashboard
2. Settings → Environment Variables
3. Add:
   - `DATABASE_URL` = Your Neon connection string
   - `FRONTEND_URL` = Your frontend URL (set after frontend deployment)
   - `PORT` = 3001

### 5. Redeploy

```bash
vercel --prod
```

---

## 🎨 Frontend Deployment (Vercel)

### 1. Update API Configuration

Update `frontend/.env.production`:

```env
VITE_API_BASE_URL=https://your-backend.vercel.app/api
```

### 2. Deploy to Vercel

```bash
cd frontend

# Deploy
vercel --prod
```

### 3. Configure Build Settings

In Vercel dashboard:
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Install Command:** `npm install`

### 4. Add Environment Variables

- `VITE_API_BASE_URL` = Your backend URL + `/api`

---

## 🔗 Connect Frontend & Backend

### Update CORS in Backend

After both are deployed, update backend `.env`:

```env
FRONTEND_URL=https://your-frontend.vercel.app
```

Redeploy backend:

```bash
cd backend
vercel --prod
```

---

## ✅ Verification Checklist

### Backend Health Check

```bash
curl https://your-backend.vercel.app/api/health
```

Expected:
```json
{
  "status": "OK",
  "timestamp": "2025-11-08T..."
}
```

### Test API Endpoints

```bash
# Stats
curl https://your-backend.vercel.app/api/stats

# Vendors
curl https://your-backend.vercel.app/api/vendors

# Invoices
curl https://your-backend.vercel.app/api/invoices
```

### Frontend Check

1. Visit `https://your-frontend.vercel.app`
2. Verify dashboard loads with data
3. Check browser console for errors
4. Test all charts and tables

---

## 🐛 Troubleshooting

### CORS Errors

**Symptom:** "Access to XMLHttpRequest has been blocked by CORS policy"

**Fix:**
1. Verify `FRONTEND_URL` in backend environment variables
2. Check backend `src/index.ts` has correct CORS configuration
3. Redeploy backend

### Database Connection Errors

**Symptom:** "Can't reach database server"

**Fix:**
1. Verify `DATABASE_URL` format
2. Check Neon project is active
3. Ensure `?sslmode=require` is in connection string

### Build Failures

**Symptom:** Vercel build fails

**Fix:**
1. Check build logs in Vercel dashboard
2. Verify all dependencies are in `package.json`
3. Run `npm run build` locally first
4. Check Node.js version compatibility

### API 404 Errors

**Symptom:** API endpoints return 404

**Fix:**
1. Verify `vercel.json` routing configuration
2. Check API routes are properly exported
3. Ensure backend is using correct base path

---

## 🔒 Security Best Practices

### Environment Variables

- ✅ Never commit `.env` files
- ✅ Use different values for dev/prod
- ✅ Rotate database credentials periodically

### Database

- ✅ Enable SSL mode
- ✅ Use connection pooling (Neon has built-in)
- ✅ Set up IP allowlisting if needed

### API

- ✅ Implement rate limiting (future)
- ✅ Add authentication (future)
- ✅ Validate all inputs

---

## 📊 Performance Optimization

### Database

```sql
-- Add indexes for frequently queried fields
CREATE INDEX idx_invoices_date ON invoices(invoice_date);
CREATE INDEX idx_summaries_total ON summaries(invoice_total);
CREATE INDEX idx_vendors_name ON vendors(vendor_name);
```

### Backend

- Enable gzip compression
- Add response caching headers
- Use database connection pooling

### Frontend

- Lazy load chart components
- Implement pagination
- Use React Query caching

---

## 🔄 CI/CD Setup

### GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      # Backend
      - name: Deploy Backend
        run: |
          cd backend
          npm ci
          vercel --prod --token=${{ secrets.VERCEL_TOKEN }}
      
      # Frontend
      - name: Deploy Frontend
        run: |
          cd frontend
          npm ci
          vercel --prod --token=${{ secrets.VERCEL_TOKEN }}
```

---

## 📈 Monitoring

### Vercel Analytics

Enable in Vercel dashboard:
- Web Vitals
- Error tracking
- Performance metrics

### Database Monitoring

Neon Console provides:
- Query performance
- Connection stats
- Storage usage

---

## 🎯 Next Steps

1. ✅ Deploy backend to Vercel
2. ✅ Deploy frontend to Vercel
3. ✅ Set up Neon database
4. ✅ Configure environment variables
5. ⏳ Set up Vanna AI service
6. ⏳ Add authentication
7. ⏳ Implement rate limiting
8. ⏳ Add monitoring/logging

---

## 📞 Support

For issues:
1. Check Vercel deployment logs
2. Review Neon database logs
3. Test API endpoints individually
4. Verify environment variables

---

## 📝 Useful Commands

```bash
# Local development
npm run dev

# Build for production
npm run build

# Deploy to Vercel
vercel --prod

# View deployment logs
vercel logs

# Check environment variables
vercel env ls
```
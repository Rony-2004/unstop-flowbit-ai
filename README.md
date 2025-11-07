# Flowbit AI - Invoice Analytics Dashboard

A production-grade full-stack web application for invoice data analytics and AI-powered natural language querying.

## Features

### 1. Interactive Analytics Dashboard
- Real-time KPI cards showing total spend, invoices processed, documents uploaded, and average invoice value
- Invoice volume and value trends visualization
- Top 10 vendors by spend with interactive bar charts
- Spend distribution by category
- Cash outflow forecast timeline
- Recent invoices table with vendor details

### 2. Chat with Data Interface
- Natural language querying powered by Groq LLM (Llama 3.3 70B)
- Text-to-SQL conversion using AI
- Interactive results table with CSV export
- Persistent chat history (localStorage)
- Suggested questions for quick queries
- Real-time SQL query generation and execution

### 3. Bonus Features
- Persistent chat history across sessions
- CSV export functionality for query results
- Docker containerization for easy deployment
- Unit tests with Jest and Supertest
- Mobile-responsive design
- Comprehensive API documentation

## Tech Stack

### Backend
- **Runtime**: Node.js 18
- **Framework**: Express.js + TypeScript
- **Database**: PostgreSQL (Neon Cloud)
- **ORM**: Prisma 5.22.0
- **AI**: Groq SDK with Llama 3.3 70B Versatile
- **Testing**: Jest + Supertest

### Frontend
- **Framework**: React 18 + Vite
- **Language**: TypeScript
- **Styling**: TailwindCSS + shadcn/ui
- **State**: React Query (TanStack Query)
- **Charts**: Recharts
- **HTTP Client**: Axios

### DevOps
- **Containerization**: Docker + Docker Compose
- **Web Server**: Nginx (for frontend)

## Quick Start

### Prerequisites
- Node.js 18 or higher
- npm or yarn
- PostgreSQL database (or use provided Neon connection)
- Groq API key (free from https://console.groq.com)

### Setup Steps

#### 1. Clone the repository
```bash
git clone <repository-url>
cd unstop
```

#### 2. Backend Setup
```bash
cd backend
npm install

# Create .env file with the following variables:
DATABASE_URL=postgresql://neondb_owner:npg_xH2YzKIM7LRu@ep-rough-mouse-adkt7k0z-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
GROQ_API_KEY=your_groq_api_key_here
PORT=3001
NODE_ENV=development

npx prisma generate
npm run dev
```

Backend will run on `http://localhost:3001`

#### 3. Frontend Setup
```bash
cd frontend
npm install

# Create .env file:
VITE_API_BASE_URL=http://localhost:3001/api

npm run dev
```

Frontend will run on `http://localhost:8080`

## Database Schema

### Entity Relationship Overview

```
documents (1) ----< (1) invoices
documents (1) ----< (1) vendors
documents (1) ----< (1) customers
documents (1) ----< (1) summaries
documents (1) ----< (1) payments
documents (1) ----< (N) line_items
```

### Tables

**documents** - Primary table storing document metadata
- id, externalId, name, filePath, fileSize, fileType, status, organizationId, departmentId, createdAt, updatedAt, processedAt, analyticsId

**invoices** - Stores invoice-specific information
- id, documentId (FK), invoiceId, invoiceDate, deliveryDate

**vendors** - Vendor details for each document
- id, documentId (FK), vendorName, vendorAddress, vendorTaxId, vendorPartyNumber

**customers** - Customer information
- id, documentId (FK), customerName, customerAddress, customerTaxId

**summaries** - Financial summary data
- id, documentId (FK), documentType, subTotal, totalTax, invoiceTotal, currencySymbol

**payments** - Payment terms and banking details
- id, documentId (FK), dueDate, paymentTerms, bankAccountNumber, bic, accountName, netDays, discountPercentage, discountDays, discountDueDate

**line_items** - Individual invoice line items
- id, documentId (FK), srNo, description, quantity, unitPrice, totalPrice, sachkonto, buschluessel, vatRate, vatAmount

## API Documentation

### Base URL
```
http://localhost:3001/api
```

### Endpoints

#### 1. GET /stats
Get dashboard statistics

**Response:**
```json
{
  "totalSpend": 30129.36,
  "totalInvoices": 50,
  "totalDocuments": 50,
  "averageInvoiceValue": 614.88
}
```

#### 2. GET /invoice-trends
Get invoice volume and value trends over time

**Response:**
```json
[
  {
    "month": "2024-03",
    "volume": 38,
    "value": 14121.43
  }
]
```

#### 3. GET /vendors/top10
Get top 10 vendors by total spend

**Response:**
```json
[
  {
    "vendorName": "CPB SOFTWARE (GERMANY) GMBH",
    "totalSpend": 14101.44
  }
]
```

#### 4. GET /category-spend
Get spending breakdown by category

**Response:**
```json
[
  {
    "category": "Uncategorized",
    "spend": 14101.44
  }
]
```

#### 5. GET /cash-outflow
Get cash outflow forecast by month

**Response:**
```json
[
  {
    "month": "2024-03",
    "amount": 14121.43
  }
]
```

#### 6. GET /invoices
Get paginated list of invoices

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 50)
- `search` (optional)
- `status` (optional)

**Response:**
```json
{
  "invoices": [
    {
      "id": "abc123",
      "invoiceId": "INV-001",
      "vendor": "CPB SOFTWARE",
      "date": "2024-03-15T00:00:00.000Z",
      "amount": 1234.56,
      "status": "processed"
    }
  ],
  "total": 50
}
```

#### 7. POST /chat-with-data
AI-powered natural language querying

**Request:**
```json
{
  "query": "Show me the top 5 vendors by total spend"
}
```

**Response:**
```json
{
  "query": "Show me the top 5 vendors by total spend",
  "sql": "SELECT v.\"vendorName\", SUM(s.\"invoiceTotal\")::float as total_spend FROM vendors v JOIN summaries s ON v.\"documentId\" = s.\"documentId\" GROUP BY v.\"vendorName\" ORDER BY total_spend DESC LIMIT 5",
  "results": [
    {
      "vendorName": "CPB SOFTWARE (GERMANY) GMBH",
      "total_spend": 14101.44
    }
  ],
  "explanation": "Here are the top 5 vendors ranked by their total spending...",
  "rowCount": 5
}
```

#### 8. GET /payment-status
Get payment status distribution

**Response:**
```json
[
  {
    "status": "paid",
    "count": 30
  }
]
```

## Chat with Data Workflow

### Architecture Flow

```
User Input (Natural Language)
        ↓
Frontend (React Component)
        ↓
HTTP POST /api/chat-with-data
        ↓
Backend Express Route
        ↓
Vanna AI Service
        ↓
Groq LLM API (Llama 3.3 70B)
   ↓            ↓
Generate SQL  Generate Explanation
        ↓
Execute SQL via Prisma
        ↓
PostgreSQL Database (Neon)
        ↓
Query Results
        ↓
Format & Return Response
        ↓
Frontend Display (Table + Explanation)
        ↓
User sees Results + SQL + Explanation
```

### Detailed Steps

1. **User Input**: User types natural language question

2. **Frontend Processing**: React component sends POST request to backend

3. **Backend Receives Request**: Express route handler validates query and checks Groq API key

4. **AI SQL Generation**: 
   - Vanna AI service sends database schema context to Groq LLM
   - LLM generates PostgreSQL query based on natural language input
   - SQL is cleaned and validated

5. **SQL Execution**:
   - Generated SQL is executed via Prisma
   - Results are fetched from PostgreSQL database

6. **Explanation Generation**:
   - Results and SQL are sent back to LLM
   - LLM generates human-friendly explanation

7. **Response Formatting**:
   - Backend combines SQL, results, and explanation
   - Response includes row count and metadata

8. **Frontend Display**:
   - Results shown in interactive table
   - SQL query displayed in code block
   - Natural language explanation rendered
   - CSV export option available

## Docker Deployment

### Build and Run

```bash
docker compose --env-file .env.docker build
docker compose --env-file .env.docker up -d
docker compose ps
docker compose logs -f
docker compose down
```

### Access the Application
- **Frontend**: http://localhost
- **Backend API**: http://localhost:3001

## Testing

### Run Backend Tests
```bash
cd backend
npm test
```

## Project Structure

```
unstop/
├── backend/
│   ├── src/
│   │   ├── routes/          # API route handlers
│   │   ├── services/        # Business logic (Vanna AI)
│   │   ├── __tests__/       # Unit tests
│   │   └── index.ts         # Entry point
│   ├── prisma/
│   │   └── schema.prisma    # Database schema
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/           # Page components
│   │   ├── services/        # API client
│   │   └── lib/             # Utilities
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
├── docker-compose.yml
├── .env.docker
└── README.md
```

## Mobile Responsive Design

The application is fully responsive and optimized for:
- **Mobile**: 320px - 640px (single column layout)
- **Tablet**: 640px - 1024px (two column grid)
- **Desktop**: 1024px+ (full dashboard layout)

## Production Deployment

### Recommended Platforms

**Backend**: Railway, Render, Heroku
**Frontend**: Vercel, Netlify, Cloudflare Pages
**Database**: Neon, Supabase, Railway PostgreSQL

## Credits

**Developer**: Mowazzem Uddin Ahmed
**Company**: Flowbit AI
**AI Model**: Groq Llama 3.3 70B Versatile
**Database**: Neon PostgreSQL
**UI Components**: shadcn/ui

---

Built for Flowbit AI Assignment

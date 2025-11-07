# 🧪 API Testing Guide

## Quick Test Commands

### Using cURL (PowerShell)

```powershell
# Health Check
curl http://localhost:3001/api/health

# Dashboard Stats
curl http://localhost:3001/api/stats

# Invoice Trends
curl http://localhost:3001/api/invoice-trends

# Top Vendors
curl http://localhost:3001/api/vendors

# Category Spend
curl http://localhost:3001/api/category-spend

# Cash Outflow
curl http://localhost:3001/api/cash-outflow

# Invoices (with pagination)
curl "http://localhost:3001/api/invoices?page=1&limit=10"

# Invoices (with search)
curl "http://localhost:3001/api/invoices?search=Amazon"

# Chat with Data
curl -X POST http://localhost:3001/api/chat-with-data `
  -H "Content-Type: application/json" `
  -d '{"query":"What is the total spend?"}'
```

### Using Invoke-WebRequest (PowerShell)

```powershell
# GET Requests
Invoke-RestMethod -Uri "http://localhost:3001/api/stats" -Method GET | ConvertTo-Json

# POST Request
$body = @{ query = "Show me top vendors" } | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:3001/api/chat-with-data" -Method POST -Body $body -ContentType "application/json"
```

---

## Expected Responses

### GET /api/health

**Request:**
```bash
curl http://localhost:3001/api/health
```

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2025-11-08T12:34:56.789Z"
}
```

---

### GET /api/stats

**Request:**
```bash
curl http://localhost:3001/api/stats
```

**Response:**
```json
{
  "totalSpend": 45234.67,
  "totalInvoices": 50,
  "totalDocuments": 50,
  "averageInvoiceValue": 904.69
}
```

**Fields:**
- `totalSpend` - Sum of all invoice totals (EUR)
- `totalInvoices` - Count of invoice records
- `totalDocuments` - Count of document records
- `averageInvoiceValue` - Average invoice amount

---

### GET /api/invoice-trends

**Request:**
```bash
curl http://localhost:3001/api/invoice-trends
```

**Response:**
```json
[
  {
    "month": "2025-03",
    "volume": 12,
    "value": 8456.32
  },
  {
    "month": "2025-04",
    "volume": 18,
    "value": 12345.67
  }
]
```

**Fields:**
- `month` - Month in YYYY-MM format
- `volume` - Number of invoices in that month
- `value` - Total spend in that month

---

### GET /api/vendors

**Request:**
```bash
curl http://localhost:3001/api/vendors
```

**Response:**
```json
[
  {
    "vendorName": "Amazon Web Services",
    "totalSpend": 15234.50
  },
  {
    "vendorName": "Microsoft Corporation",
    "totalSpend": 12456.78
  }
]
```

**Fields:**
- `vendorName` - Vendor company name
- `totalSpend` - Total amount spent with vendor

**Notes:**
- Returns top 10 vendors by spend
- Sorted descending by totalSpend

---

### GET /api/category-spend

**Request:**
```bash
curl http://localhost:3001/api/category-spend
```

**Response:**
```json
[
  {
    "category": "4925",
    "spend": 8500.25
  },
  {
    "category": "6815",
    "spend": 6234.50
  }
]
```

**Fields:**
- `category` - Sachkonto (GL account code)
- `spend` - Total spend in category

---

### GET /api/cash-outflow

**Request:**
```bash
curl http://localhost:3001/api/cash-outflow
```

**Response:**
```json
[
  {
    "month": "2025-11",
    "amount": 12345.67
  },
  {
    "month": "2025-12",
    "amount": 8456.32
  }
]
```

**Fields:**
- `month` - Month in YYYY-MM format
- `amount` - Expected cash outflow amount

---

### GET /api/invoices

**Request:**
```bash
curl "http://localhost:3001/api/invoices?page=1&limit=10&search=Amazon"
```

**Query Parameters:**
- `page` (optional, default: 1) - Page number
- `limit` (optional, default: 10) - Items per page
- `search` (optional) - Search term for vendor/invoice ID

**Response:**
```json
{
  "invoices": [
    {
      "id": "clxxx...",
      "invoiceId": "INV-2025-001",
      "vendorName": "Amazon Web Services",
      "invoiceDate": "2025-03-15T00:00:00.000Z",
      "totalAmount": 1234.56,
      "status": "processed"
    }
  ],
  "total": 50,
  "page": 1,
  "totalPages": 5
}
```

**Fields:**
- `invoices` - Array of invoice objects
- `total` - Total number of matching invoices
- `page` - Current page number
- `totalPages` - Total number of pages

---

### POST /api/chat-with-data

**Request:**
```bash
curl -X POST http://localhost:3001/api/chat-with-data \
  -H "Content-Type: application/json" \
  -d '{"query":"What is the total spend?"}'
```

**Body:**
```json
{
  "query": "What is the total spend in the last 90 days?"
}
```

**Response:**
```json
{
  "response": "I'll help you analyze the data. Please wait while I process your query...",
  "sql": null,
  "results": []
}
```

**Note:** This is a placeholder. Full implementation requires Vanna AI integration.

---

## Error Responses

### 400 Bad Request

```json
{
  "error": "Invalid request parameters"
}
```

### 404 Not Found

```json
{
  "error": "Endpoint not found"
}
```

### 500 Internal Server Error

```json
{
  "error": "Internal server error",
  "message": "Database connection failed"
}
```

---

## Testing with Postman

### Import Collection

Create a Postman collection with these requests:

**1. Setup Environment**

Variables:
- `base_url` = `http://localhost:3001`

**2. Create Requests**

| Name | Method | URL |
|------|--------|-----|
| Health Check | GET | `{{base_url}}/api/health` |
| Get Stats | GET | `{{base_url}}/api/stats` |
| Invoice Trends | GET | `{{base_url}}/api/invoice-trends` |
| Top Vendors | GET | `{{base_url}}/api/vendors` |
| Category Spend | GET | `{{base_url}}/api/category-spend` |
| Cash Outflow | GET | `{{base_url}}/api/cash-outflow` |
| List Invoices | GET | `{{base_url}}/api/invoices?page=1&limit=10` |
| Search Invoices | GET | `{{base_url}}/api/invoices?search=test` |
| Chat Query | POST | `{{base_url}}/api/chat-with-data` |

**3. Chat Query Body**

```json
{
  "query": "Show me the top 5 vendors by spend"
}
```

---

## Automated Testing Script

```powershell
# test-api.ps1

$base = "http://localhost:3001/api"

Write-Host "Testing Analytics Dashboard API..." -ForegroundColor Green

# Test 1: Health Check
Write-Host "`n1. Health Check..." -ForegroundColor Yellow
Invoke-RestMethod -Uri "$base/health" | ConvertTo-Json

# Test 2: Stats
Write-Host "`n2. Dashboard Stats..." -ForegroundColor Yellow
Invoke-RestMethod -Uri "$base/stats" | ConvertTo-Json

# Test 3: Trends
Write-Host "`n3. Invoice Trends..." -ForegroundColor Yellow
Invoke-RestMethod -Uri "$base/invoice-trends" | ConvertTo-Json

# Test 4: Vendors
Write-Host "`n4. Top Vendors..." -ForegroundColor Yellow
Invoke-RestMethod -Uri "$base/vendors" | ConvertTo-Json

# Test 5: Categories
Write-Host "`n5. Category Spend..." -ForegroundColor Yellow
Invoke-RestMethod -Uri "$base/category-spend" | ConvertTo-Json

# Test 6: Cash Flow
Write-Host "`n6. Cash Outflow..." -ForegroundColor Yellow
Invoke-RestMethod -Uri "$base/cash-outflow" | ConvertTo-Json

# Test 7: Invoices
Write-Host "`n7. Invoice List..." -ForegroundColor Yellow
Invoke-RestMethod -Uri "$base/invoices?limit=5" | ConvertTo-Json -Depth 4

Write-Host "`nAll tests completed!" -ForegroundColor Green
```

**Run:**
```powershell
.\test-api.ps1
```

---

## Performance Testing

### Load Test with Apache Bench

```bash
# Install Apache Bench (comes with Apache)

# Test /api/stats endpoint
ab -n 1000 -c 10 http://localhost:3001/api/stats

# Test /api/invoices endpoint
ab -n 1000 -c 10 http://localhost:3001/api/invoices
```

**Expected Results:**
- Requests per second: > 100
- Mean response time: < 100ms
- Failed requests: 0

---

## Database Query Testing

### Direct SQL Queries

```sql
-- Test total spend calculation
SELECT SUM(invoice_total) FROM summaries;

-- Test vendor aggregation
SELECT vendor_name, COUNT(*) as invoice_count
FROM vendors
GROUP BY vendor_name
ORDER BY invoice_count DESC;

-- Test date grouping
SELECT 
  TO_CHAR(invoice_date, 'YYYY-MM') as month,
  COUNT(*) as count
FROM invoices
GROUP BY month
ORDER BY month;
```

---

## Integration Testing

### Frontend + Backend

1. **Start Backend:**
   ```bash
   cd backend
   npm run dev
   ```

2. **Start Frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Verify:**
   - Open `http://localhost:8080`
   - Check browser console for errors
   - Verify all charts load with data
   - Test search functionality

---

## Common Issues & Solutions

### CORS Errors

**Problem:** `Access-Control-Allow-Origin` error

**Solution:**
1. Check `FRONTEND_URL` in backend `.env`
2. Verify frontend is running on `http://localhost:8080`
3. Restart backend server

### Connection Refused

**Problem:** `ECONNREFUSED` error

**Solution:**
1. Verify backend is running: `netstat -ano | findstr :3001`
2. Check PORT in `.env`
3. Try `127.0.0.1` instead of `localhost`

### Empty Data

**Problem:** API returns empty arrays

**Solution:**
1. Verify database is seeded: `npm run db:seed`
2. Check database connection
3. Review Prisma client generation: `npm run db:generate`

---

## Test Checklist

- [ ] Health check returns 200
- [ ] Stats show correct totals
- [ ] Invoice trends grouped by month
- [ ] Top 10 vendors returned
- [ ] Category spend aggregated
- [ ] Cash outflow by month
- [ ] Invoices paginated correctly
- [ ] Search filters invoices
- [ ] Chat endpoint responds
- [ ] No CORS errors
- [ ] All responses under 500ms
- [ ] Frontend displays all data
# 🗄️ Database Schema Documentation

## Overview

The database follows a normalized relational design with a central `Document` entity that links to all invoice-related data.

## Entity Relationship Diagram

```
┌──────────────┐
│   Document   │ (Central entity)
│──────────────│
│ id (PK)      │
│ externalId   │◄─── Original _id from JSON
│ name         │
│ filePath     │
│ fileSize     │
│ fileType     │
│ status       │
│ createdAt    │
│ updatedAt    │
└──────┬───────┘
       │
       ├──────────────────┬──────────────────┬──────────────────┬──────────────────┬──────────────────┐
       │                  │                  │                  │                  │                  │
       ▼                  ▼                  ▼                  ▼                  ▼                  ▼
┌──────────────┐   ┌──────────────┐   ┌──────────────┐   ┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│   Invoice    │   │    Vendor    │   │   Customer   │   │   Payment    │   │   Summary    │   │  LineItem    │
│──────────────│   │──────────────│   │──────────────│   │──────────────│   │──────────────│   │──────────────│
│ id (PK)      │   │ id (PK)      │   │ id (PK)      │   │ id (PK)      │   │ id (PK)      │   │ id (PK)      │
│ documentId   │   │ documentId   │   │ documentId   │   │ documentId   │   │ documentId   │   │ documentId   │
│ invoiceId    │   │ vendorName   │   │ customerName │   │ dueDate      │   │ documentType │   │ srNo         │
│ invoiceDate  │   │ vendorAddress│   │ address      │   │ paymentTerms │   │ subTotal     │   │ description  │
│ deliveryDate │   │ taxId        │   │ taxId        │   │ bankAccount  │   │ totalTax     │   │ quantity     │
└──────────────┘   └──────────────┘   └──────────────┘   │ bic          │   │ invoiceTotal │   │ unitPrice    │
    (1:1)              (1:1)              (1:1)          │ discountPct  │   │ currency     │   │ totalPrice   │
                                                          └──────────────┘   └──────────────┘   │ sachkonto    │
                                                              (1:1)              (1:1)          │ vatRate      │
                                                                                                 └──────────────┘
                                                                                                     (1:Many)
```

## Table Definitions

### 1. documents

**Purpose:** Core table storing document metadata

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | String | PRIMARY KEY, CUID | Auto-generated unique identifier |
| externalId | String | UNIQUE, NOT NULL | Original _id from JSON data |
| name | String | NOT NULL | Document filename |
| filePath | String | NOT NULL | URL/path to document |
| fileSize | String | NOT NULL | File size in bytes |
| fileType | String | NOT NULL | MIME type (e.g., application/pdf) |
| status | String | NOT NULL | Processing status (e.g., "processed") |
| organizationId | String | NOT NULL | Organization identifier |
| departmentId | String | NOT NULL | Department identifier |
| createdAt | DateTime | NOT NULL | Document creation timestamp |
| updatedAt | DateTime | NOT NULL | Last update timestamp |
| processedAt | DateTime | NULLABLE | Processing completion timestamp |
| analyticsId | String | NULLABLE | Analytics tracking ID |

**Indexes:**
- PRIMARY KEY on `id`
- UNIQUE INDEX on `externalId`

---

### 2. invoices

**Purpose:** Invoice header information

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | String | PRIMARY KEY, CUID | Unique identifier |
| documentId | String | UNIQUE, FOREIGN KEY | References documents.id |
| invoiceId | String | NOT NULL | Invoice number |
| invoiceDate | DateTime | NOT NULL | Invoice issue date |
| deliveryDate | DateTime | NULLABLE | Delivery date |

**Relationships:**
- `documentId` → `documents.id` (CASCADE DELETE)

**Indexes:**
- PRIMARY KEY on `id`
- UNIQUE INDEX on `documentId`
- INDEX on `invoiceDate` (for trend queries)

---

### 3. vendors

**Purpose:** Vendor/supplier information

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | String | PRIMARY KEY, CUID | Unique identifier |
| documentId | String | UNIQUE, FOREIGN KEY | References documents.id |
| vendorName | String | NOT NULL | Vendor company name |
| vendorAddress | String | NOT NULL | Vendor address |
| vendorTaxId | String | NULLABLE | Tax identification number |
| vendorPartyNumber | String | NULLABLE | Vendor party/account number |

**Relationships:**
- `documentId` → `documents.id` (CASCADE DELETE)

**Indexes:**
- PRIMARY KEY on `id`
- UNIQUE INDEX on `documentId`
- INDEX on `vendorName` (for search/grouping)

---

### 4. customers

**Purpose:** Customer information

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | String | PRIMARY KEY, CUID | Unique identifier |
| documentId | String | UNIQUE, FOREIGN KEY | References documents.id |
| customerName | String | NOT NULL | Customer name |
| customerAddress | String | NOT NULL | Customer address |
| customerTaxId | String | NULLABLE | Customer tax ID |

**Relationships:**
- `documentId` → `documents.id` (CASCADE DELETE)

---

### 5. payments

**Purpose:** Payment terms and banking details

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | String | PRIMARY KEY, CUID | Unique identifier |
| documentId | String | UNIQUE, FOREIGN KEY | References documents.id |
| dueDate | DateTime | NULLABLE | Payment due date |
| paymentTerms | String | NULLABLE | Payment terms description |
| bankAccountNumber | String | NULLABLE | Bank account number |
| bic | String | NULLABLE | Bank Identifier Code |
| accountName | String | NULLABLE | Account holder name |
| netDays | Int | NULLABLE | Net payment days |
| discountPercentage | Float | NULLABLE | Early payment discount % |
| discountDays | Int | NULLABLE | Days for discount eligibility |
| discountDueDate | DateTime | NULLABLE | Discount expiration date |

**Relationships:**
- `documentId` → `documents.id` (CASCADE DELETE)

**Indexes:**
- INDEX on `dueDate` (for cash flow forecasting)

---

### 6. summaries

**Purpose:** Invoice totals and financial summary

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | String | PRIMARY KEY, CUID | Unique identifier |
| documentId | String | UNIQUE, FOREIGN KEY | References documents.id |
| documentType | String | NULLABLE | Document type (e.g., "invoice") |
| subTotal | Float | NOT NULL | Subtotal before tax |
| totalTax | Float | NOT NULL | Total tax amount |
| invoiceTotal | Float | NOT NULL | Grand total |
| currencySymbol | String | NULLABLE | Currency (e.g., "EUR", "€") |

**Relationships:**
- `documentId` → `documents.id` (CASCADE DELETE)

**Indexes:**
- INDEX on `invoiceTotal` (for aggregations)

---

### 7. line_items

**Purpose:** Individual invoice line items with category codes

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | String | PRIMARY KEY, CUID | Unique identifier |
| documentId | String | FOREIGN KEY | References documents.id |
| srNo | Int | NOT NULL | Line item sequence number |
| description | String | NOT NULL | Item description |
| quantity | Float | NOT NULL | Quantity ordered |
| unitPrice | Float | NOT NULL | Price per unit |
| totalPrice | Float | NOT NULL | Line total (qty × price) |
| sachkonto | String | NULLABLE | GL account code (category) |
| buschluessel | String | NULLABLE | Business key/posting key |
| vatRate | Float | NULLABLE | VAT/tax rate percentage |
| vatAmount | Float | NULLABLE | VAT/tax amount |

**Relationships:**
- `documentId` → `documents.id` (CASCADE DELETE)

**Indexes:**
- INDEX on `documentId` (for joins)
- INDEX on `sachkonto` (for category grouping)

---

## Query Patterns

### 1. Get Total Spend
```sql
SELECT SUM(invoice_total) as total_spend
FROM summaries;
```

### 2. Top Vendors by Spend
```sql
SELECT 
  v.vendor_name,
  SUM(s.invoice_total) as total_spend
FROM vendors v
JOIN documents d ON v.document_id = d.id
JOIN summaries s ON s.document_id = d.id
GROUP BY v.vendor_name
ORDER BY total_spend DESC
LIMIT 10;
```

### 3. Monthly Invoice Trends
```sql
SELECT 
  TO_CHAR(i.invoice_date, 'YYYY-MM') as month,
  COUNT(*) as volume,
  SUM(s.invoice_total) as value
FROM invoices i
JOIN summaries s ON s.document_id = i.document_id
GROUP BY month
ORDER BY month;
```

### 4. Spend by Category
```sql
SELECT 
  li.sachkonto as category,
  SUM(li.total_price) as spend
FROM line_items li
WHERE li.sachkonto IS NOT NULL
GROUP BY li.sachkonto
ORDER BY spend DESC;
```

### 5. Cash Outflow Forecast
```sql
SELECT 
  TO_CHAR(p.due_date, 'YYYY-MM') as month,
  SUM(s.invoice_total) as amount
FROM payments p
JOIN summaries s ON s.document_id = p.document_id
WHERE p.due_date IS NOT NULL
GROUP BY month
ORDER BY month;
```

---

## Data Integrity Rules

### Referential Integrity
- All child tables have `ON DELETE CASCADE` on `documentId`
- Deleting a document removes all related data

### Data Validation
- All monetary values are stored as Float (consider Decimal for production)
- Dates are stored as DateTime in ISO 8601 format
- Category codes (sachkonto) are stored as strings to preserve leading zeros

### Normalization
- **1NF:** No repeating groups (line items in separate table)
- **2NF:** No partial dependencies (all attributes depend on full key)
- **3NF:** No transitive dependencies (vendor info not in invoice table)

---

## Migration History

### Initial Schema
```bash
npm run db:push
```

Creates all tables based on `prisma/schema.prisma`

### Seeding
```bash
npm run db:seed
```

Populates database from `Analytics_Test_Data.json`

---

## Performance Considerations

### Recommended Indexes
```sql
-- For dashboard queries
CREATE INDEX idx_invoices_date ON invoices(invoice_date);
CREATE INDEX idx_summaries_total ON summaries(invoice_total);
CREATE INDEX idx_payments_due ON payments(due_date);

-- For search/filtering
CREATE INDEX idx_vendors_name ON vendors(vendor_name);
CREATE INDEX idx_lineitems_category ON line_items(sachkonto);

-- For joins
CREATE INDEX idx_all_documentid ON documents(id);
```

### Query Optimization
- Use `SELECT` specific columns instead of `SELECT *`
- Leverage indexes for WHERE and JOIN conditions
- Consider materialized views for complex aggregations

---

## Backup & Recovery

### Neon Database
- Automatic point-in-time recovery (last 7 days on free tier)
- Database branching for safe testing
- Connection pooling built-in

### Manual Backup
```bash
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql
```

### Restore
```bash
psql $DATABASE_URL < backup_20251108.sql
```
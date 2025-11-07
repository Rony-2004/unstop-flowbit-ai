# Analytics Dashboard Backend

A Node.js/Express backend API for the analytics dashboard with Prisma ORM and PostgreSQL.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up your PostgreSQL database (Neon recommended):
   - Create a new database in Neon
   - Copy the connection string

3. Configure environment variables:
   - Copy `.env.example` to `.env`
   - Update `DATABASE_URL` with your Neon connection string

4. Generate Prisma client and push schema:
```bash
npm run db:generate
npm run db:push
```

5. Seed the database with test data:
```bash
npm run db:seed
```

6. Start the development server:
```bash
npm run dev
```

## API Endpoints

- `GET /api/stats` - Dashboard overview statistics
- `GET /api/invoice-trends` - Monthly invoice volume and spend trends
- `GET /api/vendors` - Top 10 vendors by spend
- `GET /api/category-spend` - Spend by category (Sachkonto)
- `GET /api/cash-outflow` - Expected cash outflow by month
- `GET /api/invoices` - Paginated invoice list with search
- `POST /api/chat-with-data` - AI chat interface (placeholder)

## Database Schema

The database consists of 7 main tables:
- `Document` - Core document metadata
- `Invoice` - Invoice header information
- `Vendor` - Vendor details
- `Customer` - Customer details
- `Payment` - Payment terms and due dates
- `Summary` - Invoice totals and taxes
- `LineItem` - Individual line items with categories

## Development

- Uses TypeScript for type safety
- Express.js for REST API
- Prisma ORM for database operations
- CORS enabled for frontend integration
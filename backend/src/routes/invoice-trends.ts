import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

router.get('/', async (req, res) => {
  try {
    // Get monthly invoice trends - count and total spend by month
    const trends: any[] = await prisma.$queryRaw`
      SELECT
        TO_CHAR("invoiceDate", 'YYYY-MM') as month,
        COUNT(*)::int as volume,
        SUM("invoiceTotal")::float as value
      FROM invoices i
      JOIN summaries s ON i."documentId" = s."documentId"
      GROUP BY TO_CHAR("invoiceDate", 'YYYY-MM')
      ORDER BY month ASC
      LIMIT 12
    `;

    res.json(trends);
  } catch (error) {
    console.error('Error fetching invoice trends:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export { router as trendsRouter };
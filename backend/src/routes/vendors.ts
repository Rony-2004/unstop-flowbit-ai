import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

router.get('/top10', async (req, res) => {
  try {
    // Get top 10 vendors by total spend
    const topVendors: any[] = await prisma.$queryRaw`
      SELECT
        v."vendorName" as "vendorName",
        SUM(s."invoiceTotal")::float as "totalSpend"
      FROM vendors v
      JOIN summaries s ON v."documentId" = s."documentId"
      GROUP BY v."vendorName"
      ORDER BY "totalSpend" DESC
      LIMIT 10
    `;

    res.json(topVendors);
  } catch (error) {
    console.error('Error fetching top vendors:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export { router as vendorsRouter };
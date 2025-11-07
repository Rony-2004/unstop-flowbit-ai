import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

router.get('/', async (req, res) => {
  try {
    // Group spend by Sachkonto (account code) as categories
    const categorySpend: any[] = await prisma.$queryRaw`
      SELECT
        COALESCE(li."sachkonto", 'Uncategorized') as category,
        SUM(li."totalPrice")::float as spend
      FROM line_items li
      GROUP BY li."sachkonto"
      ORDER BY spend DESC
      LIMIT 10
    `;

    res.json(categorySpend);
  } catch (error) {
    console.error('Error fetching category spend:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export { router as categorySpendRouter };
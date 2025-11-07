import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

router.get('/', async (req, res) => {
  try {
    const statusData: any[] = await prisma.$queryRaw`
      SELECT
        p."paymentTerms" as status,
        COUNT(*)::int as count
      FROM payments p
      WHERE p."paymentTerms" IS NOT NULL
      GROUP BY p."paymentTerms"
      ORDER BY count DESC
    `;

    res.json(statusData);
  } catch (error) {
    console.error('Error fetching payment status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export { router as paymentStatusRouter };

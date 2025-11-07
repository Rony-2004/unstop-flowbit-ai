import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

router.get('/', async (req, res) => {
  try {
    // Get cash outflow forecast based on payment due dates
    const cashOutflow: any[] = await prisma.$queryRaw`
      SELECT
        TO_CHAR(p."dueDate", 'YYYY-MM') as month,
        SUM(s."invoiceTotal")::float as amount
      FROM payments p
      JOIN summaries s ON p."documentId" = s."documentId"
      WHERE p."dueDate" IS NOT NULL
      GROUP BY TO_CHAR(p."dueDate", 'YYYY-MM')
      ORDER BY month ASC
      LIMIT 12
    `;

    res.json(cashOutflow);
  } catch (error) {
    console.error('Error fetching cash outflow:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export { router as cashOutflowRouter };
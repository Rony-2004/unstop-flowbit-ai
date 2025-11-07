import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

router.get('/', async (req, res) => {
  try {
    // Get total spend (sum of all invoice totals)
    const totalSpendResult = await prisma.summary.aggregate({
      _sum: {
        invoiceTotal: true,
      },
    });

    // Get total invoices processed (count of documents)
    const totalInvoices = await prisma.document.count({
      where: {
        status: 'processed',
      },
    });

    // Get documents uploaded (count of all documents)
    const documentsUploaded = await prisma.document.count();

    // Get average invoice value
    const avgInvoiceResult = await prisma.summary.aggregate({
      _avg: {
        invoiceTotal: true,
      },
    });

    const stats = {
      totalSpend: totalSpendResult._sum.invoiceTotal || 0,
      totalInvoices: totalInvoices,
      totalDocuments: documentsUploaded,
      averageInvoiceValue: avgInvoiceResult._avg.invoiceTotal || 0,
    };

    res.json(stats);
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export { router as statsRouter };
import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

router.get('/', async (req, res) => {
  try {
    const { search, status, limit = '50', offset = '0' } = req.query;

    let whereClause: any = {};

    // Add search filter
    if (search) {
      whereClause.OR = [
        { invoice: { invoiceId: { contains: search as string, mode: 'insensitive' } } },
        { vendor: { vendorName: { contains: search as string, mode: 'insensitive' } } },
        { customer: { customerName: { contains: search as string, mode: 'insensitive' } } },
      ];
    }

    // Add status filter
    if (status) {
      whereClause.status = status;
    }

    const invoices = await prisma.document.findMany({
      where: whereClause,
      include: {
        invoice: true,
        vendor: true,
        customer: true,
        summary: true,
        payment: true,
      },
      take: parseInt(limit as string),
      skip: parseInt(offset as string),
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Transform the data to match the expected format
    const transformedInvoices = invoices.map((doc: any) => ({
      id: doc.id,
      invoiceId: doc.invoice?.invoiceId,
      vendor: doc.vendor?.vendorName,
      date: doc.invoice?.invoiceDate,
      amount: doc.summary?.invoiceTotal,
      status: doc.status,
      customer: doc.customer?.customerName,
    }));

    res.json({
      invoices: transformedInvoices,
      total: await prisma.document.count({ where: whereClause }),
    });
  } catch (error) {
    console.error('Error fetching invoices:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export { router as invoicesRouter };
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

// DELETE invoice by ID
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if invoice exists
    const existingDoc = await prisma.document.findUnique({
      where: { id },
    });

    if (!existingDoc) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    // Delete the invoice (this will cascade delete related records based on schema)
    await prisma.document.delete({
      where: { id },
    });

    res.json({ message: 'Invoice deleted successfully' });
  } catch (error) {
    console.error('Error deleting invoice:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// UPDATE invoice by ID
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, vendor, customer, amount } = req.body;

    console.log('PUT /api/invoices/:id called with:', { id, status });

    // Check if invoice exists
    const existingDoc = await prisma.document.findUnique({
      where: { id },
      include: {
        invoice: true,
        vendor: true,
        customer: true,
        summary: true,
      },
    });

    if (!existingDoc) {
      console.log('Invoice not found:', id);
      return res.status(404).json({ error: 'Invoice not found' });
    }

    console.log('Found invoice:', existingDoc.id);

    // Update document status if provided
    const updateData: any = {};
    if (status) {
      updateData.status = status;
    }

    console.log('Updating with:', updateData);

    // Update the document
    const updatedDoc = await prisma.document.update({
      where: { id },
      data: updateData,
      include: {
        invoice: true,
        vendor: true,
        customer: true,
        summary: true,
        payment: true,
      },
    });

    console.log('Updated successfully');

    // Transform response
    const transformedInvoice = {
      id: updatedDoc.id,
      invoiceId: updatedDoc.invoice?.invoiceId,
      vendor: updatedDoc.vendor?.vendorName,
      date: updatedDoc.invoice?.invoiceDate,
      amount: updatedDoc.summary?.invoiceTotal,
      status: updatedDoc.status,
      customer: updatedDoc.customer?.customerName,
    };

    res.json(transformedInvoice);
  } catch (error) {
    console.error('Error updating invoice:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export { router as invoicesRouter };
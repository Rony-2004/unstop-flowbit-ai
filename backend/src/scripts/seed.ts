import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface RawDocument {
  _id: string;
  name: string;
  filePath: string;
  fileSize: { $numberLong: string };
  fileType: string;
  status: string;
  organizationId: string;
  departmentId: string;
  createdAt: { $date: string };
  updatedAt: { $date: string };
  processedAt?: { $date: string };
  analyticsId?: string;
  metadata: any;
  extractedData: {
    llmData: {
      invoice?: any;
      vendor?: any;
      customer?: any;
      payment?: any;
      summary?: any;
      lineItems?: any;
    };
  };
}

async function seedDatabase() {
  try {
    console.log('Clearing existing data...');
    await prisma.lineItem.deleteMany();
    await prisma.summary.deleteMany();
    await prisma.payment.deleteMany();
    await prisma.customer.deleteMany();
    await prisma.vendor.deleteMany();
    await prisma.invoice.deleteMany();
    await prisma.document.deleteMany();

    console.log('Reading data file...');
    const dataPath = path.join(__dirname, '../Analytics_Test_Data.json');
    const rawData = fs.readFileSync(dataPath, 'utf-8');
    const documents: RawDocument[] = JSON.parse(rawData);

    console.log(`Processing ${documents.length} documents...`);

    for (const doc of documents) {
      console.log(`Processing document: ${doc._id}`);

      // Create document
      const document = await prisma.document.create({
        data: {
          externalId: doc._id,
          name: doc.name,
          filePath: doc.filePath,
          fileSize: doc.fileSize.$numberLong,
          fileType: doc.fileType,
          status: doc.status,
          organizationId: doc.organizationId,
          departmentId: doc.departmentId,
          createdAt: new Date(doc.createdAt.$date),
          updatedAt: new Date(doc.updatedAt.$date),
          processedAt: doc.processedAt ? new Date(doc.processedAt.$date) : null,
          analyticsId: doc.analyticsId,
        },
      });

      const llmData = doc.extractedData.llmData;

      // Create invoice if exists
      if (llmData.invoice?.value) {
        const invoiceData = llmData.invoice.value;
        await prisma.invoice.create({
          data: {
            documentId: document.id,
            invoiceId: invoiceData.invoiceId?.value || '',
            invoiceDate: new Date(invoiceData.invoiceDate?.value || new Date()),
            deliveryDate: invoiceData.deliveryDate?.value ? new Date(invoiceData.deliveryDate.value) : null,
          },
        });
      }

      // Create vendor if exists
      if (llmData.vendor?.value) {
        const vendorData = llmData.vendor.value;
        await prisma.vendor.create({
          data: {
            documentId: document.id,
            vendorName: vendorData.vendorName?.value || '',
            vendorAddress: vendorData.vendorAddress?.value || '',
            vendorTaxId: vendorData.vendorTaxId?.value,
            vendorPartyNumber: vendorData.vendorPartyNumber?.value,
          },
        });
      }

      // Create customer if exists
      if (llmData.customer?.value) {
        const customerData = llmData.customer.value;
        await prisma.customer.create({
          data: {
            documentId: document.id,
            customerName: customerData.customerName?.value || '',
            customerAddress: customerData.customerAddress?.value || '',
            customerTaxId: customerData.customerTaxId?.value,
          },
        });
      }

      // Create payment if exists
      if (llmData.payment?.value) {
        const paymentData = llmData.payment.value;
        await prisma.payment.create({
          data: {
            documentId: document.id,
            dueDate: paymentData.dueDate?.value ? new Date(paymentData.dueDate.value) : null,
            paymentTerms: paymentData.paymentTerms?.value,
            bankAccountNumber: paymentData.bankAccountNumber?.value,
            bic: paymentData.BIC?.value,
            accountName: paymentData.accountName?.value,
            netDays: paymentData.netDays?.value,
            discountPercentage: paymentData.discountPercentage?.value ? parseFloat(paymentData.discountPercentage.value) : null,
            discountDays: paymentData.discountDays?.value,
            discountDueDate: paymentData.discountDueDate?.value ? new Date(paymentData.discountDueDate.value) : null,
          },
        });
      }

      // Create summary if exists
      if (llmData.summary?.value) {
        const summaryData = llmData.summary.value;
        await prisma.summary.create({
          data: {
            documentId: document.id,
            documentType: summaryData.documentType?.value,
            subTotal: parseFloat(summaryData.subTotal?.value || '0'),
            totalTax: parseFloat(summaryData.totalTax?.value || '0'),
            invoiceTotal: parseFloat(summaryData.invoiceTotal?.value || '0'),
            currencySymbol: summaryData.currencySymbol?.value,
          },
        });
      }

      // Create line items if exist
      if (llmData.lineItems?.value?.items?.value) {
        const lineItems = llmData.lineItems.value.items.value;
        for (const item of lineItems) {
          await prisma.lineItem.create({
            data: {
              documentId: document.id,
              srNo: item.srNo?.value || 0,
              description: item.description?.value || '',
              quantity: parseFloat(item.quantity?.value || '0'),
              unitPrice: parseFloat(item.unitPrice?.value || '0'),
              totalPrice: parseFloat(item.totalPrice?.value || '0'),
              sachkonto: item.Sachkonto?.value ? String(item.Sachkonto.value) : null,
              buschluessel: item.BUSchluessel?.value ? String(item.BUSchluessel.value) : null,
              vatRate: item.vatRate?.value ? parseFloat(item.vatRate.value) : null,
              vatAmount: item.vatAmount?.value ? parseFloat(item.vatAmount.value) : null,
            },
          });
        }
      }
    }

    console.log('Seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedDatabase();
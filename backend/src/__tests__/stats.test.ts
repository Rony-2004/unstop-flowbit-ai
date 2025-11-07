import request from 'supertest';
import express from 'express';
import { statsRouter } from '../routes/stats';

const app = express();
app.use(express.json());
app.use('/api/stats', statsRouter);

describe('Stats API', () => {
  it('should return stats data', async () => {
    const response = await request(app)
      .get('/api/stats')
      .expect(200);

    expect(response.body).toHaveProperty('totalSpend');
    expect(response.body).toHaveProperty('totalInvoices');
    expect(response.body).toHaveProperty('totalDocuments');
    expect(response.body).toHaveProperty('averageInvoiceValue');
    
    expect(typeof response.body.totalSpend).toBe('number');
    expect(typeof response.body.totalInvoices).toBe('number');
  });

  it('should return valid numeric values', async () => {
    const response = await request(app)
      .get('/api/stats')
      .expect(200);

    expect(response.body.totalSpend).toBeGreaterThanOrEqual(0);
    expect(response.body.totalInvoices).toBeGreaterThanOrEqual(0);
    expect(response.body.totalDocuments).toBeGreaterThanOrEqual(0);
  });
});

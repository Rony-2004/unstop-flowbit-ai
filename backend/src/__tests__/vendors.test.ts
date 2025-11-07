import request from 'supertest';
import express from 'express';
import { vendorsRouter } from '../routes/vendors';

const app = express();
app.use(express.json());
app.use('/api/vendors', vendorsRouter);

describe('Vendors API', () => {
  it('should return top 10 vendors', async () => {
    const response = await request(app)
      .get('/api/vendors/top10')
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeLessThanOrEqual(10);
  });

  it('should return vendors with required fields', async () => {
    const response = await request(app)
      .get('/api/vendors/top10')
      .expect(200);

    if (response.body.length > 0) {
      const vendor = response.body[0];
      expect(vendor).toHaveProperty('vendorName');
      expect(vendor).toHaveProperty('totalSpend');
      expect(typeof vendor.totalSpend).toBe('number');
    }
  });

  it('should return vendors ordered by spend descending', async () => {
    const response = await request(app)
      .get('/api/vendors/top10')
      .expect(200);

    if (response.body.length > 1) {
      for (let i = 0; i < response.body.length - 1; i++) {
        expect(response.body[i].totalSpend).toBeGreaterThanOrEqual(
          response.body[i + 1].totalSpend
        );
      }
    }
  });
});

import express from 'express';
import cors from 'cors';
import { statsRouter } from './routes/stats';
import { trendsRouter } from './routes/invoice-trends';
import { vendorsRouter } from './routes/vendors';
import { categorySpendRouter } from './routes/category-spend';
import { cashOutflowRouter } from './routes/cash-outflow';
import { invoicesRouter } from './routes/invoices';
import { chatWithDataRouter } from './routes/chat-with-data';
import { paymentStatusRouter } from './routes/payment-status';

const app = express();
const PORT = parseInt(process.env.PORT || '3001', 10);

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3002',
    'http://frontend:3000',
    process.env.FRONTEND_URL || '',
    /\.vercel\.app$/  // Allow all Vercel deployments
  ].filter(Boolean),
  credentials: true,
}));
app.use(express.json());

// Add logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Root route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Flowbit AI Backend API',
    status: 'running',
    version: '1.0.0',
    endpoints: [
      'GET /api/health',
      'GET /api/stats',
      'GET /api/vendors',
      'GET /api/invoices',
      'POST /api/chat-with-data'
    ]
  });
});

// Routes
app.use('/api/stats', statsRouter);
app.use('/api/invoice-trends', trendsRouter);
app.use('/api/vendors', vendorsRouter);
app.use('/api/category-spend', categorySpendRouter);
app.use('/api/cash-outflow', cashOutflowRouter);
app.use('/api/invoices', invoicesRouter);
app.use('/api/chat-with-data', chatWithDataRouter);
app.use('/api/payment-status', paymentStatusRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Only listen if not in Vercel environment
if (process.env.VERCEL !== '1') {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}

// Export for Vercel serverless
module.exports = app;
export default app;
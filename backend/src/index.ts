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
    'http://frontend:3000',
    process.env.FRONTEND_URL || ''
  ].filter(Boolean),
  credentials: true,
}));
app.use(express.json());

// Add logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
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

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
import express from 'express';
import cors from 'cors';
import authRouter from './routes/auth.js';
import inventoryRouter from './routes/inventory.js';
import customersRouter from './routes/customers.js';
import vendorsRouter from './routes/vendors.js';
import receivablesRouter from './routes/receivables.js';
import payablesRouter from './routes/payables.js';
import expensesRouter from './routes/expenses.js';
import goalsRouter from './routes/goals.js';
import notificationsRouter from './routes/notifications.js';
import ocrRouter from './routes/ocr.js';
import saasRouter from './routes/saas.js';
import forecastRouter from './routes/forecast.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRouter);
app.use('/api/inventory', inventoryRouter);
app.use('/api/customers', customersRouter);
app.use('/api/vendors', vendorsRouter);
app.use('/api/receivables', receivablesRouter);
app.use('/api/payables', payablesRouter);
app.use('/api/expenses', expensesRouter);
app.use('/api/goals', goalsRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/ocr', ocrRouter);
app.use('/api/saas', saasRouter);
app.use('/api/inventory/forecast', forecastRouter);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Nexora API server running on http://localhost:${PORT}`);
});

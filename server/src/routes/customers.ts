import { Router } from 'express';
import type { Customer, Notification } from '../types.js';
import { seedCustomers } from '../data/seed.js';

const router = Router();

let customers: Customer[] = [...seedCustomers];
let nextId = customers.length + 1;

router.get('/', (_req, res) => {
  res.json(customers);
});

router.post('/', (req, res) => {
  const { name, email, outstanding = 0, lastPaymentDate = new Date().toISOString().split('T')[0] } = req.body;
  if (!name || !email) {
    res.status(400).json({ error: 'Name and email are required' });
    return;
  }
  const newCustomer: Customer = {
    id: `c${nextId++}`,
    name,
    email,
    outstanding,
    lastPaymentDate,
  };
  customers.push(newCustomer);

  // Auto-generate welcome notification
  const notification: Notification = {
    id: `n${Date.now()}`,
    title: `Customer Registered: ${name}`,
    description: `${name} (${email}) has been registered successfully.`,
    type: 'reminder_sent',
    timestamp: 'Just now',
    read: false,
  };

  res.status(201).json({ customer: newCustomer, notification });
});

router.put('/:id', (req, res) => {
  const idx = customers.findIndex(c => c.id === req.params.id);
  if (idx === -1) { res.status(404).json({ error: 'Not found' }); return; }
  customers[idx] = { ...customers[idx], ...req.body };
  res.json(customers[idx]);
});

router.delete('/:id', (req, res) => {
  const idx = customers.findIndex(c => c.id === req.params.id);
  if (idx === -1) { res.status(404).json({ error: 'Not found' }); return; }
  customers.splice(idx, 1);
  res.json({ success: true });
});

export default router;

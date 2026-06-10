import { Router } from 'express';
import type { Notification, Receivable } from '../types.js';
import { seedReceivables } from '../data/seed.js';
import { seedNotifications } from '../data/seed.js';

const router = Router();

let receivables: Receivable[] = [...seedReceivables];
let notifications: Notification[] = [...seedNotifications];

router.get('/', (_req, res) => {
  res.json(receivables);
});

router.post('/:id/remind', (req, res) => {
  const target = receivables.find(r => r.id === req.params.id);
  if (!target) { res.status(404).json({ error: 'Not found' }); return; }

  const newNotif: Notification = {
    id: `n${notifications.length + 1}`,
    title: `Reminder Sent to ${target.customerName}`,
    description: `Automated WhatsApp & Email notice dispatched for ₹${target.amount.toLocaleString()}.`,
    type: 'reminder_sent',
    timestamp: 'Just now',
    read: false,
  };
  notifications.unshift(newNotif);

  res.json({ notification: newNotif });
});

export default router;

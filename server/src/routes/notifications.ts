import { Router } from 'express';
import type { Notification } from '../types.js';
import { seedNotifications } from '../data/seed.js';

const router = Router();

let notifications: Notification[] = [...seedNotifications];

router.get('/', (_req, res) => {
  res.json(notifications);
});

router.put('/:id/read', (req, res) => {
  const idx = notifications.findIndex(n => n.id === req.params.id);
  if (idx === -1) { res.status(404).json({ error: 'Not found' }); return; }
  notifications[idx].read = true;
  res.json(notifications[idx]);
});

export default router;
